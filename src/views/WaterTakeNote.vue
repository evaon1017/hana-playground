<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWaterStore } from '@/stores/useWaterStore';
import { useIdentityStore } from '@/stores/useIdentityStore';
import { addWaterLog, listenWaterLogs, removeWaterLog, type WaterLog } from '@/services/waterService';
import { broadcastAnswer } from '@/services/messageService';
import { compressImage } from '@/utils/imageUtils';

const waterStore = useWaterStore();
const identityStore = useIdentityStore();
const logs = ref<WaterLog[]>([]);

const newIcon = ref('🥛');
const newCc = ref<number>(250);
const isLoading = ref(true);
const iconFileInput = ref<HTMLInputElement | null>(null);

const handleIconUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      const compressedImage = await compressImage(file, 100);
      newIcon.value = compressedImage;
    } catch (error) {
      console.error('Image compression failed:', error);
    }
  }
};

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  if (identityStore.userId) {
    unsubscribe = listenWaterLogs(identityStore.userId, (data) => {
      logs.value = data;
      isLoading.value = false;
    });
  } else {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const handleAddContainer = () => {
  if (!newIcon.value || !newCc.value || newCc.value <= 0) return;
  waterStore.addContainer(newIcon.value, newCc.value);
  newIcon.value = '💧';
  newCc.value = 200;
};

const handleRemoveContainer = (id: string) => {
  waterStore.removeContainer(id);
};

const isRecording = ref(false);

const recordWater = async (container: any) => {
  if (!identityStore.userId) return;
  if (isRecording.value) return;
  
  isRecording.value = true;
  await addWaterLog(identityStore.userId, container.icon, container.cc);
  
  if (identityStore.imagePath) {
    await broadcastAnswer(
      identityStore.imagePath,
      `咕嚕咕嚕，喝了 ${container.cc} cc！`,
      container.icon
    );
  }
  isRecording.value = false;
};

const handleDeleteLog = async (logId: string | undefined) => {
  if (!logId || !identityStore.userId) return;
  if (confirm("確定要刪除這筆喝水紀錄嗎？")) {
    await removeWaterLog(identityStore.userId, logId);
  }
};

const todayDateKey = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

const todayTotalCc = computed(() => {
  return logs.value
    .filter(log => log.dateKey === todayDateKey.value)
    .reduce((sum, log) => sum + log.cc, 0);
});

const todayLogs = computed(() => {
  return logs.value
    .filter(log => log.dateKey === todayDateKey.value)
    .sort((a, b) => b.timestamp - a.timestamp); // latest first
});

// Calculate 14 days summary
const twoWeeksSummary = computed(() => {
  // ensure we have entries for all past 14 days
  const summaryMap: Record<string, { display: string, val: number, isToday: boolean }> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today
  
  for (let i = 0; i <= 13; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const display = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    summaryMap[key] = { display, val: 0, isToday: i === 0 };
  }
  
  logs.value.forEach(log => {
    const entry = summaryMap[log.dateKey];
    if (entry) {
      entry.val += log.cc;
    }
  });

  return Object.values(summaryMap);
});

const maxSummaryVal = computed(() => {
  const max = Math.max(...twoWeeksSummary.value.map(s => s.val));
  return max < 1000 ? 1000 : max; // keep minimum visual space
});

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

</script>

<template>
  <div class="water-container pb-5">
    <!-- Header Summary Block -->
    <div class="highlight-card mb-4 mt-2">
      <div class="card-body text-center text-white py-4 position-relative overflow-hidden">
        <div class="water-bg-wave"></div>
        <h6 class="text-uppercase fw-bold opacity-75 mb-1 mt-2 position-relative z-1">今日總攝水量</h6>
        <div class="display-1 fw-bolder position-relative z-1 mb-2">{{ todayTotalCc }} <span class="fs-4 text-white-50">cc</span></div>
        <p class="mb-0 fs-6 position-relative z-1" v-if="todayTotalCc >= 2000">🎉 達標！繼續保持！</p>
        <p class="mb-0 fs-6 position-relative z-1" v-else>💧 再多喝一點水吧！</p>
      </div>
    </div>

    <div class="row g-4">
      <!-- 14 days Chart -->
      <div class="col-lg-12">
        <div class="card custom-card shadow-sm border-0">
          <div class="card-body">
            <h5 class="fw-bold mb-3 d-flex align-items-center">
              <span class="material-symbols-outlined me-2 text-primary">bar_chart</span>
              過去兩周紀錄
            </h5>
            <div class="chart-container d-flex justify-content-between align-items-end pe-1">
              <div v-for="(item, index) in twoWeeksSummary" :key="index" class="bar-wrapper text-center d-flex flex-column align-items-center justify-content-end">
                <div class="bar-value text-muted small mb-1" v-if="item.val > 0">{{ item.val > 999 ? (item.val/1000).toFixed(1)+'k' : item.val }}</div>
                <div class="bar" :class="{'today-bar': item.isToday}" :style="{ height: (item.val / maxSummaryVal * 100) + '%' }"></div>
                <div class="bar-label small text-muted mt-2">{{ item.display }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Left Column: Add & Buttons -->
      <div class="col-lg-6">
        <div class="card custom-card shadow-sm border-0 h-100">
          <div class="card-body">
            <h5 class="fw-bold mb-3 d-flex align-items-center">
              <span class="material-symbols-outlined me-2 text-success">add_circle</span>
              我的容器
            </h5>
            <div class="d-flex flex-wrap gap-3 mb-4">
              <div v-for="c in waterStore.containers" :key="c.id" class="container-btn-wrapper position-relative">
                <button @click="recordWater(c)" class="btn container-btn p-3 d-flex flex-column align-items-center shadow-sm" :disabled="isRecording">
                  <img v-if="c.icon.startsWith('data:image/')" :src="c.icon" class="container-img mb-2 shadow-sm rounded-circle" />
                  <span v-else class="container-icon mb-2">{{ c.icon }}</span>
                  <span class="fw-bold">{{ c.cc }}<small>cc</small></span>
                </button>
                <button class="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle delete-btn" @click.stop="handleRemoveContainer(c.id)">
                  <span class="material-symbols-outlined" style="font-size: 14px;">close</span>
                </button>
              </div>
            </div>

            <hr />

            <h6 class="fw-bold text-muted mb-3">新增新容器</h6>
            <div class="row g-2 align-items-center">
              <div class="col-3 text-center">
                <input type="file" ref="iconFileInput" class="d-none" accept="image/*" @change="handleIconUpload">
                <div class="new-icon-preview d-inline-flex align-items-center justify-content-center bg-light border rounded cursor-pointer" @click="iconFileInput?.click()" title="點擊拍照或選取圖片">
                  <img v-if="newIcon.startsWith('data:image/')" :src="newIcon" class="img-fluid rounded-circle" style="width: 45px; height: 45px; object-fit: cover;" />
                  <span v-else class="fs-3">{{ newIcon }}</span>
                </div>
              </div>
              <div class="col-5">
                <div class="input-group">
                  <input type="number" class="form-control" v-model="newCc" placeholder="容量">
                  <span class="input-group-text">cc</span>
                </div>
              </div>
              <div class="col-4">
                <button class="btn btn-primary w-100 fw-bold shadow-sm" @click="handleAddContainer">新增</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Today's Logs -->
      <div class="col-lg-6">
        <div class="card custom-card shadow-sm border-0 h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="fw-bold mb-3 d-flex align-items-center">
              <span class="material-symbols-outlined me-2 text-info">history</span>
              今日紀錄
            </h5>
            
            <div v-if="isLoading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            
            <div class="logs-scroll-area flex-grow-1" v-else-if="todayLogs.length > 0">
              <TransitionGroup name="list" tag="div" class="d-flex flex-column gap-2 pe-2">
                <div v-for="log in todayLogs" :key="log.id" class="log-item p-3 d-flex justify-content-between align-items-center rounded-3 mb-2 shadow-sm border-start border-4 border-info">
                  <div class="d-flex align-items-center">
                    <img v-if="log.icon.startsWith('data:image/')" :src="log.icon" class="log-img me-3 rounded-circle shadow-sm" />
                    <span v-else class="fs-2 me-3">{{ log.icon }}</span>
                    <div>
                      <h5 class="mb-0 fw-bold">{{ log.cc }} cc</h5>
                      <small class="text-muted">{{ formatTime(log.timestamp) }}</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-light text-dark shadow-sm">已紀錄</span>
                    <button class="btn btn-sm btn-outline-danger border-0 d-flex align-items-center p-1" @click="handleDeleteLog(log.id)" title="刪除紀錄">
                      <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                  </div>
                </div>
              </TransitionGroup>
            </div>
            
            <div v-else class="text-center text-muted py-5 empty-state">
              <span class="material-symbols-outlined fs-1 opacity-25 mb-2">water_drop</span>
              <p>今天還沒有喝水喔，趕快補充水分吧！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.water-container {
  max-width: 1000px;
  margin: 0 auto;
}

.highlight-card {
  border-radius: 24px;
  background: linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%);
  box-shadow: 0 10px 30px rgba(32, 227, 178, 0.3);
  position: relative;
}

.water-bg-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50% 50% 0 0;
  transform: scaleX(1.5);
  animation: wave 5s ease-in-out infinite alternate;
}

