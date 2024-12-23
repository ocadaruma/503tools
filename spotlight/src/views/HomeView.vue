<script setup lang="ts">
import http from 'isomorphic-git/http/web'
import git from 'isomorphic-git'
import fs from '@zenfs/core'
import { Octokit } from '@octokit/rest'
import { ref } from 'vue'
import { format } from 'date-fns'
import YAML from 'yaml'
import { useAuth0 } from '@auth0/auth0-vue'

const path = ref("")
const content = ref<{ name: string, description: string, tags: [string] }>({
  name: "test",
  description: "test desc",
  tags: ["ab", "cd"]
})

const { loginWithRedirect, getAccessTokenSilently, logout, user, isAuthenticated } = useAuth0()

function login() {
  return loginWithRedirect()
}

function myLogout() {
  return logout()
}

async function getToken() {
  const token = await getAccessTokenSilently()
  console.log(token)
}
</script>

<template>
  <div class="container">
    <div>
      <button class="border-1" @click="login">LOGIN</button>
      <button class="border-1" @click="myLogout">LOGOUT</button>
      <button class="border-1" @click="getToken">GET TOKEN</button>
      <div v-if="isAuthenticated">{{ user }}</div>
    </div>
  </div>
</template>
