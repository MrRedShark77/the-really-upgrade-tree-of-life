<script setup lang="ts">
import { hasUpgrade, purchaseUpgrade, Upgrades } from '@/data/upgrades';
import PrimaryButton from './PrimaryButton.vue';
import { computed } from 'vue';
import { Currencies, Currency } from '@/data/currencies';
import { format } from '@/utils/formats';
import Decimal from 'break_eternity.js';
import { replaceSpace } from '@/utils/misc';
import { player } from '@/main';

const { upg_id } = defineProps<{ upg_id: string }>()

const U = Upgrades[upg_id]

const E = U.effect, hasDisplay = E?.display !== undefined

const cost = computed(() => U.cost[1]), C = Currencies[U.cost[0] as Currency]

const visible = computed(() => {
  const o = player.options.hide_upgrades

  if (o >= 1 && player.upgrades[upg_id]) return false;

  if (o >= 2 && U.branch.length > 0 && U.branch.every(x => !player.upgrades[x])) return false;

  return player.discovered_upgrades[upg_id] || U.condition!() && (U.branch.length === 0 || U.branch.every(x => player.discovered_upgrades[x]))
})
</script>

<template>
  <PrimaryButton
  v-if="visible"
  :enabled="(U.branch.length === 0 || U.branch.some(x => hasUpgrade(x))) && Decimal.gte(C.amount, cost)" :bought="hasUpgrade(upg_id)" @click="purchaseUpgrade(upg_id)">
    <div>
      <b>[{{ replaceSpace(upg_id) }}]</b> <span v-html="U.description"></span>
    </div>
    <template v-if="hasDisplay || !hasUpgrade(upg_id)">
      <hr class="sub-line" />
      <div v-if="hasDisplay">Effect: <b>{{ E.display(E.temp) }}</b></div>
      <div v-if="!hasUpgrade(upg_id)"><span v-if="U.nospend">Require:</span><span v-else>Cost:</span> {{ format(cost, 0) }} {{ C.name }}</div>
    </template>
  </PrimaryButton>
</template>
