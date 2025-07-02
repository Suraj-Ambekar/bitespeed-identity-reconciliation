const express = require("express");
const pool = require("../db");
const reconcileContact = require("../utils/reconcile");

const router = express.Router();

router.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res
      .status(400)
      .json({ error: "Either email or phoneNumber is required" });
  }

  try {
    const client = await pool.connect();
    const result = await reconcileContact(client, email, phoneNumber);
    client.release();
    res.status(200).json({ contact: result });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
