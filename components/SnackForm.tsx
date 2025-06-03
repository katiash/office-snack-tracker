'use client';

import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function SnackForm() {
  const [itemCount, setItemCount] = useState(1);
  const [itemType, setItemType] = useState('snack');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const unitPrice = 2;
  const subtotal = unitPrice * itemCount;
  const adminFee = itemType === 'print' ? subtotal * 0.2 : 0;
  const total = subtotal + adminFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to submit.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'snackLogs'), {
        userId: user.uid,
        timestamp: Timestamp.now(),
        itemType,
        count: itemCount,
        description,
        subtotal,
        adminFee,
        total,
      });

      setSuccess(true);
      setItemCount(1);
      setItemType('snack');
      setDescription('');
    } catch (err: any) {
      console.error('Error logging item:', err);
      alert('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow-md space-y-4"
    >
      <h2 className="text-xl font-semibold mb-2">🍿 Office Snack Tracker</h2>

      <div className="flex items-center gap-2">
        <label className="w-1/3">Number of Items</label>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => setItemCount((c) => Math.max(1, c - 1))}
            className="px-3 py-1 bg-orange-200 rounded"
          >
            −
          </button>
          <span>{itemCount}</span>
          <button
            type="button"
            onClick={() => setItemCount((c) => c + 1)}
            className="px-3 py-1 bg-orange-200 rounded"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block mb-1">Item Type</label>
        <select
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="snack">Snack</option>
          <option value="drink">Drink</option>
          <option value="print">Print</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Sparkling Water, Doritos"
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="text-sm text-gray-600 mt-2">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Admin Fee: ${adminFee.toFixed(2)}</p>
        <p className="font-bold text-black">Total: ${total.toFixed(2)}</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
      >
        {submitting ? 'Logging...' : 'Submit & Log This Item'}
      </button>

      {success && (
        <p className="text-green-600 text-sm mt-2">✅ Item logged successfully!</p>
      )}
    </form>
  );
}
