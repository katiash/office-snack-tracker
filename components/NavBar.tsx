// 🔧 Wrap email and Logout button into a flex container with responsive wrapping.
// 💡 Add a flex-wrap, justify-between, and gap-2 behavior at smaller screen widths.
// 📱 On mobile, stack or tighten spacing. On desktop, preserve horizontal flow.

// components/NavBar.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [canCheckAdmin, setCanCheckAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 👇 Safe to use hooks before any early return
  const { isAdmin, loading } = useAdminStatus(canCheckAdmin);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || null);
      setCanCheckAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Don't render NavBar on /login or /signup or root path if not logged in
  if ((pathname === '/' || pathname === '/login' || pathname === '/signup') && !userEmail) return null;
  if (loading) return null;// ✅ wait until we know auth state

  const handleLogout = async () => {
    await signOut(auth);
    setUserEmail(null);
    router.push('/login');
  };

  return (
    <nav className="w-full bg-[#FFF5E9] px-4 py-4 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-2">
        {/* Navigation Links */}
        <div className="flex items-center space-x-4 text-sm">
          <Link href="/" className="text-gray-700 hover:text-orange-600 transition">
            🏠 Home
          </Link>
          {!loading && isAdmin && (
            <Link href="/admin" className="text-gray-700 hover:text-orange-600 transition">
              📁 Admin
            </Link>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {userEmail && <span className="text-gray-500 font-mono">👤 {userEmail}</span>}
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
