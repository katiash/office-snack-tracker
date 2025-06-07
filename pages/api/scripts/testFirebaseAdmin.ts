// scripts/testFirebaseAdmin.ts

import * as admin from 'firebase-admin';

// 🔐 Load the service account from env
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT is not defined in your env.');
  process.exit(1);
}

try {
  const parsed = JSON.parse(raw);
  parsed.private_key = parsed.private_key.replace(/\\n/g, '\n'); // 🔧 Fix newline encoding

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
  }

  // ✅ Attempt to fetch 1 user to confirm access
  admin
    .auth()
    .listUsers(1)
    .then((list) => {
      console.log('✅ Firebase Admin connected.');
      console.log('First user email:', list.users[0]?.email ?? '(none)');
    })
    .catch((err) => {
      console.error('🔥 Firebase Admin Error:', err.message);
    });
} catch (err) {
  console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
}

// 📦 To run this script:
// node -r dotenv/config scripts/testFirebaseAdmin.ts

{/* ✅ This will:
Confirm that your FIREBASE_SERVICE_ACCOUNT is loading correctly
Test Firebase Admin SDK auth access
Print the first user's email if successful */}