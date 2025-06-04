'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { utils as XLSXUtils, writeFile } from 'xlsx';
import { Timestamp } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import ProfileModal from '@/components/ProfileModal';

type UserMeta = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  isAdmin?: boolean;
};

type SnackLog = {
  userId: string;
  itemType: string;
  count: number;
  timestamp: Timestamp;
  total: number;
};

export default function AdminPage() {
  const { isAdmin, loading } = useAdminStatus();
  const [userMap, setUserMap] = useState<Record<string, UserMeta>>({});
  const [logs, setLogs] = useState<SnackLog[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const currentUser = auth.currentUser;
  const currentMeta = currentUser ? userMap[currentUser.uid] : undefined;
  const isProfileIncomplete = currentMeta && (!currentMeta.firstName || !currentMeta.lastName);

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
          isAdmin: data.isAdmin ?? false,
        };
      });
      setUserMap(map);
    };
    fetchUsers();
  }, []);

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

  const handleToggleAdmin = async (uid: string, makeAdmin: boolean) => {
    if (!auth.currentUser) return;
    try {
      const res = await fetch('/api/set-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          requesterUid: auth.currentUser.uid,
          action: makeAdmin ? 'promote' : 'revoke',
        }),
      });

      if (res.ok) {
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
            isAdmin: data.isAdmin ?? false,
          };
        });
        setUserMap(map);
        alert(`✅ ${makeAdmin ? 'Admin rights granted!' : 'Admin rights revoked!'}`);
      } else {
        alert('❌ Failed: ' + (await res.text()));
      }
    } catch (err) {
      console.error('🔥 API error:', err);
      alert('Unexpected error');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`✅ Password reset email sent to ${email}`);
    } catch (err) {
      console.error('❌ Error sending password reset email:', err);
      alert('Failed to send password reset email.');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const logDate = log.timestamp?.toDate();
    if (!logDate) return false;
    if (startDate && logDate < startDate) return false;
    if (endDate && logDate > endDate) return false;
    return true;
  });

  const handleExportCSV = () => {
    const csvData = filteredLogs.map((log) => ({
      Date: log.timestamp?.toDate().toLocaleDateString() || '',
      Email: userMap[log.userId]?.email || '',
      User:
        userMap[log.userId]?.company ||
        `${userMap[log.userId]?.firstName || ''} ${userMap[log.userId]?.lastName || ''}`.trim() ||
        (log.userId === currentUser?.uid ? '(You)' : log.userId),
      Item: log.itemType,
      Count: log.count,
      Total: log.total?.toFixed(2) || '0.00',
    }));

    const worksheet = XLSXUtils.json_to_sheet(csvData);
    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, 'Snack Logs');
    const dateStr = new Date().toISOString().split('T')[0];
    writeFile(workbook, `snack-logs-${dateStr}.csv`);
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!isAdmin) return <p className="text-center text-red-600 mt-10">⛔ Access Denied</p>;

  return (
    <div className="min-h-screen bg-[#FFF5E9] py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-10">

        {isProfileIncomplete && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg shadow-sm">
            Your profile is incomplete.{' '}
            <button
              onClick={() => setShowProfileModal(true)}
              className="underline font-semibold text-yellow-700 hover:text-yellow-900"
            >
              Click here to update it.
            </button>
          </div>
        )}

        {showProfileModal && currentMeta && (
          <ProfileModal
            initialData={currentMeta}
            onClose={() => setShowProfileModal(false)}
          />
        )}

        {/* Logs Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Snack Logs</h2>

          <div className="flex flex-wrap gap-6 mb-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
          >
            ⬇️ Export CSV
          </button>

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-700 text-left">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Item</th>
                  <th className="p-3 text-center">Count</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {userMap[log.userId]?.company ||
                        `${userMap[log.userId]?.firstName || ''} ${userMap[log.userId]?.lastName || ''}`.trim() ||
                        userMap[log.userId]?.email ||
                        (log.userId === currentUser?.uid ? '(You)' : log.userId)}
                    </td>
                    <td className="p-3">{log.itemType}</td>
                    <td className="p-3 text-center">{log.count}</td>
                    <td className="p-3 text-right">${log.total?.toFixed(2)}</td>
                    <td className="p-3 text-right">{log.timestamp?.toDate().toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* User Management */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-50 text-gray-700 text-left">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Company</th>
                  <th className="p-3 text-center">Admin?</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(userMap).map((user) => (
                  <tr key={user.uid} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.firstName} {user.lastName}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.company || '-'}</td>
                    <td className="p-3 text-center">{user.isAdmin ? '✅' : '—'}</td>
                    <td className="p-3 text-center flex flex-col sm:flex-row gap-2 justify-center items-center">
                      {user.uid !== currentUser?.uid && (
                        <>
                          <button
                            className="bg-[#FF7300] text-white px-4 py-2 min-w-[125px] rounded-md shadow hover:bg-orange-600 transition text-sm font-medium"
                            onClick={() => handleToggleAdmin(user.uid, !user.isAdmin)}
                          >
                            {user.isAdmin ? '🔽 Revoke' : '⬆️ Make Admin'}
                          </button>

                          <button
                            title="Reset Password"
                            onClick={() => handleResetPassword(user.email)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md shadow transition"
                          >
                            🔁
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}