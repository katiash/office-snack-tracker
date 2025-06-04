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

      await setDoc(doc(db, 'users', uid), {
        firstName,
        lastName,
        company,
        email,
        createdAt: new Date(),
      });

      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        console.error('Unexpected signup error:', err);
        alert('Something went wrong during signup.');
      }
    }finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 mt-10 rounded shadow space-y-4"
    >
      <h2 className="text-2xl font-bold">Create Your Account</h2>

      <div className="flex gap-4">
        <input
          required
          type="text"
          placeholder="First Name"
          className="w-1/2 border p-2 rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          required
          type="text"
          placeholder="Last Name"
          className="w-1/2 border p-2 rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <input
        type="text"
        placeholder="Company (optional)"
        className="w-full border p-2 rounded"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      <input
        required
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
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
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
