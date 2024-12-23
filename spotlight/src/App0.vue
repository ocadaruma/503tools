<script setup lang="ts">
import { ref } from 'vue'

const domain = ref("")
const clientId = ref("")

function start() {
  const query = new URLSearchParams(window.location.search)
  query.set("auth0domain", domain.value!)
  query.set("auth0clientId", clientId.value!)
  window.location.search = query.toString()
}
</script>

<template>
  <div class="font-mono">
    <div>You need to specify auth0 domain and clientId.</div>
    <div>
      <div>
        <input type="text" name="domain" v-model="domain" required placeholder="<your auth0 domain>.auth0.com">
      </div>
      <div>
        <input type="text" name="client-id" v-model="clientId" required placeholder="<your auth0 client id>">
      </div>
      <div>
        <button @click="start">Start</button>
      </div>
    </div>
  </div>
</template>

<!--<style scoped>-->
<!--header {-->
<!--  line-height: 1.5;-->
<!--  max-height: 100vh;-->
<!--}-->

<!--.logo {-->
<!--  display: block;-->
<!--  margin: 0 auto 2rem;-->
<!--}-->

<!--nav {-->
<!--  width: 100%;-->
<!--  font-size: 12px;-->
<!--  text-align: center;-->
<!--  margin-top: 2rem;-->
<!--}-->

<!--nav a.router-link-exact-active {-->
<!--  color: var(&#45;&#45;color-text);-->
<!--}-->

<!--nav a.router-link-exact-active:hover {-->
<!--  background-color: transparent;-->
<!--}-->

<!--nav a {-->
<!--  display: inline-block;-->
<!--  padding: 0 1rem;-->
<!--  border-left: 1px solid var(&#45;&#45;color-border);-->
<!--}-->

<!--nav a:first-of-type {-->
<!--  border: 0;-->
<!--}-->

<!--@media (min-width: 1024px) {-->
<!--  header {-->
<!--    display: flex;-->
<!--    place-items: center;-->
<!--    padding-right: calc(var(&#45;&#45;section-gap) / 2);-->
<!--  }-->

<!--  .logo {-->
<!--    margin: 0 2rem 0 0;-->
<!--  }-->

<!--  header .wrapper {-->
<!--    display: flex;-->
<!--    place-items: flex-start;-->
<!--    flex-wrap: wrap;-->
<!--  }-->

<!--  nav {-->
<!--    text-align: left;-->
<!--    margin-left: -1rem;-->
<!--    font-size: 1rem;-->

<!--    padding: 1rem 0;-->
<!--    margin-top: 1rem;-->
<!--  }-->
<!--}-->
<!--</style>-->
