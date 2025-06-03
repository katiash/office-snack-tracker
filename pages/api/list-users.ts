// pages/api/list-users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_ADMIN_CREDENTIALS as string
  );
  initializeApp({ credential: cert(serviceAccount) });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await getAuth().verifyIdToken(token);

    if (!decoded.admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const listUsersResult = await getAuth().listUsers();
    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      admin: user.customClaims?.admin || false,
    }));

    return res.status(200).json({ users });
  } catch (err: any) {
    console.error('Error listing users:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
