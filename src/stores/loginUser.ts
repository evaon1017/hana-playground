import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLoginUserStore = defineStore('loginUser', () => {
  const userName = ref('')
  const imagePath = ref('')
  function setUserName(name: string) {
    userName.value = name
  }
  function setImagePath(path: string) {
    imagePath.value = path
  }

  function clearUser() {
    userName.value = ''
    imagePath.value = ''
  }

  return { userName, setUserName, imagePath, setImagePath, clearUser }
}, {
  persist: true
})
