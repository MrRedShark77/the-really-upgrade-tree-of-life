<script setup lang="ts">
import { Composter } from '@/data/composter';
import { player, temp } from '@/main';
import { format, formatPercent, formatTime } from '@/utils/formats';
import PrimaryButton from './PrimaryButton.vue';
import { computed } from 'vue';
import { Currencies, Currency } from '@/data/currencies';
import Decimal from 'break_eternity.js';

const { n } = defineProps<{ n: number }>()

const F = Composter.fertilizers[n], P = player.composter[n], C = Currencies[F.cost[0] as Currency]

const free = computed(() => Composter.freeFertilizers[n]), cost = computed(() => Composter.calculateFeritizerCost(n, P.fertilizers)), time = computed(() => Composter.calculateTimeRequired(P.fertilizers))

function scale_text() {
  const x = P.fertilizers
  if (Decimal.gte(x, temp.scaled_fertilizers[1][0])) return "superscaled";
  if (Decimal.gte(x, temp.scaled_fertilizers[0][0])) return "scaled";
  return ""
}
</script>

<template>
  <div v-if="F.unl()" class="fertilizer-frame">
    <h3>{{ F.name }}</h3>
    <div>
      You have made <b>{{ format(P.fertilizers, 0) }} <span v-if="Decimal.gt(free, 0)">+ {{ format(free) }}</span></b> {{ scale_text() }} fertilizers using this composter.
    </div>
    <PrimaryButton class="compost-button" :enabled="!P.active && Decimal.gte(C.amount, cost)" @click="Composter.compost(n)">
      <template v-if="P.active">
        Composting ({{ formatPercent(Decimal.div(P.time, time).clamp(0,1)) }})
      </template><template v-else>
        Compost
      </template>
    </PrimaryButton>
    <div>
      <div>Cost: <b>{{ format(cost,0) }}</b> {{ C.name }}</div>
      <div>Time required: <b>{{ formatTime(time) }}</b> (ETA: <b>{{ formatTime(time.div(temp.compostingSpeed)) }}</b>)</div>
    </div>
  </div>
</template>
