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
  total: number;
}

export default function YourSnackSummary({ refreshTrigger }: { refreshTrigger: boolean }) {
  const [loading, setLoading] = useState(true);
  const [snackDrinkCount, setSnackDrinkCount] = useState(0);
  const [snackDrinkTotal, setSnackDrinkTotal] = useState(0);
  const [printCount, setPrintCount] = useState(0);
  const [printTotal, setPrintTotal] = useState(0);
  const [bwCount, setBwCount] = useState(0);
  const [colorCount, setColorCount] = useState(0);
  const [dateRangeText, setDateRangeText] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setLoading(true);
    
      const snap = await getDocs(collection(db, 'snackLogs'));
      const logs = snap.docs
        .map((doc) => doc.data())
        .filter((log) => log.userId === user.uid) as SnackLog[];
    
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // ← Fixed
    
      setDateRangeText(`Tracking: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`);
    
      const filteredLogs = logs.filter((log) => {
        const ts = log.timestamp?.toDate();
        return ts && ts >= startOfMonth && ts <= endOfMonth;
      });

      let snackDrinkTotalSum = 0;
      let snackDrinkItemCount = 0;
      let printTotalSum = 0;
      let printItemCount = 0;
      let blackWhite = 0;
      let color = 0;

      for (const log of filteredLogs) {
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
  }, [refreshTrigger]);

  if (loading) return <p className="text-gray-500">Loading summary...</p>;

  const grandTotal = snackDrinkTotal + printTotal;
  const derivedAdminFee = 0.2 * snackDrinkTotal;

  return (
    <div className="bg-white border border-orange-200 p-6 rounded-xl shadow-md text-gray-800 max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold text-orange-500 mb-4 tracking-wide">🧾 Your Activity Summary</h2>
  
      <section className="mb-5">
        <h3 className="text-[#FF7300] font-semibold">🥤 Snacks + Drinks</h3>
        <ul className="text-sm space-y-1">
          <li>• Items: {snackDrinkCount}</li>
          <li>
            • Total:{' '}
            <strong>
              ${snackDrinkTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </li>
        </ul>
      </section>
  
      <section className= "mb-5">
      <h3 className="text-green-800 opacity-90 font-semibold">💼 Admin Fee</h3>
        <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-green-800 text-sm font-medium shadow-sm mt-1">
          20% for snacks and drinks:{' '}
          <span className="font-bold">
            ${derivedAdminFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>{' '}
          <span className="text-xs text-gray-500 font-normal">(included in total above)</span>
        </div>
      </section>

      <section>
        <h3 className="text-[#FF7300] font-semibold">🖨️ Copies + Prints</h3>
        <ul className="text-sm space-y-1">
          <li>
            • Items: {printCount} ( {bwCount} Black & White 📄, {colorCount} Color 🎨 )
          </li>
          <li>
            • Total:{' '}
            <strong>
              ${printTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </li>
        </ul>
      </section>
  
      <div className="mt-5 pt-3 border-t text-sm text-gray-700">
        <strong className="text-orange-600">Grand Total:</strong>{' '}
        <span className="font-semibold">
          ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
  
      <div className="text-xs text-gray-500 mt-2">{dateRangeText}</div>
    </div>
  );
}
