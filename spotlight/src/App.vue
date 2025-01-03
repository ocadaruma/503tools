<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <nav class="bg-slate-200 border-b-1">
    <RouterLink class="inline-block border-1 rounded-sm p-1 m-1 text-sm" to="/">Home</RouterLink>
    <RouterLink class="inline-block border-1 rounded-sm p-1 m-1 text-sm" to="/config">Config</RouterLink>
  </nav>
    <RouterView />
</template>
