<script setup lang="ts">
defineProps(["placeholder", "name"])

const model = defineModel()
</script>

<template>
  <input class="block border-1 rounded-sm p-0.5"
         type="text"
         :placeholder="placeholder"
         :name="name"
         v-model="model" />
</template>

<style scoped>

</style>
