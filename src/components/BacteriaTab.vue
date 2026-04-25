<script setup lang="ts">
import { player, temp } from '@/main';
import { format, formatMult, formatPlus } from '@/utils/formats';
import PrimaryButton from './PrimaryButton.vue';
import { Resets } from '@/data/resets';
import { Bacteria } from '@/data/bacteria';
import BigUpgradeGroup from './BigUpgradeGroup.vue';
import Decimal from 'break_eternity.js';

</script>

<template>
  <p>
    You have <span class="big-text">{{ format(player.bacteria.amount, 0) }} / {{ format(temp.bacteria_limit, 0) }}</span> ({{ formatMult(Decimal.pow(2, Bacteria.speed), 3) }}/s) Bacteria, translated to:
  </p>
  <p>
    <span class="big-text">{{ formatPlus(Bacteria.effect(0),3) }}</span> fertilizer's base,
    <span class="big-text">{{ formatPlus(Bacteria.effect(1)) }}</span> scaled Fertilizer starting,
    <span class="big-text">{{ formatMult(Bacteria.effect(2)) }}</span> Composting speed.
  </p>
  <PrimaryButton class="bacteria-button" id="bacteria-reset" :enabled="Resets.bacteria.reached" @click="Resets.bacteria.perform()">
    <div v-html="Resets.bacteria.description"></div>
  </PrimaryButton>
  <BigUpgradeGroup :group="'bacteria'" />
</template>

<style scoped>
#bacteria-reset {
  width: 400px;
  height: 50px;
}
</style>
