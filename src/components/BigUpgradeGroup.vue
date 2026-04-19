<script setup lang="ts">
import { BigUpgradeColors, BigUpgradeGroups } from '@/data/big_upgrades';
import BigUpgradeItem from './BigUpgradeItem.vue';

const { group, width } = defineProps({
  group: String,
  width: {
    type: Number,
    default: 3
  },
})
</script>

<template>
  <div class="big-upgrades-table" :style="{'--width': width}">
    <BigUpgradeItem v-for="x in BigUpgradeGroups[group]" :key="'bu'+x" :n="x" :style="{'--button-color': BigUpgradeColors[group]}" />
  </div>
</template>
