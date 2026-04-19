<script setup lang="ts">
import { Cell } from '@/data/cell';
import { FPS, player } from '@/main';
import { Effects } from '@/utils/effect';
import { format, formatMult, formatPow } from '@/utils/formats';
import PrimaryButton from './PrimaryButton.vue';
import { Bacteria } from '@/data/bacteria';
import Decimal from 'break_eternity.js';
import BigUpgradeGroup from './BigUpgradeGroup.vue';

</script>

<template>
  <p>
    You have <span class="big-text">{{ format(player.cell.amount,0) }} / {{ format(Cell.cap,0) }}</span> ({{ formatMult(Cell.calc(1/FPS).div(player.cell.amount).pow(FPS),3) }}/s) Cells, translated to:
  </p>
  <p>
    <span class="big-text">{{ formatMult(Effects['cell-L'].temp) }}</span> multiplier to Leaves,
    <span class="big-text">{{ formatMult(Effects['cell-S'].temp) }}</span> multiplier to Seeds,
    <span class="big-text">{{ formatMult(Effects['cell-F'].temp) }}</span> multiplier to Fruits.
  </p>
  <BigUpgradeGroup :group="'cell'" />
  <!--
  <div class="cell-upgrades-table">
    <CellUpgradeItem v-for="x in 3" :key="'cell'+x" :n="x-1" />
  </div>
  -->
  <p>
    You have <span class="big-text">{{ format(player.bacteria.types, 0) }}</span> Bacteria Types.
  </p>
  <PrimaryButton class="no-grid-big-upgrade upgrade-E" :enabled="Decimal.gte(player.cell.amount, Cell.cap)" @click="Cell.extend()">
    Extend Limit, but unlock <b>Bacteria Type</b>.
    <hr class="sub-line" />
    <b>{{ formatPow(Bacteria.CellBoost) }}</b> to Cell Limit, <b>{{ formatPow(Bacteria.BacteriaBoost) }}</b> to Bacteria
  </PrimaryButton>
</template>
