'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { utils as XLSXUtils, writeFile } from 'xlsx'; // ✅ At top of file

type UserMeta = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
};

type SnackLog = {
  userId: string;
  itemType: string;
  count: number;
  timestamp: any;
  total: number;
};

export default function AdminPage() {
  const { isAdmin, loading } = useAdminStatus();
  const [userMap, setUserMap] = useState<Record<string, UserMeta>>({});
  const [logs, setLogs] = useState<SnackLog[]>([]);

  // 🔍 Load all users for UID → name lookup
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const map: Record<string, UserMeta> = {};

      snap.forEach((doc) => {
        const data = doc.data();
        map[doc.id] = {
          uid: doc.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
        };
      });

      setUserMap(map);
    };

    fetchUsers();
  }, []);

  // 📦 Load all snack logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snap = await getDocs(collection(db, 'snackLogs'));
        const parsedLogs = snap.docs.map((doc) => doc.data());
        setLogs(parsedLogs as SnackLog[]);
      } catch (err) {
        console.error('🔥 Failed to fetch snackLogs:', err);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <p>⛔ Access Denied</p>;


  const handleExportCSV = () => {
    const csvData = logs.map((log) => ({
      Date: log.timestamp?.toDate().toLocaleDateString() || '',
      User:
        userMap[log.userId]?.company ||
        `${userMap[log.userId]?.firstName || ''} ${userMap[log.userId]?.lastName || ''}`.trim(),
      Item: log.itemType,
      Count: log.count,
      Total: log.total?.toFixed(2) || '0.00',
    }));
  
    const worksheet = XLSXUtils.json_to_sheet(csvData);
    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, 'Snack Logs');
  
    writeFile(workbook, 'snack_logs.csv');
  };

  const handleMakeAdmin = async (targetUid: string) => {
    const targetMeta = userMap[targetUid];
    console.log('🧠 Making admin for:', targetMeta);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Not logged in');
      return;
    }
  
    const targetEmail = userMap[targetUid]?.email;
    if (!targetEmail) {
      alert('Target user email not found.');
      return;
    }

    try {
      const res = await fetch('/api/set-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetMeta?.email || '', // should NOT be empty!
          requesterUid: currentUser.uid,
          uid: targetUid,
        }),
      });
  
      if (res.ok) {
        alert('✅ User promoted to admin!');
      } else {
        const err = await res.text();
        alert('❌ Failed to make admin: ' + err);
      }
    } catch (err: any) {
      console.error('🔥 API error:', err);
      alert('Unexpected error: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Snack Usage Logs</h2>

      <button
        onClick={handleExportCSV}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        ⬇️ Download CSV
      </button>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-orange-100">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Count</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-b">
              <td className="p-2 border">
                {userMap[log.userId]
                  ? userMap[log.userId].company || `${userMap[log.userId].firstName} ${userMap[log.userId].lastName}`
                  : log.userId}
              </td>
              <td className="p-2 border">{log.itemType}</td>
              <td className="p-2 border text-center">{log.count}</td>
              <td className="p-2 border">${log.total?.toFixed(2)}</td>
              <td className="p-2 border">
                {log.timestamp?.toDate().toLocaleDateString()}
              </td>
              <td className="p-2 border space-x-2">
              <button
                className="text-xs text-blue-600 underline"
                onClick={() => handleMakeAdmin(log.userId)}
              >
                Make Admin
              </button>
              <button
                className="text-xs text-red-600 underline"
                onClick={async () => {
                  const email = userMap[log.userId]?.email;
                  if (!email) {
                    alert('❌ No email found for this user.');
                    return;
                  }

                  try {
                    const res = await fetch('/api/send-reset-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                      alert('✅ Password reset link sent.');
                      console.log('🔗 Reset link:', data.link);
                    } else {
                      alert('❌ Failed: ' + data.error);
                    }
                  } catch (err: any) {
                    console.error('Error sending reset:', err);
                    alert('Unexpected error: ' + err.message);
                  }
                }}
              >
                Reset Password
              </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
