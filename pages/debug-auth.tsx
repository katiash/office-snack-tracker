// /pages/debug-auth.tsx
'use client';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { app } from '@/lib/firebase'; // <- Make sure this is the initialized Firebase app

export default function DebugAuth() {
  const [message, setMessage] = useState('Checking auth...');

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn('⚠️ No user is currently logged in.');
        setMessage('No user is currently logged in.');
        return;
      }

      try {
        const token = await user.getIdToken(true); // force refresh
        console.log('✅ Fresh token:', token);

        const tokenResult = await getIdTokenResult(user, true);
        console.log('🧾 Token claims:', tokenResult.claims);

        if (tokenResult.claims?.isAdmin) {
          setMessage('✅ You ARE an admin.');
        } else {
          setMessage('🚫 You are NOT an admin.');
        }
      } catch (err) {
        console.error('❌ Error fetching token:', err);
        setMessage('Error fetching token claims.');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-10 text-xl">
      <h1 className="font-bold mb-4">🔍 Debug Admin Token</h1>
      <p>{message}</p>
    </div>
  );
}
