<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Container from '@/components/Container.vue'
import Button from '@/components/Button.vue'
import Row from '@/components/Row.vue'
import Section from '@/components/Section.vue'
import { type Config, ConfigStore } from '@/core/config.ts'
import TextInput from '@/components/TextInput.vue'
import Form from '@/components/Form.vue'
import FormLabel from '@/components/FormLabel.vue'
import { GithubApi } from '@/core/github-api.ts'
import Preloader from '@/components/Preloader.vue'

const config = reactive<Config>({
  geminiApiKey: '', githubDataRoot: '', githubOwner: '', githubRepo: '', githubToken: ''
})
const githubTestResult = ref<{ key: "success" } | { key: "loading" } | { key: "error", error: Error }>()

onMounted(() => {
  const c = ConfigStore.load()
  if (c) {
    Object.assign(config, c)
  }
})

async function saveCredentials() {
  ConfigStore.save(config)
}

async function saveGitHubConfig() {
  const github = new GithubApi(config.githubToken, config.githubOwner, config.githubRepo)
  githubTestResult.value = { key: "loading" }
  const result = await github.checkAccess()
  if (result.key === "ok") {
    githubTestResult.value = { key: "success" }
    ConfigStore.save(config)
  } else {
    githubTestResult.value = { key: "error", error: result.error }
  }
}

</script>
<template>
  <Container>
    <Form>
      <Section title="Credentials:">
        <Row>
          <div class="text-sm/6">⚠️For now, these values will be persisted in local storage, which is potentially unsecure against various attacks.</div>
        </Row>
        <Row>
          <FormLabel for="github-personal-access-token">GitHub Personal Access Token:</FormLabel>
          <TextInput id="github-personal-access-token" placeholder="<your GitHub Personal Access Token (PAT)>" v-model="config.githubToken"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <FormLabel for="gemini-api-key">Gemini API Key:</FormLabel>
          <TextInput id="gemini-api-key" placeholder="<your Gemini API Key>" v-model="config.geminiApiKey"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <Button @click="saveCredentials" :disabled="!config.githubToken || !config.geminiApiKey">Save credentials</Button>
        </Row>
      </Section>
    </Form>

    <Form>
      <Section title="Git/GitHub config:">
        <Row>
          <!--    TODO: Validation      -->
          <FormLabel for="github-owner">GitHub Owner:</FormLabel>
          <TextInput id="github-owner" placeholder="<GitHub Owner>" v-model="config.githubOwner"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <FormLabel for="github-repo">GitHub Repository:</FormLabel>
          <TextInput id="github-repo" placeholder="<GitHub Repository>" v-model="config.githubRepo"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <FormLabel for="git-data-root">Root path to store data:</FormLabel>
          <TextInput id="git-data-root" placeholder="/" v-model="config.githubDataRoot"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <Button @click="saveGitHubConfig" :disabled="!(config.githubToken && config.githubOwner && config.githubRepo && config.githubDataRoot)">
            Test & Save
          </Button>
          <Preloader :status="githubTestResult"/>
        </Row>
      </Section>
    </Form>
  </Container>
</template>
