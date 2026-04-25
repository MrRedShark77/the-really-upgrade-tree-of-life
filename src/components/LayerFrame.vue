<script setup lang="ts">
import { Currencies, Currency } from '@/data/currencies';
import { Layers } from '@/data/layers';
import { format, formatGain } from '@/utils/formats';
import Decimal from 'break_eternity.js';
import LayerUpgrade from './LayerUpgrade.vue';
import { UpgradeGroups } from '@/data/upgrades';
import { player, temp } from '@/main';
import PrimaryButton from './PrimaryButton.vue';
import { Resets, respecRootUpgrades } from '@/data/resets';
import { ref } from 'vue';
import { horHandleScroll } from '@/utils/misc';

const { layer_id } = defineProps<{ layer_id: string }>()

const L = Layers[layer_id], C = Currencies[L.currency as Currency], R = Resets[L.reset]

const class_L = 'upgrade-'+L.upgrade_group

const scrollContainer = ref(null);

const handleScroll = (event: WheelEvent) => horHandleScroll(scrollContainer.value, event);
</script>

<template>
  <div class="layer-frame" v-if="L.unlock()">
    <div class="layer-content">
      <div>
        <div>
          You have <b>{{ format(C.amount,0) }}</b> <span v-if="Decimal.gt(temp.currencies[L.currency], 0) && Decimal.neq(C.passive, 0)">{{ formatGain(C.amount, Decimal.mul(temp.currencies[L.currency], C.passive)) }}</span> {{ C.name }}.
        </div><div v-if="layer_id === 'entropy'">
          You have <b>{{ format(player.PE,0) }}</b> Potential Energy.
        </div><div v-if="layer_id === 'root'">
          You have <b>{{ format(player.root.total,0) }}</b> total Roots.
        </div>
      </div>
      <div>
        <PrimaryButton v-if="L.reset" class="layer-reset-button" :class="{[class_L]: true}" :enabled="R.reached" @click="R.perform()">
          <div v-html="R.description"></div>
        </PrimaryButton>
      </div>
      <PrimaryButton v-if="layer_id === 'root'" class="upgrade-RO" style="height: 30px;" @click="respecRootUpgrades()">
        Respec Root Upgrades
      </PrimaryButton>
    </div><div class="layer-upgrades" ref="scrollContainer" @wheel="handleScroll">
      <LayerUpgrade v-for="x in UpgradeGroups[L.upgrade_group]" :class="{[class_L]: true}" :upg_id="x" :layer="layer_id" :key="'U-'+x" />
    </div>
  </div>
</template>
