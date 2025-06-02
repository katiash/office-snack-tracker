'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

const MOCK_USERS = ['user001', 'user002', 'user003'];

export default function SnackForm() {
  const [userId, setUserId] = useState('');
  const [itemCount, setItemCount] = useState(1);
  const [itemType, setItemType] = useState('Snack');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('venmo');
  const [applyFee, setApplyFee] = useState(false);
  const router = useRouter();

  const subtotal = itemCount * 2;
  const adminFee = paymentMethod === 'invoice' && applyFee ? subtotal * 0.2 : 0;
  const total = subtotal + adminFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) return alert('Please select your User ID.');

    await addDoc(collection(db, 'snackLogs'), {
      userId: auth.currentUser?.uid,
      timestamp: Timestamp.now(),
      numItems: itemCount,
      itemType,
      description,
      paymentMethod,
      subtotal,
      adminFee,
      total,
    });

    router.push('/thank-you');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4 bg-white rounded-lg shadow">
      <h1 className="text-xl font-semibold text-gray-800">🍿 Office Snack Tracker</h1>

      <label className="block">
        <span>User ID</span>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="">Select a user</option>
          {MOCK_USERS.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span>Number of Items</span>
        <div className="flex items-center space-x-2 mt-1">
          <button type="button" onClick={() => setItemCount(Math.max(1, itemCount - 1))} className="px-2 py-1 border rounded">–</button>
          <span>{itemCount}</span>
          <button type="button" onClick={() => setItemCount(itemCount + 1)} className="px-2 py-1 border rounded">+</button>
        </div>
      </label>

      <label className="block">
        <span>Item Type</span>
        <select
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option>Snack</option>
          <option>Drink</option>
          <option>Water</option>
        </select>
      </label>

      <label className="block">
        <span>Description</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          placeholder="e.g. Sparkling Water, Doritos"
        />
      </label>

      <label className="block">
        <span>Payment Method</span>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="venmo">Venmo</option>
          <option value="cash">Cash</option>
          <option value="invoice">Add to Invoice</option>
        </select>
      </label>

      {paymentMethod === 'invoice' && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={applyFee}
            onChange={(e) => setApplyFee(e.target.checked)}
          />
          Apply 20% Admin Fee
        </label>
      )}

      <div className="text-sm text-gray-600">
        Subtotal: ${subtotal.toFixed(2)}<br />
        Admin Fee: ${adminFee.toFixed(2)}<br />
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>

      <button type="submit" className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
        Submit & Log This Snack
      </button>
    </form>
  );
}
