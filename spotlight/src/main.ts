import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import App0 from './App0.vue'
import router from './router'
import { createAuth0 } from '@auth0/auth0-vue'
import { Auth0ConfigStore } from '@/core/config.ts'

const auth0config = Auth0ConfigStore.load()

if (!auth0config) {
  createApp(App0).mount("#app")
} else {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)

  app.use(
    createAuth0({
      domain: auth0config.domain,
      clientId: auth0config.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin + window.location.pathname,
        // to use management API for storing credentials in user metadata
        audience: `https://${auth0config.domain}/api/v2/`,
        scope: "read:current_user update:current_user_metadata"
      }
    })
  )

  app.mount("#app")
}
