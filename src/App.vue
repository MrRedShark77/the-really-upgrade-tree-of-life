<script setup lang="ts">
import Decimal from 'break_eternity.js';
import { load, player, temp } from './main';
import { formatGain, formatTime } from './utils/formats';
import { TABS } from './data/tabs';
import TabButtons from './components/TabButtons.vue';
import BottomFrame from './components/BottomFrame.vue';
import DevWindow from './components/dev/DevWindow.vue';

load()

const dev = import.meta.env.DEV
</script>

<template>
  <div style="min-height: 60px;">
    Your tree is <h3>{{ formatTime(player.age) }}</h3> <span v-if="Decimal.gt(temp.currencies.age, 0)">{{ formatGain(player.age, temp.currencies.age, formatTime) }}</span> old.
  </div>
  <hr class="line">
  <TabButtons/>
  <component :is="TABS[player.tab].stabs[player.stab[player.tab]][0]"/>
  <BottomFrame />
  <DevWindow v-if="dev" />
</template>

<style scoped>

</style>
