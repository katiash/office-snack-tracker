'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useAdminStatus } from '@/hooks/useAdminStatus';

export default function NavBar() {
  const router = useRouter();
  const { isAdmin } = useAdminStatus();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <nav className="w-full px-6 py-4 bg-orange-100 flex justify-between items-center text-sm">
      <div className="flex gap-4 items-center">
        <Link href="/">🏠 Home</Link>
        {isAdmin && <Link href="/admin">🧑‍💼 Admin</Link>}
      </div>
      <button onClick={handleLogout} className="underline text-brand-dark">
        Log Out
      </button>
    </nav>
  );
}
