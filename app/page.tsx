'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { SnackLog } from '@/types';
import { useEnsureUserDoc } from '@/hooks/useEnsureUserDoc';
import SnackForm from '@/components/SnackForm';
import AuthGuard from '@/components/AuthGuard';

export default function Home() {
  useEnsureUserDoc(); // ✅ ensures Firestore doc exists

  const [snackLogs, setSnackLogs] = useState<SnackLog[]>([]);
  const [userTotalOwed, setUserTotalOwed] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? { uid: user.uid } : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      const snap = await getDocs(collection(db, 'snackLogs'));
      const logs = snap.docs.map((doc) => doc.data()) as SnackLog[];
      setSnackLogs(logs);

      if (currentUser) {
        const total = logs
          .filter((log) => log.userId === currentUser.uid)
          .reduce((sum, log) => sum + (log.total || 0), 0);
        setUserTotalOwed(total);
      }
    };

    fetchLogs();
  }, [currentUser]);

  const userLogs = currentUser
    ? snackLogs.filter((log) => log.userId === currentUser.uid)
    : [];

  const totalItems = userLogs.reduce((sum, log) => sum + (log.count || 0), 0);

  return (
    <main className="min-h-screen bg-orange-50 py-10">
      <AuthGuard>
        <SnackForm
          onLogSubmitted={(newLog) => {
            setSnackLogs((prev) => [
              ...prev,
              {
                ...newLog,
                timestamp:
                  newLog.timestamp instanceof Date ? undefined : newLog.timestamp,
              },
            ]);
            if (newLog.userId === currentUser?.uid && newLog.total) {
              setUserTotalOwed((prev) => prev + newLog.total);
            }
          }}
        />

        {currentUser && (
          <div className="mt-8 max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow p-4 text-gray-800 space-y-2">
            <h3 className="text-lg font-semibold mb-2">📊 Your Snack Summary</h3>
            <p>
              <strong>Total Items Logged:</strong> {totalItems}
            </p>
            <p>
              <strong>Total Owed:</strong> ${userTotalOwed.toFixed(2)}
            </p>
          </div>
        )}
      </AuthGuard>
    </main>
  );
}