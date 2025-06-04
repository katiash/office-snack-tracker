import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// 🔥 Parse and initialize Firebase Admin
if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
  const parsed = JSON.parse(raw);
  parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { uid, requesterUid, action } = req.body;

  try {
    const requester = await admin.auth().getUser(requesterUid);
    const isRequesterAdmin = requester.customClaims?.admin === true;

    if (!isRequesterAdmin) {
      return res.status(403).json({ error: 'Only admins can set admin claims.' });
    }
    console.log('📩 Incoming body:', req.body);
    console.log('🔍 Requester:', requester.email, 'isAdmin:', isRequesterAdmin);

    // ✅ Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      isAdmin: action === 'promote' });

    //🔥 New: Sync to Firestore user document
    const db = getFirestore();
    console.log(`🔥 Updating Firestore: /users/${uid} → isAdmin: ${action === 'promote'}`);
    await db.collection('users').doc(uid).update({
      isAdmin: action === 'promote'
    });
    console.log('✅ Firestore updated successfully');
    return res.status(200).json({ success: true });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Firestore update failed:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}