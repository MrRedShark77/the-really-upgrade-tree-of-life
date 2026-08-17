<script setup lang="ts">
import { player, temp } from '@/main';
import { format, formatMult } from '@/utils/formats';
import PrimaryButton from '../PrimaryButton.vue';
import BigUpgradeGroup from '../BigUpgradeGroup.vue';
import Decimal from 'break_eternity.js';
import { Flower } from '@/data/great-split';
import { Effects } from '@/utils/effect';
import { Resets } from '@/data/resets';

function clickFlower() {
  player.flower.amount = Decimal.add(player.flower.amount, temp.currencies.flowers)
  player.flower.exp = Decimal.add(player.flower.exp, temp.floral_exp_mult)
}
</script>

<template>
  <p>
    You have <span class="big-text">{{ format(player.flower.amount, 0) }}</span> Flowers and <span class="big-text">{{ format(player.flower.exp, 0) }}</span> Floral EXP.<br>
    Floral Level <span class="big-text">{{ format(player.flower.level, 0) }}</span> (next at <b>{{ format(Flower.level.require,0) }}</b> EXP) ➜ <span class="big-text">{{ formatMult(Effects['floral-level-boost'].temp) }}</span> Flowers.
  </p>
  <div class="table-center">
    <PrimaryButton class="half-big-upgrade upgrade-flower" @click="clickFlower">
      <b>+{{ format(temp.currencies.flowers) }}</b> Flowers<br><b>+{{ format(temp.floral_exp_mult) }}</b> Floral EXP
    </PrimaryButton>
    <PrimaryButton v-if="player.first.pollen || Decimal.gte(player.flower.level, 5)" class="half-big-upgrade upgrade-pollen" :enabled="Resets.pollen.reached" @click="Resets.pollen.perform()">
      <div v-html="Resets.pollen.description"></div>
    </PrimaryButton>
  </div>
  <BigUpgradeGroup :group="'flower'" />
  <template v-if="player.first.pollen || Decimal.gte(player.flower.level, 5)">
    <p>You have <span class="big-text">{{ format(player.flower.pollen, 0) }}</span> Pollen.</p>
    <BigUpgradeGroup :group="'pollen'" />
  </template>
</template>
