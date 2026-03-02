import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/main.scss'

import 'bootstrap'

const app = createApp(App)

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)

app.mount('#app')
