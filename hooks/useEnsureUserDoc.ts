import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export function useEnsureUserDoc() {
  useEffect(() => {
    const ensureUserExists = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create basic user profile
        await setDoc(userRef, {
          email: user.email,
          firstName: '',
          lastName: '',
          company: '',
          createdAt: new Date(),
        });
        console.log('✅ User metadata created in Firestore');
      }
    };

    ensureUserExists();
  }, []);
}