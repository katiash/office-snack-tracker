// setAdmin.js

const admin = require('firebase-admin');
const readline = require('readline');
const { getFirestore } = require('firebase-admin/firestore');

// Replace with your Firebase project's service account key file
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = getFirestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function syncAdminClaimsWithPrompts() {
  let nextPageToken;
  let updatedCount = 0;
  let skippedCount = 0;

  console.log('🔄 Starting claim sync with Firestore...');

  do {
    const result = await auth.listUsers(1000, nextPageToken);

    for (const user of result.users) {
      const uid = user.uid;
      const email = user.email || '(no email)';

      const docRef = db.collection('users').doc(uid);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        console.warn(`⚠️ Skipping ${email} — no Firestore record.`);
        continue;
      }

      const data = docSnap.data();
      const firestoreAdmin = data?.isAdmin === true; // default false
      const currentClaim = user.customClaims?.admin === true;

      if (firestoreAdmin === currentClaim) {
        console.log(`➡️ Skipping ${email} — already in sync.`);
        skippedCount++;
        continue;
      }

      const defaulted = data?.hasOwnProperty('isAdmin') ? '' : ' (defaulted to false)';
      console.log(`🔧 User: ${email}`);
      console.log(`    Firestore isAdmin: ${firestoreAdmin}${defaulted}`);
      console.log(`    Current custom claim: ${currentClaim}`);

      const confirm = await ask(`    👉 Update claim to admin = ${firestoreAdmin}? (y/n): `);
      if (confirm.toLowerCase() === 'y') {
        await auth.setCustomUserClaims(uid, {
          ...user.customClaims,
          admin: firestoreAdmin,
        });
        console.log(`✅ Updated ${email}`);
        updatedCount++;
      } else {
        console.log(`⏭️ Skipped ${email}`);
        skippedCount++;
      }
    }

    nextPageToken = result.pageToken;
  } while (nextPageToken);

  rl.close();
  console.log(`\n🎉 Done. ${updatedCount} updated, ${skippedCount} skipped.`);
}

syncAdminClaimsWithPrompts().catch((err) => {
  console.error('❌ Error:', err);
  rl.close();
});