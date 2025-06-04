'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const router = useRouter();
  const { isAdmin } = useAdminStatus();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <nav className="w-full bg-[#FFF5E9] px-6 py-4 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Navigation Links */}
        <div className="flex items-center space-x-4 text-sm">
          <Link href="/" className="text-gray-700 hover:text-orange-600 transition">
            🏠 Home
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-gray-700 hover:text-orange-600 transition">
            📒 Admin
            </Link>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-4 text-sm">
          {userEmail && (
            <span className="text-gray-500 font-mono">👤 {userEmail}    </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 transition"
          >
            🔓 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
