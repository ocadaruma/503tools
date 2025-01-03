<script setup lang="ts">
defineProps(["for"])
</script>

<template>
  <label :for="$props.for" class="block text-sm/6 text-gray-500">
    <slot/>
  </label>
</template>
