<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import Section from '@/components/Section.vue'
import Container from '@/components/Container.vue'
import Form from '@/components/Form.vue'
import TextInput from '@/components/TextInput.vue'
import TextArea from '@/components/TextArea.vue'
import FormLabel from '@/components/FormLabel.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import { type Config, ConfigStore } from '@/core/config.ts'
import Preloader from '@/components/Preloader.vue'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { resizeAsJpeg, toBase64 } from '@/core/image.ts'
import { join, sanitizeFilename } from '@/core/path.ts'
import { GithubApi } from '@/core/github-api.ts'

const path = ref("/")
const title = ref("")
const summary = ref("")
const content = ref("")
const image = ref<File>()
const imageUrl = computed(() => {
  return image.value ? URL.createObjectURL(image.value) : undefined
})
const githubCommitResult = ref<{ key: "success" } | { key: "loading" } | { key: "error", error: any }>()
const geminiApiResult = ref<{ key: "success" } | { key: "loading" } | { key: "error", error: any }>()
const config = ref<Config>()

onMounted(async () => {
  const c = ConfigStore.load()
  if (c) {
    config.value = c
  }
})

function uploadImage(e: Event) {
  image.value = (e.target as HTMLInputElement).files![0]
}

async function autoFill() {
  // apply max size to prevent consuming unnecessarily many tokens
  const resized = await resizeAsJpeg(image.value!, 1920, 2560)
  const imagePart = {
    inlineData: {
      data: await toBase64(resized),
      mimeType: "image/jpeg"
    }
  }
  const prompt = "Analyze this document by detecting the language, and output the result."
  const genAI = new GoogleGenerativeAI(config.value!.geminiApiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        description: "Document analysis result",
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "A simple title of this document in detected language",
            nullable: false
          },
          summary: {
            type: SchemaType.STRING,
            description: "The summary of this document in detected language",
            nullable: false
          },
          content: {
            type: SchemaType.STRING,
            description: "The full document content in detected language",
            nullable: false
          }
        }
      }
    }
  })

  geminiApiResult.value = { key: "loading" }
  try {
    const result = await model.generateContent([prompt, imagePart])
    const text = result.response.text()
    const resultJson = JSON.parse(text)

    title.value = resultJson["title"]
    summary.value = resultJson["summary"]
    content.value = resultJson["content"]

    geminiApiResult.value = { key: "success" }
  } catch (e) {
    geminiApiResult.value = { key: "error", error: e }
  }
}

async function commit() {
  const nowMillis = Date.now()
  const nowDate = new Date(nowMillis)
  const filenameBase = `${format(nowDate, "yyyy-MM-dd-HHmmSS")}_${sanitizeFilename(title.value, "_")}`
  const gitPathBase = join(config.value!.githubDataRoot, path.value)

  const docPath = join(gitPathBase, `${filenameBase}.adoc`)
  const imagePath = join(gitPathBase, `images/${filenameBase}.jpg`)

  let doc = `= ${title.value}\n`
  doc += `:mtime: ${nowMillis}\n`
  doc += "\n"
  doc += "== Summary\n"
  doc += "[horizontal]\n"
  doc += `Registered:: ${format(nowDate, "yyyy-MM-dd HH:mm:SS")}\n`
  doc += "\n"

  if (image.value) {
    doc += `image::./images/${filenameBase}.jpg[]\n`
    doc += "\n"
  }

  doc += "[%hardbreaks]\n"
  doc += summary.value
  doc += "\n\n"

  doc += "== Content\n"
  doc += "[%hardbreaks]\n"
  doc += content.value
  doc += "\n"

  const github = new GithubApi(config.value!.githubToken, config.value!.githubOwner, config.value!.githubRepo)
  githubCommitResult.value = { "key": "loading" }
  try {
    if (image.value) {
      // Resize because the requirement for this image is to tell how the doc looks to help users
      // to find the actual (physical) doc, rather than to store fully parseable image
      const resized = await resizeAsJpeg(image.value, 300, 400)
      await github.commitImage(`Add image for ${filenameBase}`, imagePath, resized)
    }
    await github.commitText(`Add doc for ${filenameBase}`, docPath, doc)
    githubCommitResult.value = { "key": "success" }
  } catch (e) {
    githubCommitResult.value = { key: "error", error: e }
  }
}
</script>

<template>
  <Container>
    <Form>
      <Section title="Document:">
        <Row>
          <Button @click="autoFill" :disabled="!image || !config || geminiApiResult?.key === 'loading'">
            <span v-if="config">Auto Fill from Image</span>
            <span v-else>You must setup Gemini API Key first in Config view</span>
          </Button>
          <Preloader :status="geminiApiResult"/>
        </Row>
        <Row>
          <FormLabel for="document-title">Title:</FormLabel>
          <TextInput id="document-title" placeholder="" v-model="title"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <FormLabel for="document-summary">Summary:</FormLabel>
          <TextArea id="document-summary" placeholder="" v-model="summary"
                    class="w-full md:w-4/5 lg:w-3/5 h-16"/>
        </Row>
        <Row>
          <FormLabel for="document-content">Content:</FormLabel>
          <TextArea id="document-content" placeholder="" v-model="content"
                    class="w-full md:w-4/5 lg:w-3/5 h-24"/>
        </Row>
        <Row>
          <div class="text-sm/6 text-gray-500">Image:</div>
          <label for="document-image"
                 class="inline-block border-1 rounded-sm pl-1 pr-1 hover:bg-slate-300 hover:cursor-pointer">
            Choose
          </label>
          <input type="file" id="document-image" accept="image/png,image/jpeg,image/jpg;capture=camera" @change="uploadImage" class="hidden" />
          <img v-if="image" :src="imageUrl" alt="document-image" class="max-w-80 mt-1 mb-1 border-1" />
        </Row>
      </Section>
      <Section title="Git:">
        <Row>
          <FormLabel for="git-path">Path:</FormLabel>
          <TextInput id="git-path" placeholder="/" v-model="path"
                     class="w-full md:w-4/5 lg:w-3/5"/>
        </Row>
        <Row>
          <Button @click="commit" :disabled="!config || !title || githubCommitResult?.key === 'loading'">
            <span v-if="config">Commit</span>
            <span v-else>You must setup GitHub token and owner/repo first in Config view</span>
          </Button>
          <Preloader :status="githubCommitResult"/>
        </Row>
      </Section>
    </Form>
  </Container>
</template>
