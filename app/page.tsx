'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEnsureUserDoc } from '@/hooks/useEnsureUserDoc';
import SnackForm from '@/components/SnackForm';
import AuthGuard from '@/components/AuthGuard';
import YourSnackSummary from '@/components/YourSnackSummary';

export default function Home() {
  useEnsureUserDoc(); // ✅ ensures Firestore doc exists

  const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);
  const [refreshSummary, setRefreshSummary] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? { uid: user.uid } : null);
    });
    return () => unsubscribe();
  }, []);


  return (
    <main className="min-h-screen bg-orange-50 py-10 px-4 sm:px-6 md:px-8">
      <AuthGuard>
        <div className="max-w-md mx-auto space-y-6">
          <SnackForm
            onLogSubmitted={() => {
              setRefreshSummary((prev) => !prev); // toggle to trigger refresh
            }}
          />
          {currentUser && (
            <YourSnackSummary refreshTrigger={refreshSummary} />
          )}
        </div>
      </AuthGuard>
    </main>
  );
}