@keyframes wave {
  0% { transform: scaleX(1.5) translateX(-5%); }
  100% { transform: scaleX(1.5) translateX(5%); }
}

.custom-card {
  border-radius: 20px;
  overflow: hidden;
}

/* Container Buttons */
.container-btn-wrapper {
  z-index: 1;
}

.container-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  min-width: 90px;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.container-btn:hover {
  background: #fff;
  border-color: #0cebeb;
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(12, 235, 235, 0.2) !important;
}

.container-btn:active {
  transform: translateY(2px);
}

.container-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.container-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  flex-shrink: 0;
}

.log-img {
  width: 45px;
  height: 45px;
  object-fit: cover;
}

.new-icon-preview {
  width: 55px;
  height: 55px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-icon-preview:hover {
  background-color: #e9ecef !important;
}

.delete-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.5) translate(-50%, -50%);
  transition: all 0.2s;
  z-index: 2;
}

.container-btn-wrapper:hover .delete-btn {
  opacity: 1;
  transform: scale(1) translate(-50%, -50%);
}

/* 14 Days Chart */
.chart-container {
  height: 150px;
  margin-top: 20px;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 5px;
  overflow-x: auto;
}

.bar-wrapper {
  width: 6%;
  height: 100%;
  min-width: 30px;
}

