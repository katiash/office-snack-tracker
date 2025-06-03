// pages/api/send-reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = require('../../service-account-key.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid email.' });
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    return res.status(200).json({ success: true, link });
  } catch (err: any) {
    console.error('❌ Failed to send reset link:', err);
    return res.status(500).json({ error: err.message });
  }
}