import { db } from '../utils/firebase'; // 剛才建立的設定檔
import { ref, push, serverTimestamp } from "firebase/database";

/**
 * 發送作答結果到 Firebase
 * @param avatar 50x50 的 Base64 字串
 * @param message 訊息
 * @param icon 是否答對
 */
export const broadcastAnswer = async (
  avatar: string, 
  message: string, 
  icon: string
) => {
  try {
    // 取得資料庫中 "scores" 這個節點的路徑
    const scoresRef = ref(db, 'scores');

    // 使用 push 會自動產生一個唯一的 Key (類似 UUID)
    await push(scoresRef, {
      avatar: avatar,
      message: message,
      icon: icon,
      // 使用伺服器端時間，確保不同時區的小朋友排序是正確的
      createdAt: serverTimestamp() 
    });

    console.log("🔥 成功發送作答訊息！");
  } catch (error) {
    console.error("❌ Firebase 發送失敗:", error);
  }
};