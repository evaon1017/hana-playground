import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useIdentityStore = defineStore('identity', () => {
  const imagePath = ref('')
  function setImagePath(path: string) {
    imagePath.value = path
  }

  function clearUser() {
    imagePath.value = ''
  }

  return { imagePath, setImagePath, clearUser }
}, {
  persist: true
})
