// lib/exportToCSV.ts

import type { SnackLog, UserMap } from '../types';

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
    const count = log.count || 0;
    const total = log.total?.toFixed(2) || '0.00';

    return [date, email, user, item, printType, count, total];
  });

  // 👇 Append totals row
  const totalCount = logs.reduce((sum, log) => sum + (log.count || 0), 0);
  const totalCost = logs.reduce((sum, log) => sum + (log.total || 0), 0).toFixed(2);

  rows.push(['', '', '', '', 'TOTALS →', totalCount.toString(), totalCost]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}