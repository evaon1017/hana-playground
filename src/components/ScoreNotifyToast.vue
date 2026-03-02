<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../utils/firebase';
import { ref as dbRef, onChildAdded, query, limitToLast } from "firebase/database";

// 存放畫面上顯示的 Toast 列表
const notifications = ref<any[]>([]);

onMounted(() => {
    const startTime = Date.now();
    console.log("🔔 ScoreNotifyToast 已掛載，正在監聽 Firebase...");
    // 指向資料庫中的 scores 節點
    const scoresRef = query(dbRef(db, 'scores'), limitToLast(10));

    // 監聽新增加的子節點
    onChildAdded(scoresRef, (snapshot) => {
        const data = snapshot.val();

        if (data.createdAt && data.createdAt > startTime) {
            console.log("📥 收到即時新訊息:", data);
            addNotification({ ...data, id: snapshot.key });
        } else {
            console.log("🚫 過濾掉舊資料");
        }
    });
});

const addNotification = (data: any) => {
    notifications.value.push(data);

    // 建議：還是開啟自動移除功能，不然畫面會被塞滿
    setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== data.id);
    }, 5000);
};
</script>

<template>
    <div class="toast-outer-container">
        <TransitionGroup name="toast-list">
            <div v-for="notification in notifications" :key="notification.id" class="score-toast">
                <img :src="notification.avatar" alt="Avatar" class="avatar">
                <div class="toast-content">
                    <div class="toast-message">{{ notification.message }}</div>
                    <div class="toast-icon">
                        <img v-if="notification.icon === 'good'" src="@/assets/good.png" alt="Good">
                        <img v-else src="@/assets/bad.jpg" alt="Bad">
                    </div>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-outer-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.score-toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    border-left: 5px solid #4caf50;
    /* 預設綠色 */
    min-width: 250px;
    backdrop-filter: blur(4px);
}

/* 如果是錯誤的訊息，可以換個顏色 */
.score-toast:has(.toast-icon img[alt="Bad"]) {
    border-left-color: #f44336;
}

.avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #eee;
}

.toast-content {
    display: flex;
    flex-direction: column;
}

.toast-message {
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.toast-icon img {
    height: 24px;
    width: auto;
    margin-top: 4px;
}

/* Transition 效果 */
.toast-list-enter-active,
.toast-list-leave-active {
    transition: all 0.4s ease;
}

.toast-list-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.toast-list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>
