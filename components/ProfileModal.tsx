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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4">Edit Your Profile</h2>

        <label className="block mb-2 text-sm">First Name</label>
        <input
          type="text"
          className="w-full border px-2 py-1 mb-4 rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label className="block mb-2 text-sm">Last Name</label>
        <input
          type="text"
          className="w-full border px-2 py-1 mb-4 rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label className="block mb-2 text-sm">Company (optional)</label>
        <input
          type="text"
          className="w-full border px-2 py-1 mb-4 rounded"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={onClose} className="text-sm px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
