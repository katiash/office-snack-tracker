'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthed(true);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) return <p className="text-center p-8">Checking auth...</p>;

  return authed ? <>{children}</> : null;
}
