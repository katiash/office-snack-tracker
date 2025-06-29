// pages/api/delete-logs.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// 🔥 Initialize Firebase Admin (same as in set-admin.ts)
if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
  const parsed = JSON.parse(raw);
  parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid, deleteUser, startDate, endDate } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'Missing UID' });
    }

    // Authenticate requester via ID token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Admins only' });
    }

    // Build the logs query
    let logsQuery = getFirestore().collection('snackLogs').where('userId', '==', uid);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      logsQuery = logsQuery.where('timestamp', '>=', start).where('timestamp', '<=', end);
    }

    const snapshot = await logsQuery.get();

    const batch = getFirestore().batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    if (deleteUser) {
      await admin.auth().deleteUser(uid);
      await getFirestore().collection('users').doc(uid).delete();
    }

    res.status(200).json({ success: true, deletedLogs: snapshot.size });
  } catch (error) {
    console.error('[delete-logs error]', error);
    res.status(500).json({ error: 'Server error' });
  }
}
