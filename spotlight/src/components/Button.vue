<script setup lang="ts">
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button :disabled="disabled"
          class="border-1
                 rounded-sm pl-1 pr-1
                 hover:enabled:bg-slate-300 hover:enabled:cursor-pointer disabled:opacity-30">
    <slot/>
  </button>
</template>
