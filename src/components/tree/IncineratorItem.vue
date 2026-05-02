<script setup lang="ts">
import { Incinerator } from '@/data/incinerator';
import PrimaryButton from '../PrimaryButton.vue';
import { format, formatMult } from '@/utils/formats';
import { player } from '@/main';
import { Currencies } from '@/data/currencies';
import { Effects } from '@/utils/effect';
import type { DecimalSource } from 'break_eternity.js';
import Decimal from 'break_eternity.js';

const { n } = defineProps<{ n: number }>()

const I = Incinerator.levels[n], C = Currencies[I[2]]

function changeLevel(inc: DecimalSource) { player.incinerator[n][0] = Decimal.add(player.incinerator[n][0], inc).clamp(0,Incinerator.limit) }
</script>

<template>
  <div v-if="I[0]()" class="incinerator-frame">
    <div class="incinerator-frame-level">
      <PrimaryButton @click="player.incinerator[n][0] = 0">=0</PrimaryButton>
      <PrimaryButton @click="changeLevel(-1)">-1</PrimaryButton>
      <div>
        Level <h4>{{ format(player.incinerator[n][1],0) }}</h4> ({{ format(player.incinerator[n][0],0) }})
      </div>
      <PrimaryButton @click="changeLevel(1)">+1</PrimaryButton>
      <PrimaryButton @click="player.incinerator[n][0] = Incinerator.limit">Max</PrimaryButton>
    </div>
    <div>{{ formatMult(Effects["inc-nerf-"+n].temp) }} ➜ <h4>{{ formatMult(I[1](player.incinerator[n][0])) }}</h4> {{ C.name }}</div>
  </div>
</template>

<style>
.incinerator-frame {
  width: 360px;
  height: 100px;
  padding: 5px;

  border: solid 2px orange;
  box-shadow: 0px 0px 10px orange;
  background-color: #4c1400;

  color: white;

  display: grid;
  grid-template-rows: 40px 1fr;
  align-items: center;
}

.incinerator-frame-level {
  display: grid;
  grid-template-columns: 40px 40px 1fr 40px 40px;
  align-self: stretch;

  & > button {
    margin: 0px;
    padding: 0px;
    font-size: 16px;
    font-weight: bold;
  }

  & > div {
    align-self: center;
  }
}
</style>
