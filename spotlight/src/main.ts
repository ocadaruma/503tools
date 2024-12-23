import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import App0 from './App0.vue'
import router from './router'
import { createAuth0 } from '@auth0/auth0-vue'

const query = new URLSearchParams(window.location.search)
const domain = query.get("auth0domain")
const clientId = query.get("auth0clientId")

if (!domain || !clientId) {
  createApp(App0).mount("#app")
} else {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)

  app.use(
    createAuth0({
      domain,
      clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: `https://${domain}/api/v2/`,
        scope: "read:current_user update:current_user_metadata"
      }
    })
  )

  app.mount("#app")
}
