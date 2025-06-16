import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect } from 'react';

export function useAuditPrintTypeValues() {
  useEffect(() => {
    const checkLogs = async () => {
        console.log('Running audit hook...');
      const snap = await getDocs(collection(db, 'snackLogs'));
      let dirtyCount = 0;

      snap.forEach((doc) => {
        const data = doc.data();
        const itemType = data.itemType;
        const printType = data.printType;

        if (itemType === 'print') {
          const valid = printType === 'bw' || printType === 'color';
          if (!valid) {
            console.warn(`❌ Invalid printType for doc ${doc.id}:`, printType);
            dirtyCount++;
          }
        }
      });

      if (dirtyCount === 0) {
        console.log('✅ All printType values are clean.');
      } else {
        console.log(`⚠️ Found ${dirtyCount} dirty printType entries.`);
      }
    };

    checkLogs();
  }, []);
}
