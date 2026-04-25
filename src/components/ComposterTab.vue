<script setup lang="ts">
import { Composter } from '@/data/composter';
import { Effects } from '@/utils/effect';
import { format, formatMult } from '@/utils/formats';
import Decimal from 'break_eternity.js';
import { computed } from 'vue';
import ComposterItem from './ComposterItem.vue';
import { player, temp } from '@/main';
import { Weathers } from '@/data/challenges';
import { hasUpgrade } from '@/data/upgrades';

const effFer = computed(() => Composter.effectiveFertilizers)
</script>

<template>
  <p>
    You have made <span class="big-text">{{ format(temp.total_fertilizers,0) }} <template v-if="Decimal.gt(effFer, 0)">+ {{ format(effFer, 0) }}</template> <template v-if="Weathers.in(1) && hasUpgrade('RO\\2')">({{ format(Decimal.sub(temp.total_fertilizers,player.composter[3].fertilizers).max(0), 0) }})</template></span> total fertilizers, translated to a <span class="big-text">{{ formatMult(Effects.fertilizers.temp) }}</span> multiplier on Tree aging speed. (Base: <span class="big-text">{{ formatMult(Composter.fertilizerBase,3) }}</span>)
  </p>
  <p>
    Composting Speed <b>{{ formatMult(temp.compostingSpeed) }}</b>.
  </p>
  <div class="composters-table">
    <ComposterItem v-for="x in 4" :key="'c'+x" :n="x-1" />
  </div>
</template>

<style>
.composters-table {
  display: flex;
  justify-content: center;
  flex-flow: row wrap;
  align-items: start;
  gap: 5px;
}
</style>
