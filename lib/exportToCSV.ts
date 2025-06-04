// lib/exportToCSV.ts

import { SnackLog } from '@/types';
import { UserMap } from '@/types';

export function convertLogsToCSV(logs: SnackLog[], userMap: UserMap): string {
  const headers = ['Date', 'Email', 'User', 'Item', 'Print Type', 'Count', 'Total'];

  const rows = logs.map((log) => {
    const date = log.timestamp?.toDate().toLocaleDateString() || '';
    const email = userMap[log.userId]?.email || '';
    const user =
      userMap[log.userId]?.company ||
      `${userMap[log.userId]?.firstName || ''} ${userMap[log.userId]?.lastName || ''}`.trim() ||
      (log.userId === log.userId ? '(You)' : log.userId);
    const printType = log.itemType === 'print' ? log.printType || '' : '';
    const item = log.itemType;
    const count = log.count;
    const total = log.total?.toFixed(2) || '0.00';

    return [date, email, user, item, printType, count, total];
  });

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}
