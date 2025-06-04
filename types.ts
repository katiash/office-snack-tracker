import { Timestamp } from "firebase-admin/firestore";

export type SnackLog = {
  timestamp?: Timestamp;
  userId: string;
  itemType: string;
  printType?: 'bw' | 'color' | null;
  count: number;
  total?: number;
};

export type UserMap = {
  [userId: string]: {
    email?: string;
    company?: string;
    firstName?: string;
    lastName?: string;
  };
};