
// pages/api/update-user-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
    const parsed = JSON.parse(raw);
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
      });
    }

    const { uid, newPassword } = req.body;

    if (!uid || !newPassword) {
      return res.status(400).json({ error: 'Missing uid or newPassword.' });
    }

    await admin.auth().updateUser(uid, { password: newPassword });

    return res.status(200).json({ success: true, message: `Password updated for ${uid}` });
  } catch (err) {
    console.error('❌ Error updating password:', err);
    return res.status(500).json({ error: (err as Error).message || 'Unknown error' });
  }
}
