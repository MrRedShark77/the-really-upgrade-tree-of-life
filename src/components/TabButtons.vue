<script setup lang="ts">
import { setTab, TABS } from '@/data/tabs';
import PrimaryButton from './PrimaryButton.vue';
import { player } from '@/main';
import { computed } from 'vue';

const STAB = computed(() => TABS[player.tab].stabs)
</script>

<template>
  <div style="margin: 5px;">
    <div class="table-center">
      <div v-for="x in TABS.length" :key="x">
        <PrimaryButton class="tab-button" v-if="TABS[x-1].condition?.() ?? true" :class="TABS[x-1].class" :style="TABS[x-1].style" @click="setTab(x-1)">{{ TABS[x-1].name }}</PrimaryButton>
      </div>
    </div>
    <component :is="TABS[player.tab].pre_stab" />
    <div class="table-center" v-if="STAB.length > 1" style="min-height: 60px;">
      <div v-for="x in STAB.length" :key="x-1">
        <PrimaryButton class="stab-button" v-if="STAB[x-1][2]?.() ?? true" @click="setTab(x-1,true)">{{ STAB[x-1][1] }}</PrimaryButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-button, .stab-button {
  --button-color: #ccc
}
.tab-button {
  font-size: 20px;
}
.stab-button {
  width: 200px;
}
</style>
