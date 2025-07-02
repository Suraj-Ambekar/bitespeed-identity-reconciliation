# 🧠 Bitespeed Backend Task: Identity Reconciliation

This project solves Bitespeed’s backend challenge to reconcile user identities across purchases using varying contact info (email/phoneNumber). The service consolidates related contacts into a unified profile using PostgreSQL and Node.js.

---

## 🔗 Hosted API

**POST** [`https://bitespeed-identity-reconciliation-uyit.onrender.com/identify`](https://bitespeed-identity-reconciliation-uyit.onrender.com/identify)

---

## 📦 Tech Stack

- Node.js (JavaScript)
- Express.js
- PostgreSQL (hosted on Render)
- Raw SQL (no ORM used)
- Hosted on [Render](https://render.com)

---

## ⚠️ Note on Render.com Hosting

The API is hosted on [Render](https://render.com), which may take a few seconds to wake up the server from sleep if inactive for a while.

👉 Before testing in Postman, open the following URL in a browser to wake up the server:

**https://bitespeed-identity-reconciliation-uyit.onrender.com/identify**

Wait for it to load once (it may take 10–15 seconds), and then proceed with Postman requests.

---

## 📌 API Usage

### ➤ POST `/identify`

#### Request Body

```json
{
  "email": "example@email.com",
  "phoneNumber": "1234567890"
}
```

#### Response Body

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@email.com", "other@email.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2, 3]
  }
}
```

---

## 🗃️ PostgreSQL Schema

```sql
CREATE TABLE Contact (
  id SERIAL PRIMARY KEY,
  phoneNumber TEXT,
  email TEXT,
  linkedId INTEGER REFERENCES Contact(id),
  linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP
);
```

---

## 🧠 Identity Reconciliation Logic

- If no match is found → create new `primary` contact.
- If email or phoneNumber matches but not both → create `secondary` contact.
- If both email and phoneNumber already exist → return existing structure.
- If multiple `primary` contacts are found → keep the oldest one as `primary`, mark others `secondary`.

---

## 🚀 Local Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/bitespeed-identity-reconciliation.git
cd bitespeed-identity-reconciliation
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root:

```
DATABASE_URL=your_postgres_connection_string
PORT=3000
```

4. Start the server:

```bash
node index.js
```

---

## 🧪 Example Test (Postman)

**POST** `/identify`  
**Host**: `https://bitespeed-identity-reconciliation-uyit.onrender.com`  
**Content-Type**: `application/json`

```json
{
  "email": "george@hillvalley.edu",
  "phoneNumber": "717171"
}
```
