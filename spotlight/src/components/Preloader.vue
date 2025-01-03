<script setup lang="ts">
defineProps<{
  status?: { key: "success" } | { key: "loading" } | { key: "error", error: any }
}>()
</script>

<template>
  <span v-if="status?.key === 'success'" class="m-1 text-green-500">&#x2714;</span>
  <span v-if="status?.key === 'loading'" class="m-1 loading"></span>
  <span v-if="status?.key === 'error'" class="m-1 text-red-500">Failed. {{ status.error.message }}</span>
</template>

<style scoped>
@keyframes loading {
  0% { content: "/"; }
  25% { content: "-"; }
  50% { content: "\\"; }
  75% { content: "|"; }
  100% { content: "/"; }
}
.loading::after {
  content: "";
  animation: loading 0.5s infinite;
}
</style>
