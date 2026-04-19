<script setup lang="ts">
import { computed } from 'vue';

// const { enabled = true, bought = false } = defineProps<{ enabled: boolean, bought: boolean }>()

const { enabled, bought, type } = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  bought: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: "primary"
  }
})

const classObject = computed(() => {
  return {
    [`o-${type}-btn`]: true,
    "o-primary-btn--disabled": !bought && !enabled,
    "o-primary-btn--bought": bought,
  }
})

</script>

<template>
  <button
    :class="classObject"
  >
    <slot/>
  </button>
</template>
