<script setup lang="ts">
import { FallenLeaves } from '@/data/fallen';
import { player, temp } from '@/main';
import { format, formatGain, formatMult } from '@/utils/formats';
import BigUpgradeGroup from '../BigUpgradeGroup.vue';
import PrimaryButton from '../PrimaryButton.vue';
import { Resets } from '@/data/resets';
import { Currencies } from '@/data/currencies';
import Decimal from 'break_eternity.js';

function ratio(i: number) {
  const r = FallenLeaves.calculate_ratio(i)

  return r.gte(1) ? "1:" + format(r) : format(r.pow(-1)) + ":1"
}

const SL = Currencies.sacred
</script>

<template>
  <p>
    Leaves falling speed: <span class="big-text">{{ formatMult(temp.fallen_speed) }}</span> | Basket cap: <span class="big-text">{{ format(temp.basket_cap, 0) }}</span>
    <template v-if="!player.first.fallen[FallenLeaves.resources.length-1]">
      <br>(Next Fallen Leaves type at <b>{{ format(FallenLeaves.nextType, 0) }}</b>)
    </template>
  </p>
  <div class="fallen-table">
    <template v-for="(x, i) in FallenLeaves.resources" :key="'fl-'+i">
      <div v-if="player.first.fallen[i]" class="challenges-subtab">
        <h3>{{ x.name }}</h3>
        <hr class="sub-line">
        <p>You have <span class="big-text">{{ format(player.fallen[i], 0) }}</span> {{ formatGain(player.fallen[i], temp.currencies['fallen-'+i]) }} {{ x.name }}. <template v-if="i>0">(ratio <b>{{ ratio(i) }}</b>)</template></p>
        <BigUpgradeGroup :group="'fallen-'+i" :width="2" />
      </div>
    </template>
    <div v-if="player.first.fallen[3]" class="challenges-subtab">
      <h3>Sacred Leaves</h3>
      <hr class="sub-line">
      <p>You have <span class="big-text">{{ format(player.sacred, 0) }}</span> <template v-if="Decimal.gt(SL.passive, 0)">{{ formatGain(player.sacred, Decimal.mul(SL.passive, temp.currencies.sacred)) }}</template> Sacred Leaves.</p>
      <PrimaryButton class="upgrade-sacred" id="sacred-reset" :enabled="Resets.sacred.reached" @click="Resets.sacred.perform()">
        <div v-html="Resets.sacred.description"></div>
      </PrimaryButton>
      <BigUpgradeGroup :group="'sacred'" :width="2" />
    </div>
  </div>
</template>

<style scoped>
#sacred-reset {
  width: 400px;
  height: 50px;
}
</style>
