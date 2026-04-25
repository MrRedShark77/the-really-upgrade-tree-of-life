<script setup lang="ts">
import { hasUpgrade } from '@/data/upgrades';
import IncineratorTab from './IncineratorTab.vue';
import FurnaceTab from './FurnaceTab.vue';

</script>

<template>
  <div class="challenges-table">
    <div class="challenges-subtab">
      <h3>The Incinerator</h3>
      <hr class="sub-line" />
      <IncineratorTab />
    </div><div class="challenges-subtab" v-if="hasUpgrade('RO\\35')">
      <h3>The Furnace</h3>
      <hr class="sub-line" />
      <FurnaceTab />
    </div>
  </div>
</template>
