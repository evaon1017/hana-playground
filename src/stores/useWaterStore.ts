import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WaterContainer {
  id: string
  icon: string
  cc: number
}

export const useWaterStore = defineStore('water_containers', () => {
  const containers = ref<WaterContainer[]>([
    { id: '1', icon: '🥛', cc: 250 },
    { id: '2', icon: '☕', cc: 350 },
    { id: '3', icon: '🥤', cc: 500 },
  ])

  const addContainer = (icon: string, cc: number) => {
    containers.value.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      icon,
      cc
    })
  }

  const removeContainer = (id: string) => {
    containers.value = containers.value.filter(c => c.id !== id)
  }

  return { containers, addContainer, removeContainer }
}, {
  persist: true
})
