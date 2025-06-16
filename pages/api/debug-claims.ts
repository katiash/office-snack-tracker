// /pages/api/debug-claims.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
  const parsed = JSON.parse(raw);
  parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uid = req.query.uid as string;
  if (!uid) return res.status(400).json({ error: 'Missing uid parameter' });

  try {
    const user = await admin.auth().getUser(uid);
    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      customClaims: user.customClaims || {},
    });
  } catch (error) {
    console.error('❌ Failed to fetch user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}
// This API endpoint retrieves a user's custom claims by their UID.
// It returns the user's UID, email, and any custom claims they have set.
// If the user does not exist or an error occurs, it returns a 500 status with an error message.
// This is useful for debugging and verifying user roles in your application.
// Make sure to secure this endpoint in production, as it exposes user data.
// You might want to add authentication checks to ensure only authorized users can access this endpoint.
// Remember to test this endpoint thoroughly to ensure it behaves as expected in different scenarios.
// You can call this endpoint from your frontend like this:
// fetch(`/api/debug-claims?uid=${userUid}`) OR
// http://localhost:3000/api/debug-claims?uid=PUT_UID_HERE
