'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      try{
        await setDoc(doc(db, 'users', uid), {
          firstName,
          lastName,
          company,
          email,
          createdAt: new Date(),
        });
      } catch (error) {
      console.error('🔥 Error writing Firestore user doc:', error);
    }
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        console.error('Unexpected signup error:', err);
        alert('Something went wrong during signup.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white border border-gray-200 p-6 mt-10 rounded-xl shadow-md space-y-5"
    >
      <h2 className="text-2xl font-bold text-orange-600 text-center">Create Your Account</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          required
          type="text"
          placeholder="First Name"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          required
          type="text"
          placeholder="Last Name"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <input
        type="text"
        placeholder="Company (optional)"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      <input
        required
        type="email"
        placeholder="Email"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        required
        type="password"
        placeholder="Password"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}