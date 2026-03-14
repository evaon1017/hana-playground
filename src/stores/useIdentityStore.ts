import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useIdentityStore = defineStore('identity', () => {
  const imagePath = ref('')
  const userId = ref('')

  function setImagePath(path: string) {
    imagePath.value = path
    if (!userId.value) {
      userId.value = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
    }
  }

  function clearUser() {
    imagePath.value = ''
    userId.value = ''
  }

  function generateUserId() {
    if (!userId.value) {
      userId.value = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
    }
  }

  return { imagePath, userId, setImagePath, clearUser, generateUserId }
}, {
  persist: true
})
