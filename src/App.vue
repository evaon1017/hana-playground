<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'

const isCollapsed = ref(false)
const toggleMenu = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="d-flex">
    <div :class="['main-menu d-inline-block', { 'collapsed': isCollapsed }]">
      <div class="menu-head">
        <span v-if="!isCollapsed"><a href="/" class="text-decoration-none text-white fs-5">Hana Playground</a></span>
        <button @click="toggleMenu" class="btnMenuToogle btn btn-primary m-0">
          {{ isCollapsed ? '>' : '<' }} </button>
      </div>
    </div>
    <div class="w-100">
      <div class="px-3">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
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
