<script setup lang="ts">
defineProps(["title"])
</script>
<template>
  <div class="mt-4 bg-slate-100 color-gray-500 text-sm/5">{{ title }}</div>
  <hr class="border-gray-400 mb-2">
  <slot/>
</template>