.bar {
  width: 20px;
  background: #e9ecef;
  border-radius: 4px 4px 0 0;
  min-height: 4px; /* so zeroes are somewhat visible */
  transition: height 0.5s ease-out;
}

.today-bar {
  background: linear-gradient(to top, #20e3b2, #0cebeb);
  box-shadow: 0 0 10px rgba(32, 227, 178, 0.4);
}

.bar-wrapper:hover .bar {
  background: #adb5bd;
}

.bar-wrapper:hover .today-bar {
  background: linear-gradient(to top, #0cebeb, #20e3b2);
}

.bar-label {
  font-size: 0.65rem;
  white-space: nowrap;
}

.bar-value {
  font-size: 0.65rem;
}

/* Logs Scroll Area */
.logs-scroll-area {
  max-height: 400px;
  overflow-y: auto;
}

.logs-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.logs-scroll-area::-webkit-scrollbar-track {
  background: #f1f1f1; 
  border-radius: 10px;
}
.logs-scroll-area::-webkit-scrollbar-thumb {
  background: #c1c1c1; 
  border-radius: 10px;
}
.logs-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8; 
}

.log-item {
  background: #ffffff;
  transition: all 0.3s ease;
}

.log-item:hover {
  transform: translateX(5px);
  background: #f8f9fa;
}

/* Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
