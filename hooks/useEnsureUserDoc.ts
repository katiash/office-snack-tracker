import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export function useEnsureUserDoc() {

  useEffect(() => {
    const ensureUserExists = async () => {
      const user = auth.currentUser;

      if (!user || !user.uid || !user.email) return; // ✅ Guard clause

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create basic user profile
        try {
          await setDoc(userRef, {
            email: user.email,
            firstName: '',
            lastName: '',
            company: '',
            createdAt: new Date(),
            isAdmin: false,// ✅ Explicit default
          });
        console.log('✅ User metadata created in Firestore');
        }catch (error) {
          console.error('🔥 Error creating user doc/metadata:', error);
        }
      }
    };

    if (auth.currentUser) ensureUserExists(); // ✅ Call only if currentUser exists
  }, []);
}