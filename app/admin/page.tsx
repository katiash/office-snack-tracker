'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface SnackLog {
  userId: string;
  timestamp: Timestamp;
  itemType: 'snack' | 'drink' | 'print';
  description?: string;
  count: number;
}

export default function AdminPage() {
  const [logs, setLogs] = useState<SnackLog[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [month, setMonth] = useState(''); // e.g., '2025-06'

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, 'snackLogs'));
      const data: SnackLog[] = [];

      snapshot.forEach((doc) => {
        const d = doc.data() as SnackLog;
        data.push(d);
      });

      setLogs(data);
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const date = log.timestamp.toDate();
    const matchesUser = selectedUser ? log.userId === selectedUser : true;
    const matchesMonth = month ? format(date, 'yyyy-MM') === month : true;
    return matchesUser && matchesMonth;
  });

  const totals = {
    snack: 0,
    drink: 0,
    print: 0,
  };

  filteredLogs.forEach((log) => {
    totals[log.itemType] += log.count;
  });

  return (
    <main className="p-6 max-w-4xl mx-auto bg-white shadow rounded space-y-6">
      <h1 className="text-2xl font-bold">🧑‍💼 Admin Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by User ID"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border p-2 rounded flex-1"
        />
      </div>

      <div className="bg-brand-light p-4 rounded text-brand-dark">
        <p><strong>Totals:</strong> 🧃 {totals.drink} | 🍪 {totals.snack} | 🖨️ {totals.print}</p>
      </div>

      <div>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-brand-gold text-brand-dark">
              <th className="p-2 text-left">Timestamp</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Count</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">User</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, i) => (
              <tr key={i} className="even:bg-brand-light/30">
                <td className="p-2">{format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm')}</td>
                <td className="p-2 capitalize">{log.itemType}</td>
                <td className="p-2">{log.count}</td>
                <td className="p-2">{log.description || '-'}</td>
                <td className="p-2">{log.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
