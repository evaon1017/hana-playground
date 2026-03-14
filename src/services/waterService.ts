import { db } from '../utils/firebase';
import { ref, push, serverTimestamp, query, orderByChild, startAt, onValue } from "firebase/database";

export interface WaterLog {
  id?: string;
  userId: string;
  dateKey: string;
  timestamp: number; // local Date.now() 
  icon: string;
  cc: number;
}

/**
 * 增加喝水紀錄
 */
export const addWaterLog = async (userId: string, icon: string, cc: number) => {
  const d = new Date();
  const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const waterRef = ref(db, `water_logs/${userId}`);
  
  await push(waterRef, {
    userId,
    dateKey,
    timestamp: Date.now(),
    icon,
    cc,
    createdAt: serverTimestamp()
  });
};

/**
 * 刪除喝水紀錄
 */
export const removeWaterLog = async (userId: string, logId: string) => {
  const logRef = ref(db, `water_logs/${userId}/${logId}`);
  await import("firebase/database").then(({ remove }) => remove(logRef));
};

/**
 * 監聽使用者的喝水紀錄 (最近兩週)
 */
export const listenWaterLogs = (userId: string, callback: (logs: WaterLog[]) => void) => {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  const waterRef = query(
    ref(db, `water_logs/${userId}`),
    orderByChild('timestamp'),
    startAt(twoWeeksAgo.getTime())
  );

  return onValue(waterRef, (snapshot) => {
    const logs: WaterLog[] = [];
    snapshot.forEach((child) => {
      logs.push({
        id: child.key as string,
        ...child.val()
      });
    });
    callback(logs);
  });
};
