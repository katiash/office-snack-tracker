// 🚧 DEV ONLY — Safe to delete before production
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
    const parsed = JSON.parse(raw);
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n'); // ✅ Fix newline encoding

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
      });
    }

    const list = await admin.auth().listUsers(1); // Get 1 user from Auth
    return res.status(200).json({ success: true, user: list.users[0].email });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('🔥 Firebase Admin error:', error.message);
      return res.status(500).json({ error: error.message });
    } else {
      console.error('❌ Unknown Firebase error:', error);
      return res.status(500).json({ error: 'Unknown error' });
    }
  }
}