// YourSnackSummary.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

interface SnackLog {
  userId: string;
  timestamp: Timestamp;
  itemType: string;
  printType?: 'bw' | 'color';
  count: number;
  subtotal: number;
  adminFee: number;
  total: number;
}

export default function YourSnackSummary() {
  const [loading, setLoading] = useState(true);
  const [snackDrinkCount, setSnackDrinkCount] = useState(0);
  const [snackDrinkTotal, setSnackDrinkTotal] = useState(0);
  const [printCount, setPrintCount] = useState(0);
  const [printTotal, setPrintTotal] = useState(0);
  const [bwCount, setBwCount] = useState(0);
  const [colorCount, setColorCount] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(collection(db, 'snackLogs'));
      const logs = snap.docs
        .map((doc) => doc.data())
        .filter((log) => log.userId === user.uid) as SnackLog[];

      let snackDrinkTotalSum = 0;
      let snackDrinkItemCount = 0;
      let printTotalSum = 0;
      let printItemCount = 0;
      let blackWhite = 0;
      let color = 0;

      for (const log of logs) {
        if (log.itemType === 'snack' || log.itemType === 'drink') {
          snackDrinkTotalSum += log.total;
          snackDrinkItemCount += log.count;
        } else if (log.itemType === 'print') {
          printTotalSum += log.total;
          printItemCount += log.count;
          if (log.printType === 'bw') blackWhite += log.count;
          if (log.printType === 'color') color += log.count;
        }
      }

      setSnackDrinkTotal(snackDrinkTotalSum);
      setSnackDrinkCount(snackDrinkItemCount);
      setPrintTotal(printTotalSum);
      setPrintCount(printItemCount);
      setBwCount(blackWhite);
      setColorCount(color);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  if (loading) return <p className="text-gray-500">Loading summary...</p>;

  return (
    <div className="bg-white border border-orange-200 p-5 rounded-xl shadow-md text-gray-800 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
        🧾 <span>Your Snack & Print Log</span>
      </h2>
  
      {/* Snacks + Drinks */}
      <div className="mb-6 bg-orange-50 border-l-4 border-orange-300 p-4 rounded-md">
        <h3 className="text-md font-semibold text-orange-600 mb-2"> 🥤🍩🖨️ Snack & Print/Copy Tracker </h3>
        <p className="text-sm">• Items: <span className="font-medium">{snackDrinkCount}</span></p>
        <p className="text-sm">
          • Total:{' '}
          <span className="font-semibold">
            ${snackDrinkTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>
  
      {/* Copy / Print */}
      <div className="bg-orange-50 border-l-4 border-orange-300 p-4 rounded-md">
        <h3 className="text-md font-semibold text-orange-600 mb-2">🖨️ Copy / Print</h3>
        <p className="text-sm">
          • Items:{' '}
          <span className="font-medium">
            {printCount} ({bwCount} Black & White, {colorCount} Color)
          </span>
        </p>
        <p className="text-sm">
          • Total:{' '}
          <span className="font-semibold">
            ${printTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>
    </div>
  );
}
// This component fetches the user's snack and print logs from Firestore
// and displays a summary of their snack and print activity.
// It shows the total number of items and the total cost for snacks/drinks
// and prints, including a breakdown of black & white vs color prints.