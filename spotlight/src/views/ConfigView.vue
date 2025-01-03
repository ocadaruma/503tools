<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import Container from '@/components/Container.vue'
import Button from '@/components/Button.vue'
import Row from '@/components/Row.vue'
import Section from '@/components/Section.vue'
import { Auth0ConfigStore, CredentialsStore, type GitHubConfig, GitHubConfigStore } from '@/core/config.ts'
import TextInput from '@/components/TextInput.vue'
import Form from '@/components/Form.vue'
import FormLabel from '@/components/FormLabel.vue'
import { GithubApi } from '@/core/github-api.ts'
import Preloader from '@/components/Preloader.vue'

const githubToken = ref("")
const geminiApiKey = ref("")
const githubConfig = reactive<GitHubConfig>({
  owner: "",
  repo: "",
  root: "/"
})
const githubTestResult = ref<null | { key: "success" } | { key: "loading" } | { key: "error", error: Error }>(null)
const { checkSession, loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently } = useAuth0()

const auth0Config = Auth0ConfigStore.load()!

async function getCredentialsStore() {
  const token = await getAccessTokenSilently()
  return new CredentialsStore(auth0Config.domain, token, user.value)
}

onMounted(async () => {
  await checkSession()
  if (isAuthenticated.value) {
    const store = await getCredentialsStore()
    const credentials = await store.load()
    githubToken.value = credentials?.githubToken
    geminiApiKey.value = credentials?.geminiApiKey
  }
  const loadedGithubConfig = GitHubConfigStore.load()
  if (loadedGithubConfig) {
    githubConfig.owner = loadedGithubConfig.owner
    githubConfig.repo = loadedGithubConfig.repo
    githubConfig.root = loadedGithubConfig.root
  }
})

function resetAuth0() {
  Auth0ConfigStore.save({ domain: "", clientId: "" })
  location.reload()
}

async function saveCredentials() {
  const token = await getAccessTokenSilently()
  const store = new CredentialsStore(auth0Config.domain, token, user.value)
  await store.save({
    githubToken: githubToken.value,
    geminiApiKey: geminiApiKey.value
  })
}

async function saveGitHubConfig() {
  const github = new GithubApi(githubToken.value, githubConfig.owner, githubConfig.repo)
  githubTestResult.value = { key: "loading" }
  const result = await github.checkAccess()
  if (result.key === "ok") {
    githubTestResult.value = { key: "success" }
    GitHubConfigStore.save(githubConfig)
  } else {
    githubTestResult.value = { key: "error", error: result.error }
  }
}

async function logoutAuth0() {
  await logout({
    async openUrl(url) {
      console.log(url)
      location.replace(url)
    }
  })
}

</script>
<template>
  <Container>
    <Form>
      <Section title="Auth0 config:">
        <Row>
          <Button @click="loginWithRedirect" :disabled="isAuthenticated">Auth0 Login</Button>
        </Row>
        <Row>
          <Button @click="logoutAuth0" :disabled="!isAuthenticated">Auth0 Logout</Button>
        </Row>
        <Row>
          <Button @click="resetAuth0">Reset auth0 domain/client ID</Button>
        </Row>
      </Section>
    </Form>

    <Form>
      <Section title="Credentials:">
        <Row>
          <div class="text-sm/6">These values will be persisted in auth0 user metadata rather than client-side for security reason.</div>
        </Row>
        <Row>
          <FormLabel for="github-personal-access-token">GitHub Personal Access Token:</FormLabel>
          <TextInput id="github-personal-access-token" placeholder="<your GitHub Personal Access Token (PAT)>" v-model="githubToken"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <FormLabel for="gemini-api-key">Gemini API Key:</FormLabel>
          <TextInput id="gemini-api-key" placeholder="<your Gemini API Key>" v-model="geminiApiKey"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <Button @click="saveCredentials" :disabled="!githubToken || !geminiApiKey || !isAuthenticated">
            <span v-if="isAuthenticated">Save credentials</span>
            <span v-else>You must login on Auth0 before saving credentials</span>
          </Button>
        </Row>
      </Section>
    </Form>

    <Form>
      <Section title="Git/GitHub config:">
        <Row>
          <div class="text-sm/6">These values will be persisted in localStorage.</div>
        </Row>
        <Row>
          <!--    TODO: Validation      -->
          <FormLabel for="github-owner">GitHub Owner:</FormLabel>
          <TextInput id="github-owner" placeholder="<GitHub Owner>" v-model="githubConfig.owner"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <FormLabel for="github-repo">GitHub Repository:</FormLabel>
          <TextInput id="github-repo" placeholder="<GitHub Repository>" v-model="githubConfig.repo"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <FormLabel for="git-data-root">Root path to store data:</FormLabel>
          <TextInput id="git-data-root" placeholder="/" v-model="githubConfig.root"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <Button @click="saveGitHubConfig" :disabled="!githubToken || !(githubConfig.owner && githubConfig.repo && githubConfig.root)">
            <span v-if="githubToken">Test & Save</span>
            <span v-else>You must input GitHub PAT and owner/repo above</span>
          </Button>
          <Preloader :status="githubTestResult"/>
        </Row>
      </Section>
    </Form>
  </Container>
</template>
