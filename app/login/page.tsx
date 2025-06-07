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
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [typedEmail, setTypedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const userList: UserMeta[] = [];
        const map: Record<string, string> = {};

        snap.forEach((doc) => {
          const data = doc.data();
          userList.push({
            uid: doc.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            company: data.company,
          });
          // Build a map of UID → email (for login resolution)
          // Used in case a user selects their name from dropdown.
          // Firebase Auth requires email to log in, so we resolve it from UID.
          map[doc.id] = data.email ?? `${data.firstName} ${data.lastName}`;
        });

        setUsers(userList);
        setEmailMap(map);
      } catch (err) {
        console.error('🔥 Error fetching users:', err);
        alert('Error loading user list. Please refresh.');
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = selectedUid ? emailMap[selectedUid] : typedEmail;

    if (!email) {
      alert('Please select a user or enter an email.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      alert('Error: ' + error.message);
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

      <label className="block text-sm font-medium text-gray-700">
        Select your name or company <span className="text-gray-500">(or enter email)</span>
      </label>

      <select
        value={selectedUid}
        onChange={(e) => setSelectedUid(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">-- Select User --</option>
        {users.map((user) => (
          <option key={user.uid} value={user.uid}>
            {user.company || `${user.firstName} ${user.lastName}`}
          </option>
        ))}
      </select>

      <div className="text-center text-sm text-gray-500">or</div>

      <input
        type="email"
        placeholder="Email"
        value={typedEmail}
        onChange={(e) => {
          setTypedEmail(e.target.value);
          setSelectedUid(''); // Clear dropdown selection
        }}
        className="w-full border p-2 rounded"
      />

      <input
        required
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
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
