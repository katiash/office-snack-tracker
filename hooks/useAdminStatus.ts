'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAdminStatus(enabled: boolean = true) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsAdmin(false);
      setUser(null);
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // ✅ Force refresh token to pull latest claims
        const freshToken = await currentUser.getIdToken(true);
        console.log('🔁 Fresh ID token (forced):', freshToken);

        const tokenResult = await currentUser.getIdTokenResult();
        console.log('🧾 Token claims:', tokenResult.claims);

        setUser(currentUser);
        setIsAdmin(!!tokenResult.claims.isAdmin);
      } catch (err) {
        console.error('❌ Error fetching token claims:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    const unsubscribe = onAuthStateChanged(auth, () => {
      checkAdmin();
    });

    return () => unsubscribe();
  }, [enabled]);

  return { isAdmin, user, loading };
}
