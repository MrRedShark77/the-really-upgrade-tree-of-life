<script setup lang="ts">
import { Weathers } from '@/data/challenges';
import PrimaryButton from './PrimaryButton.vue';
import { player, temp } from '@/main';
import { format } from '@/utils/formats';
import { computed } from 'vue';
import Decimal from 'break_eternity.js';

const { n } = defineProps<{ n: number }>()

const W = Weathers.ctn[n]

const style = computed(() => {
  return {
    "--button-color": player.weather.active === n ? Decimal.gte(W.amount, W.goal[0]) ? "#88ff88" : "#ff6666" : "#b1c4eb"
  }
})
</script>

<template>
  <PrimaryButton v-if="n === 0 || player.first.weather[n-1]" @click="Weathers.enter(n)" :style>
    <h4>{{ W.name }}<sup v-if="Decimal.gt(player.weather.best[n][1], 1)">{{ format(player.weather.best[n][1],0) }}</sup></h4>
    <hr class="sub-line" />
    <div v-html="W.nerf[1](W.nerf[0](player.weather.best[n][1]))"></div>
    <hr class="sub-line" />
    <b>Goal:</b> {{ W.goal[1](W.goal[0]) }}<br>
    <b>Best score:</b> {{ format(player.weather.best[n][0]) }} / {{ format(W.goal_intensity(player.weather.best[n][1])) }}
    <hr class="sub-line" />
    <b>Reward:</b> <span v-html="W.reward[1](temp.weathers[n])"></span>
  </PrimaryButton>
</template>
