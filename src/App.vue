<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { useIdentityStore } from './stores/useIdentityStore'
import { compressImage } from '@/utils/imageUtils';
import ScoreNotifyToast from './components/ScoreNotifyToast.vue';

const isCollapsed = ref(false)
const identityStore = useIdentityStore()
const toggleMenu = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      const compressedImage = await compressImage(file, 100);
      identityStore.setImagePath(compressedImage);
    } catch (error) {
      console.error('Image compression failed:', error);
    }
  }
}
</script>

<template>
  <div class="d-flex">
    <div :class="['main-menu d-inline-block', { 'collapsed': isCollapsed }]">
      <div class="menu-head">
        <span v-if="!isCollapsed"><a href="/" class="text-decoration-none text-white fs-5 fw-bold">Hana
            Playground</a></span>
        <button @click="toggleMenu" class="btnMenuToogle btn btn-primary m-0">
          {{ isCollapsed ? '>' : '<' }} </button>
      </div>

      <!-- 選單項目區塊 -->
      <div class="menu-items mt-3 d-flex flex-column gap-3 px-3">
        <RouterLink to="/"
          class="btn btn-light rounded-pill d-flex align-items-center justify-content-center fs-4 fw-bold shadow-sm"
          style="white-space: nowrap;" title="兩個數字相加">
          <span v-show="!isCollapsed">🍎 + 🍎</span>
        </RouterLink>
        <RouterLink to="/plus3"
          class="btn btn-light rounded-pill d-flex align-items-center justify-content-center fs-4 fw-bold shadow-sm"
          style="white-space: nowrap;" title="三個數字相加">
          <span v-show="!isCollapsed">🍎+🍎+🍎</span>
        </RouterLink>
      </div>
    </div>
    <div class="w-100">
      <div class="d-flex justify-content-center align-items-center border-bottom">
        <div v-if="identityStore.imagePath">
          <img :src="identityStore.imagePath" alt="" style="max-width: 200px; max-height: 200px; border-radius: 50%;"
            data-bs-toggle="modal" data-bs-target="#identityModal">
        </div>
        <div v-else>
          <button class="btn btn-primary d-flex align-items-center shadow-sm" data-bs-toggle="modal"
            data-bs-target="#identityModal">
            <span class="material-symbols-outlined me-2">person_add</span>
          </button>
        </div>
      </div>
      <div class="px-3">
        <RouterView />
      </div>
    </div>
  </div>
  <div class="modal fade" id="identityModal" tabindex="-1" aria-labelledby="identityModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">你是誰？</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex justify-content-around">
            <div class="row">
              <div class="input-group">
                <span class="input-group-text">挑個照片吧</span>
                <input type="file" class="form-control" accept="image/*" @change="handleFileChange">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">我決定了</button>
        </div>
      </div>
    </div>
  </div>
  <ScoreNotifyToast />
</template>

<style scoped>
.material-symbols-outlined {
  font-size: 20px;
  vertical-align: middle;
}

.main-menu {
  width: 200px;
  height: 100vh;
  background-color: #ec111152;
  transition: width 0.5s ease;
  overflow: hidden;
  left: 0;
  top: 0;
}

.main-menu.collapsed {
  width: 30px;
}

.menu-head {
  position: relative;
  width: 100%;
  height: 50px;
  background-color: #1724db93;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btnMenuToogle {
  position: absolute;
  right: 0;
  height: 100%;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0px;
}
</style>
