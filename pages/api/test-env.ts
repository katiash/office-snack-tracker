// 🚧 DEV ONLY — Safe to delete before production
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    envVar: process.env.FIREBASE_SERVICE_ACCOUNT?.slice(0, 80) + '...',
  });
}
