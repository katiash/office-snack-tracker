'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function ProfileModal({
  initialData,
  onClose,
}: {
  initialData: { firstName: string; lastName: string; company?: string };
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [company, setCompany] = useState(initialData.company || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);

    const docRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(docRef, {
      firstName,
      lastName,
      company,
    });

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Edit Your Profile</h2>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-gray-600">First Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Last Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Company (optional)</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="text-sm px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}