<script setup lang="ts">
import { Virus } from '@/data/cell';
import { FPS, player, temp } from '@/main';
import { Effects } from '@/utils/effect';
import { format, formatGain, formatMult, formatPercent, formatPow } from '@/utils/formats';
import BigUpgradeGroup from './BigUpgradeGroup.vue';
import Decimal from 'break_eternity.js';

</script>

<template>
  <p>Virus is reset on Transform. You can't gain Virus outside Spring.</p>
  <div class="challenges-table">
    <div class="challenges-subtab">
      <p>
        You have <span class="big-text">{{ format(player.virus) }}</span> ({{ formatMult(Virus.calc(1/FPS).div(player.virus).pow(FPS)) }}/s) Virus, nerfed to <span class="big-text">{{ formatMult(Effects['virus-nerf'].temp, 4, true, 1e-4) }}</span> exponent to Leaves, Seeds, and Fruits.<br>
        Leaves: <b>{{ formatPow(Effects['virus-boost-1'].temp) }}</b> Virus | Bacteria: <b>{{ formatPow(Effects['virus-boost-2'].temp) }}</b> Virus
      </p>
      <BigUpgradeGroup :group="'virus'" :width="2" />
    </div><div class="challenges-subtab" v-if="player.first.beneficial_virus">
      <p>
        You have <span class="big-text">{{ format(player.beneficial_virus) }}</span> {{ formatGain(player.beneficial_virus, temp.currencies.BV) }} Beneficial Virus.<br>
        Mutation: (log<sub>10</sub><b>Virus</b> / {{ format(1e5) }})<sup>0.5</sup> × {{ formatPercent(Decimal.div(Effects['bupg-virus\\4'].temp, 100)) }}
      </p>
      <BigUpgradeGroup :group="'BV'" :width="2" />
    </div>
  </div>
</template>
