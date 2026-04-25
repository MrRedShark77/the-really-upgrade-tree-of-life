<script setup lang="ts">
import { Seasons } from '@/data/challenges';
import PrimaryButton from './PrimaryButton.vue';
import { player } from '@/main';
import { format } from '@/utils/formats';
import { computed } from 'vue';
import Decimal from 'break_eternity.js';

const { n } = defineProps<{ n: number }>()

const W = Seasons.ctn[n]

const style = computed(() => {
  return {
    "--button-color": player.season.active === n ? Decimal.gte(W.amount, W.goal[0]) ? "#88ff88" : "#ff6666" : "#dddf24"
  }
})
</script>

<template>
  <PrimaryButton v-if="n === 0 || player.first.season[n-1]" @click="Seasons.enter(n)" :style>
    <h4>{{ W.name }}</h4>
    <hr class="sub-line" />
    <div v-html="W.nerf[1](W.nerf[0](player.season.best[n][1]))"></div>
    <hr class="sub-line" />
    <b>Goal:</b> {{ W.goal[1](W.goal[0]) }}<br>
    <b>Best score:</b> {{ format(player.season.best[n][0]) }} / {{ format(W.goal_intensity(player.season.best[n][1])) }}
    <hr class="sub-line" />
    <b>Reward:</b> <span v-html="W.reward"></span>
  </PrimaryButton>
</template>
