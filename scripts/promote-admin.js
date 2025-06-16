// scripts/promote-admin.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load and parse service account key from file
const filePath = path.join(__dirname, "../service-account-key.json");
const raw = fs.readFileSync(filePath, "utf8");
const serviceAccount = JSON.parse(raw);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get UID from CLI argument
const targetUid = process.argv[2];
if (!targetUid) {
  console.error("❌ Please provide a UID: node scripts/promote-admin.js <uid>");
  process.exit(1);
}

// Set custom claims
admin.auth().setCustomUserClaims(targetUid, { isAdmin: true })
  .then(() => {
    console.log(`✅ Successfully promoted UID ${targetUid} to admin`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error setting admin claim:", error);
    process.exit(1);
  });
