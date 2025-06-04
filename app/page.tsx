"use client";

import AuthGuard from '@/components/AuthGuard';
import SnackForm from '@/components/SnackForm';
import { useEnsureUserDoc } from '@/hooks/useEnsureUserDoc';

export default function Home() {
  useEnsureUserDoc(); // ✅ ensures Firestore doc exists
  return (
    <main className="min-h-screen bg-orange-50 py-10">
      <AuthGuard>
        <SnackForm />
      </AuthGuard>
    </main>
  );
}