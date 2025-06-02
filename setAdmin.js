const admin = require('firebase-admin');

// Replace with your Firebase project's service account key file
const serviceAccount = require('./service-account-key.json'); // You'll download this next

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = 'ekaterina.shukh@gmail.com'; // 👈 YOUR user email

admin.auth().getUserByEmail(email)
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`✅ Custom claim 'admin: true' set for ${email}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error setting admin claim:', error);
    process.exit(1);
  });
