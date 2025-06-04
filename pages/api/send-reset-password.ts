// pages/api/send-reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('✅ Hit the reset password API');

  if (req.method !== 'POST') return res.status(405).end();

  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT!;
    console.log('✅ RAW (first 80 chars):', raw.slice(0, 80));
    const parsed = JSON.parse(raw);

    // 🔥 FIX: Replace escaped newlines
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');

    console.log('✅ Parsed project:', parsed.project_id);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
      });
    }

    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid email.' });
    }

    const link = await admin.auth().generatePasswordResetLink(email);
    console.log(`✅ Password reset link generated for ${email}`);
    return res.status(200).json({ success: true, link });

  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Error in reset-password API:', err.message);
      return res.status(500).json({ error: err.message });
    } else {
      console.error('❌ Unknown error:', err);
      return res.status(500).json({ error: 'Unknown error' });
    }
  }
}

// Here is a sample cURL command to test this API endpoint:
// Make sure to replace the email with a valid one (in the Authentication Users table) before running this command.
// curl -X POST http://localhost:3000/api/send-reset-password \
// -H "Content-Type: application/json" \
// -d '{"email": "ekaterina.shukh@gmail.com"}'