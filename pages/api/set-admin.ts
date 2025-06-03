import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = require('../../service-account-key.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, requesterUid } = req.body;

  try {
    // 🔐 Validate requester is an admin
    const requester = await admin.auth().getUser(requesterUid);
    const isRequesterAdmin = requester.customClaims?.admin === true;

    if (!isRequesterAdmin) {
      return res.status(403).json({ error: 'Only admins can set admin claims.' });
    }

    // 🎯 Set claim
    const targetUser = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(targetUser.uid, { admin: true });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
