// components/AdminDeletePanel.tsx
'use client';

import { getAuth } from 'firebase/auth';
// (make sure Firebase is initialized in your app already)
import { collection, getDocs } from 'firebase/firestore';
import {useEffect, useState } from 'react';
import { UserMeta } from '@/types';
import { db } from '@/lib/firebase';


export default function AdminDeletePanel() {
  const [uid, setUid] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteUser, setDeleteUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, UserMeta>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const data: Record<string, UserMeta> = {};
      snapshot.forEach((doc) => {
        data[doc.id] = { uid: doc.id, ...doc.data() } as UserMeta;
      });
      setUserMap(data);
    };
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!uid) {
      setResult('❌ UID is required.');
      return;
    }
    setLoading(true);
  
    try {
      const currentUser = getAuth().currentUser;
      const idToken = currentUser && (await currentUser.getIdToken());
  
      if (!idToken) {
        setResult('❌ No ID token found.');
        return;
      }
  
      const res = await fetch('/api/delete-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // ✅ Add the ID token
        },
        body: JSON.stringify({ uid, startDate, endDate, deleteUser }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setResult(`✅ Success: ${data.message || `${data.deletedLogs} logs deleted.`}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
          setResult(`❌ Exception: ${err.message}`);
        } else {
          setResult('❌ An unknown error occurred.');
        }
      }
  };

  return (
    <div className="border border-red-300 bg-red-50 p-4 rounded-xl max-w-lg mx-auto my-10">
      <h2 className="text-lg font-semibold mb-2">🧹 Admin Delete Tool</h2>
      <div className="space-y-2 text-sm">
        <label className="block text-sm text-gray-700 mb-1">Select User</label>
        <select
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        >
          <option value="">— Select a user —</option>
          {Object.values(userMap).map((user) => (
            <option key={user.uid} value={user.uid}>
              {user.firstName} {user.lastName} — {user.email} {user.company ? `(${user.company})` : ''}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            className="w-1/2 p-2 border rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="w-1/2 p-2 border rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={deleteUser}
            onChange={(e) => setDeleteUser(e.target.checked)}
          />
          Also delete user record & auth
        </label>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Deleting…' : 'Delete Selected Logs'}
        </button>
        {result && <div className="mt-2 text-sm text-gray-700">{result}</div>}
      </div>
    </div>
  );
}

    