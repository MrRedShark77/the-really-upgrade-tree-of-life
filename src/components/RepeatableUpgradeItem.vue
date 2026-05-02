<script setup lang="ts">
import PrimaryButton from './PrimaryButton.vue';
import { Currencies } from '@/data/currencies';
import { format } from '@/utils/formats';
import { player } from '@/main';
import { computed } from 'vue';
import Decimal from 'break_eternity.js';
import { purchaseRepeatableUpgrade, RepeatableUpgrades } from '@/data/repeatable_upgrades';
import { replaceSpace } from '@/utils/misc';

const { n } = defineProps<{ n: string }>()

const U = RepeatableUpgrades[n], C = Currencies[U.cost[0]], E = U.preEffect

const level = computed(() => player.repeatable_upgrades[n][0])
const max = computed(() => Decimal.round(U.max))
const cost = computed(() => U.cost[1](level.value))
</script>

<template>
  <PrimaryButton v-if="U.condition()" class="repeatable-upgrade" :enabled="Decimal.lt(level, max) && Decimal.gte(C.amount, cost)" @click="purchaseRepeatableUpgrade(n)">
    Level <b>{{ format(level, 0) }} / {{ format(max, 0) }}</b>
    <hr class="sub-line" />
    <b>[{{ replaceSpace(n) }}]</b> <span v-html="U.description"></span>
    <hr class="sub-line" />
    <div>Effect: <b>{{ E.display(E.temp) }}</b></div>
    <div>Cost: {{ format(cost,0) }} {{ C.name }}</div>
  </PrimaryButton>
</template>
