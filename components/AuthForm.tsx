'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        console.error('Unexpected error during auth:', err);
        alert('Something went wrong.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mt-10 p-8 bg-oeBg text-brand-dark rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold text-center">
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <button
        type="submit"
        className="w-full py-2 bg-brand-gold text-brand-dark font-semibold rounded hover:opacity-90"
      >
        {mode === 'login' ? 'Log In' : 'Create Account'}
      </button>
    </form>
  );
}
