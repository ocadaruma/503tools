<script setup lang="ts">
defineProps(["placeholder", "name"])

const model = defineModel<string>()
</script>

<template>
  <textarea class="border-1 rounded-sm p-0.5"
            :placeholder="placeholder"
            :name="name"
            v-model="model" />
</template>

<style scoped>

</style>
