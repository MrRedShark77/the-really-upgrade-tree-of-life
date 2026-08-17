<script setup lang="ts">
import { hasUpgrade } from '@/data/upgrades';
import IncineratorTab from './IncineratorTab.vue';
import FurnaceTab from './FurnaceTab.vue';
import FlowerTab from './FlowerTab.vue';
import RadiationTab from './RadiationTab.vue';

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
    </div><div class="challenges-subtab" v-if="hasUpgrade('RO\\60')">
      <h3>The Radiation</h3>
      <hr class="sub-line" />
      <RadiationTab />
    </div><div class="challenges-subtab" v-if="hasUpgrade('RO\\61')">
      <h3>The Flower</h3>
      <hr class="sub-line" />
      <FlowerTab />
    </div>
  </div>
</template>
