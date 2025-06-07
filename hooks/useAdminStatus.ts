// hooks/useAdminStatus.ts
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAdminStatus(enabled: boolean = true) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 Early exit: don't run unless `enabled` is true
  // `enabled` should be set to true only when we know auth is ready (i.e. user is logged in)
  // This prevents accidental Firestore reads while Firebase is still initializing (e.g. right after logout)
    if (!enabled) {
      setIsAdmin(false);
      setUser(null);
      setLoading(false);
      return;
    }

     // ...proceed with admin check if enabled === true
    const checkAdmin = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const token = await currentUser.getIdTokenResult(true);
        setUser(currentUser);
        setIsAdmin(!!token.claims.admin);
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
