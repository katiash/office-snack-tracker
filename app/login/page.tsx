'use client';

import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';

type UserMeta = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
};

export default function LoginPage() {
  const [users, setUsers] = useState<UserMeta[]>([]);
  const [selectedUid, setSelectedUid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Current user:', auth.currentUser); // 👈 Log current user for debugging
        const snap = await getDocs(collection(db, 'users'));
        
        const userList: UserMeta[] = [];
        const map: Record<string, string> = {};

        snap.forEach((doc) => {
          const data = doc.data();
          const label = data.company
            ? `${data.company}`
            : `${data.firstName} ${data.lastName}`;

          userList.push({
            uid: doc.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            company: data.company,
          });

          map[doc.id] = data.email;
        });

        setUsers(userList);
        setEmailMap(map);
      } catch (err) {
        console.error('🔥 Error fetching users:', err); // 👈 Log error clearly
      }
    };

    fetchUsers();
  }, []);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = emailMap[selectedUid];
    if (!email) {
      alert('Please select a user');
      setLoading(false);
      return;
    }


    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 mt-10 rounded shadow space-y-4"
    >
      <h2 className="text-2xl font-bold mb-4">Log In</h2>

      <label className="block text-sm font-medium text-gray-700">Select your name or company</label>
      <select
        required
        value={selectedUid}
        onChange={(e) => setSelectedUid(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">-- Select User --</option>
        {users.map((user) => (
          <option key={user.uid} value={user.uid}>
            {user.company ? user.company : `${user.firstName} ${user.lastName}`}
          </option>
        ))}
      </select>

      <input
        required
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <p className="text-sm text-center text-gray-600">
        Don’t have an account?{' '}
        <a href="/signup" className="underline text-orange-700 hover:text-orange-800">
          Sign Up
        </a>
      </p>
    </form>
  );
}
