<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { format } from 'date-fns'
import YAML from 'yaml'
import { Octokit } from '@octokit/rest'
import { GoogleGenerativeAI } from "@google/generative-ai"

const token = ref("")
const githubPat = ref("")
const geminiApiKey = ref("")
const { getAccessTokenSilently, user } = useAuth0()

const query = new URLSearchParams(window.location.search)
const auth0Domain = query.get("auth0domain")

onMounted(async () => {
  token.value = await getAccessTokenSilently()
  console.log(user.value!)
  const response = await fetch(`https://${auth0Domain}/api/v2/users/${user.value!.sub}`, {
    headers: {
      Authorization: `Bearer ${token.value!}`
    }
  })
  const result = await response.json()
  const metadata = result["user_metadata"] || {}
  githubPat.value = metadata["github_pat"] || ""
  geminiApiKey.value = metadata["geminiApiKey"] || ""
  console.log(result)
})

async function update() {
  const response = await fetch(`https://${auth0Domain}/api/v2/users/${user.value!.sub}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token.value!}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_metadata: {
        github_pat: githubPat.value!,
        geminiApiKey: geminiApiKey.value!,
      }
    })
  })
  console.log(response)
}

async function commitContent() {
  const octokit = new Octokit({
    auth: githubPat.value!
  })
  const now = new Date()
  const yyyyMMdd = format(now, "yyyy-MM-dd-HHmmSS")
  const opath = `${path.value!.replace(/\/$/, "").replace(/^\//, "")}/${yyyyMMdd}_${content.value!.name.replace(/[/\\:*?"<>|]/g, "_")}.adoc`
  // const contentBytes = new TextEncoder().encode(YAML.stringify(content.value!))
  const contentAsciidoc = `= ${content.value.name}

* 登録日時: ${format(now, "yyyy-MM-dd HH:mm:SS")}
* タグ:
${content.value.tags.map((t) => "** " + t).join("\n")}

== Summary
[%hardbreaks]

${content.value.summary}`

  const contentBytes = new TextEncoder().encode(contentAsciidoc)
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: "ocadaruma",
    repo: "spotlight-data",
    path: opath,
    message: "update",
    content: btoa(Array.from(contentBytes, (b) => String.fromCharCode(b)).join(""))
  })
  alert("DONE REGISTER")
}

async function fillByGemini() {
  const reader = new FileReader()
  const promise = new Promise<string>((resolve, _) => {
    reader.onloadend = () => {
      resolve(reader.result.split(",")[1])
    }
  })
  reader.readAsDataURL(image.value!)
  const base64 = await promise
  const imagePart = {
    inlineData: {
      data: base64,
      mimeType: image.value!.type
    }
  }
  console.log(imagePart)
  const prompt = `Analyze this document and output JSON result in below schema.
  Please do not enclose output JSON with back quote or anything, so that the result is directly parseable as JSON.

  {
    "name": {A simple title of this document in Japanese},
    "summary": {The summary of this document in Japanese},
    "tags": [
       {Tags for this document in English. Each tag must be short enough and consist of only one word},
       ...
    ]
  }
  `
  const genAI = new GoogleGenerativeAI(geminiApiKey.value!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const result = await model.generateContent([prompt, imagePart])
  console.log(result)

  const text = result.response.text()
  console.log(text)
  const resultJson = JSON.parse(text)

  content.value.name = resultJson["name"]
  content.value.summary = resultJson["summary"]
  content.value.tags = resultJson["tags"]
}

function uploadImage(e) {
  image.value = e.target.files[0]
}

const path = ref("")
const image = ref<File>(null)
const content = ref<{ name: string, summary: string, tags: [string] }>({
  name: "",
  summary: "",
  tags: []
})

const imageUrl = computed(() => {
  return image.value ? URL.createObjectURL(image.value) : null
})
</script>
<template>
  <div>
    <h1>Settings</h1>
    <div>
      <input type="text" name="githubPat" v-model="githubPat" required placeholder="<your pat>">
    </div>
    <div>
      <input type="text" name="geminiApiKey" v-model="geminiApiKey" required placeholder="<your gemini API key>">
    </div>
    <div>
      <button @click="update">Update</button>
    </div>
    <hr>
    <div>
      <div>
        <input type="text" v-model="path" placeholder="/path/to/object" class="border-1">
      </div>
      <div>
        <div>name:</div>
        <div class="ml-4">{{ content.name }}</div>
      </div>
      <div>
        <div>summary:</div>
        <div class="ml-4">{{ content.summary }}</div>
      </div>
      <div>
        <div>tags:</div>
        <div class="ml-4">
          <span v-for="(tag, idx) in content.tags" :key="idx"><span v-if="idx > 0">,</span>{{ tag }}</span>
        </div>
      </div>
      <div>
        <button class="border-1" @click="fillByGemini">Fill by AI (Gemini)</button>
      </div>
      <div>
        <button class="border-1" @click="commitContent">COMMIT</button>
      </div>
      <div>
        <input type="file" accept="image/*" @change="uploadImage"/>
        <img :src="imageUrl" width="640">
      </div>
    </div>
  </div>
</template>

<style>

</style>
