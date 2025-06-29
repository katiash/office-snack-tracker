// hooks/useUserMetadata.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserMeta } from '@/types'

export function useUserMetadata() {
  const [userMap, setUserMap] = useState<Record<string, UserMeta>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const snapshot = await getDocs(collection(db, 'users'));
      const map: Record<string, UserMeta> = {};
      snapshot.forEach((doc) => {
        map[doc.id] = doc.data() as UserMeta;
      });
      setUserMap(map);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  return { userMap, loading };
}