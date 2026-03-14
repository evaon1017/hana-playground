<script setup lang="ts">
import { ref } from 'vue'
import { useIdentityStore } from '@/stores/useIdentityStore'
import { compressImage } from '@/utils/imageUtils'

const identityStore = useIdentityStore()
const fileInput = ref<HTMLInputElement | null>(null)

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
  <div class="d-flex justify-content-center align-items-center border-bottom pb-3 pt-3 bg-light">
    <!-- 隱藏的檔案選擇器 -->
    <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileChange">

    <div v-if="identityStore.imagePath">
      <img :src="identityStore.imagePath" alt="User Avatar" class="user-avatar"
        @click="fileInput?.click()" title="點擊更換大頭貼">
    </div>
    <div v-else>
      <button class="btn btn-primary d-flex align-items-center shadow-sm" @click="fileInput?.click()">
        <span class="material-symbols-outlined me-2">person_add</span>
        <span>選擇頭像</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-avatar {
  max-width: 80px; /* modified from 200px to be a more standard header size */
  max-height: 80px; 
  border-radius: 50%;
  cursor: pointer;
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.user-avatar:hover {
  transform: scale(1.05);
}
</style>
