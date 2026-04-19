<script setup lang="ts">
import PrimaryButton from './PrimaryButton.vue';
import { Currencies, Currency } from '@/data/currencies';
import { format } from '@/utils/formats';
import { player } from '@/main';
import { computed } from 'vue';
import Decimal from 'break_eternity.js';
import { BigUpgrades, purchaseBigUpgrade } from '@/data/big_upgrades';

const { n } = defineProps<{ n: string }>()

const U = BigUpgrades[n], C = Currencies[U.cost[0] as Currency], E = U.preEffect

const bonus = computed(() => U.bonus ?? 0)
const cost = computed(() => U.cost[1](player.big_upgrades[n]))
</script>

<template>
  <PrimaryButton v-if="U.unl()" class="big-upgrade" :enabled="Decimal.gte(C.amount, cost)" @click="purchaseBigUpgrade(n)">
    Level <b>{{ format(player.big_upgrades[n],0) }}<span v-if="Decimal.gt(bonus,0)"> + {{ format(bonus) }}</span></b>
    <hr class="sub-line" />
    <div v-html="U.description"></div>
    <div><b>{{ E.display(E.temp) }}</b> ➜ <b>{{ E.display(U.effect[1](Decimal.add(player.big_upgrades[n],bonus).add(1))) }}</b></div>
    <hr class="sub-line" />
    <div>{{ U.nospend ? "Require" : "Cost" }}: {{ format(cost,0) }} {{ C.name }}</div>
  </PrimaryButton>
</template>
