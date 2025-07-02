async function reconcileContact(client, email, phoneNumber) {
  const query = `
    SELECT * FROM contact
    WHERE (email = $1 OR phoneNumber = $2) AND deletedAt IS NULL
    ORDER BY createdAt ASC
  `;
  const { rows } = await client.query(query, [email, phoneNumber]);

  const allContacts = [...rows];

  let primary = null;

  for (const contact of allContacts) {
    if (contact.linkprecedence === "primary" && !primary) {
      primary = contact;
    }
  }

  if (!primary && rows.length > 0) {
    primary = rows.find((r) => r.linkprecedence === "primary") || rows[0];
  }

  // If no existing contacts is present, create a new primary
  if (!primary) {
    const insert = `
      INSERT INTO contact (email, phoneNumber, linkedId, linkprecedence)
      VALUES ($1, $2, NULL, 'primary')
      RETURNING *
    `;
    const { rows: newRows } = await client.query(insert, [email, phoneNumber]);
    const newContact = newRows[0];

    return {
      primaryContatctId: newContact.id,
      emails: [newContact.email].filter(Boolean),
      phoneNumbers: [newContact.phonenumber].filter(Boolean),
      secondaryContactIds: [],
    };
  }

  // Checking if we should create a new secondary contact
  const emailExists = rows.some((r) => r.email === email);
  const phoneExists = rows.some((r) => r.phonenumber === phoneNumber);

  const shouldCreateSecondary =
    (email && !emailExists) || (phoneNumber && !phoneExists);

  if (shouldCreateSecondary) {
    const insert = `
      INSERT INTO contact (email, phoneNumber, linkedId, linkprecedence)
      VALUES ($1, $2, $3, 'secondary')
      RETURNING *
    `;
    await client.query(insert, [email, phoneNumber, primary.id]);
  }

  // Re-fetching updated group from DB
  const contactsQuery = `
    SELECT * FROM contact
    WHERE (linkedId = $1 OR id = $1) AND deletedAt IS NULL
  `;
  const { rows: fullGroup } = await client.query(contactsQuery, [primary.id]);

  // Final email, phone, and secondary ID sets
  const emailSet = new Set();
  const phoneSet = new Set();
  const secondaryIds = [];

  for (const c of fullGroup) {
    if (c.email) emailSet.add(c.email);
    if (c.phonenumber) phoneSet.add(c.phonenumber);
    if (c.linkprecedence === "secondary") secondaryIds.push(c.id);
  }

  return {
    primaryContatctId: primary.id,
    emails: [
      primary.email,
      ...[...emailSet].filter((e) => e !== primary.email),
    ],
    phoneNumbers: [
      primary.phonenumber,
      ...[...phoneSet].filter((p) => p !== primary.phonenumber),
    ],
    secondaryContactIds: secondaryIds,
  };
}

module.exports = reconcileContact;
