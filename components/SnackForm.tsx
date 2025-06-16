'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface Props {
  onLogSubmitted: () => void;
}

export default function SnackForm({ onLogSubmitted }: Props) {
  const [itemType, setItemType] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastItemType') || 'snack';
    }
    return 'snack';
  });
  const [count, setCount] = useState(1);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [submitting, setSubmitting] = useState(false);

  
  useEffect(() => {
    localStorage.setItem('lastItemType', itemType);
  }, [itemType]);

  const basePrice =
    itemType === 'print'
      ? printType === 'color'
        ? 0.5
        : 0.15
      : 2.0;

  const subtotal = basePrice * count;
  const adminFee = itemType === 'snack' || itemType === 'drink' ? subtotal * 0.2 : 0;
  const total = subtotal + adminFee;

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSubmitting(true);

    await addDoc(collection(db, 'snackLogs'), {
      userId: user.uid,
      timestamp: Timestamp.now(),
      itemType,
      printType: itemType === 'print' ? printType : null,
      count,
      subtotal,
      adminFee,
      total,
    });

    setSubmitting(false);
    setCount(1);
    onLogSubmitted();
  };

  return (
    <div className="bg-white border border-orange-200 p-6 rounded-xl shadow-md text-gray-800">
      <h2 className="text-xl font-bold text-orange-500 mb-4 tracking-wide">
        🍿 Snacks & Prints 🖨️ Tracker
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Item Type</label>
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="snack">Snack</option>
            <option value="drink">Drink</option>
            <option value="print">Print</option>
          </select>
        </div>

        {itemType === 'print' && (
          <div>
            <label className="block mb-1 font-medium">Print Type</label>
            <select
              value={printType}
              onChange={(e) => setPrintType(e.target.value as 'bw' | 'color')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="bw">Black & White</option>
              <option value="color">Color</option>
            </select>
          </div>
        )}

        <div>
          <label className="block mb-1 font-medium">Quantity</label>
          <input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="text-sm text-gray-700">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Admin Fee: ${adminFee.toFixed(2)}</p>
          <p className="font-bold text-black">Total: ${total.toFixed(2)}</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 w-full"
        >
          {submitting ? 'Logging...' : 'Submit & Log This Item'}
        </button>
      </div>
    </div>
  );
}
