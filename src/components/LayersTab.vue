<script setup lang="ts">
import { LayerKeys } from '@/data/layers';
import LayerFrame from './LayerFrame.vue';

</script>

<template>
  <div id="layer-table">
    <LayerFrame v-for="x in LayerKeys" :layer_id="x" :key="'L-'+x"/>
  </div>
</template>
