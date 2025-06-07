
/**
 * syncAdminClaims.js
 * Smart sync between Firestore `isAdmin` fields and Firebase custom claims
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const args = process.argv.slice(2);
const dryRun = args.includes('--dryRun');
const syncMissingFirestoreFromClaim = args.includes('--syncMissingFirestoreFromClaim');

const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log(dryRun ? '🚨 DRY RUN MODE ENABLED' : '🚀 LIVE MODE');

  const usersSnap = await db.collection('users').get();
  const firestoreUsers = {};
  usersSnap.forEach(doc => {
    firestoreUsers[doc.id] = doc.data();
  });

  const alreadyHandled = new Set();

  // First: handle users with no `isAdmin` field but claim exists
  if (syncMissingFirestoreFromClaim) {
    const listUsersResult = await auth.listUsers();
    for (const user of listUsersResult.users) {
      const firestoreData = firestoreUsers[user.uid];
      if (!firestoreData) {
        console.warn(`⚠️  Skipping ${user.email} — no Firestore record.`);
        continue;
      }

      if (!('isAdmin' in firestoreData)) {
        const claim = user.customClaims?.admin || false;
        console.log(`User: ${user.email}`);
        console.log('Firestore missing isAdmin.');
        console.log(`Claim: ${claim}`);
        const answer = await askQuestion(`👉 Add isAdmin: ${claim} to Firestore? (y/n): `);
        if (answer.toLowerCase() === 'y') {
          if (!dryRun) {
            await db.collection('users').doc(user.uid).update({ isAdmin: claim });
          }
          console.log(`💡 Updated Firestore isAdmin to ${claim} (dryRun = ${dryRun})`);
          firestoreUsers[user.uid] = { ...firestoreData, isAdmin: claim };
          alreadyHandled.add(user.uid);
        }
      }
    }
  }

  const listUsersResult = await auth.listUsers();
  for (const user of listUsersResult.users) {
    if (alreadyHandled.has(user.uid)) continue;

    const firestoreData = firestoreUsers[user.uid];
    if (!firestoreData) {
      console.warn(`⚠️  Skipping ${user.email} — no Firestore record.`);
      continue;
    }

    const claim = user.customClaims?.admin || false;
    const firestoreAdmin = firestoreData?.isAdmin ?? false;

    if (claim !== firestoreAdmin) {
      console.log(`🔄 User: ${user.email}`);
      console.log(`    Firestore isAdmin: ${firestoreAdmin}`);
      console.log(`    Current custom claim: ${claim}`);
      const answer = await askQuestion(`👉 Update custom claim to admin = ${firestoreAdmin}? (y/n): `);
      if (answer.toLowerCase() === 'y') {
        if (!dryRun) {
          await auth.setCustomUserClaims(user.uid, { admin: firestoreAdmin });
        }
        console.log(`✅ Updated custom claim to ${firestoreAdmin} (dryRun = ${dryRun})`);
      } else {
        console.log(`⏭️ Skipped ${user.email}`);
      }
    }
  }

  rl.close();
}

main();