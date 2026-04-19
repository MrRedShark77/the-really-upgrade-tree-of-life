<script setup lang="ts">
import { Composter } from '@/data/composter';
import { Effects } from '@/utils/effect';
import { format, formatMult } from '@/utils/formats';
import Decimal from 'break_eternity.js';
import { computed } from 'vue';
import ComposterItem from './ComposterItem.vue';
import { temp } from '@/main';

const effFer = computed(() => Composter.effectiveFertilizers)
</script>

<template>
  <p>
    You have made <span class="big-text">{{ format(Composter.totalFertilizers,0) }}<template v-if="Decimal.gt(effFer, 0)"> + {{ format(effFer, 0) }}</template></span> total fertilizers, translated to a <span class="big-text">{{ formatMult(Effects.fertilizers.temp) }}</span> multiplier on Tree aging speed. (Base: <span class="big-text">{{ formatMult(Composter.fertilizerBase,3) }}</span>)
  </p>
  <p>
    Composting Speed <b>{{ formatMult(temp.compostingSpeed) }}</b>.
  </p>
  <div class="composters-table">
    <ComposterItem v-for="x in 3" :key="'c'+x" :n="x-1" />
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
