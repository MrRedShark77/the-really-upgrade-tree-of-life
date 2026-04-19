<script setup lang="ts">
import { Auto } from '@/data/automation';
import { Cell } from '@/data/cell';
import { player } from '@/main';
import { format } from '@/utils/formats';
import { computed } from 'vue';
import PrimaryButton from './PrimaryButton.vue';
import Decimal from 'break_eternity.js';

const CP = computed(() => Cell.cellular_power.amount)

function toggle(id: string) {
  if (player.auto.enabled[id] || Decimal.gte(CP.value, Auto[id].cost)) player.auto.enabled[id] = !player.auto.enabled[id];
}
</script>

<template>
  <p>You have <span class="big-text">{{ format(CP,0) }} / {{ format(player.auto.total,0) }}</span> (next at <b>{{ format(Cell.cellular_power.requirement) }}</b> Cells) Cellular Setup.</p>
  <div id="automation-table">
    <template v-for="(a, id) in Auto" :key="'auto-'+id">
      <PrimaryButton v-if="a.condition()" :style="{'--button-color': a.color ?? 'white'}" :enabled="player.auto.enabled[id] || Decimal.gte(CP, a.cost)" @click="toggle(id)">
        <b>{{ a.name }}</b>
        <hr class="sub-line" />
        <span v-html="a.description"></span> <b>[{{ player.auto.enabled[id] ? 'Enabled' : 'Disabled' }}]</b>
        <hr class="sub-line" />
        Cost: {{ format(a.cost,0) }} CS
      </PrimaryButton>
    </template>
  </div>
</template>

<style>
#automation-table {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(4, 240px);
  grid-auto-rows: 150px;
  gap: 5px;

  & > button {
    margin: 0px;
  }
}
</style>
