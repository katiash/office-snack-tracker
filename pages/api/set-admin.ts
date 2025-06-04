// pages/api/set-admin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
    const parsed = JSON.parse(raw);
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
    // Can't respond here, as it's top-level code, but logs will help during deploy
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, requesterUid } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Missing or invalid email.' });
  }

  try {
    const requester = await admin.auth().getUser(requesterUid);
    const isRequesterAdmin = requester.customClaims?.admin === true;

    if (!isRequesterAdmin) {
      return res.status(403).json({ error: 'Only admins can set admin claims.' });
    }

    const targetUser = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(targetUser.uid, { admin: true });

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error setting admin:', error);
      return res.status(500).json({ error: error.message });
    } else {
      console.error('❌ Unknown error:', error);
      return res.status(500).json({ error: 'Unknown error' });
    }
  }
}