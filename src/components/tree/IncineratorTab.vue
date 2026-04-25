<script setup lang="ts">
import { format, formatMult } from '@/utils/formats';
import IncineratorItem from './IncineratorItem.vue';
import { Incinerator } from '@/data/incinerator';
import { Effects } from '@/utils/effect';
import PrimaryButton from '../PrimaryButton.vue';
import { Resets } from '@/data/resets';

</script>

<template>
  <div style="margin-bottom: 10px;">
    You have incinerated <span class="big-text">{{ format(Incinerator.total_level(true),0) }}</span> times, translated to <b>{{ formatMult(Effects['inc-boost'].temp) }} ➜ <span class="big-text">{{ formatMult(Incinerator.entropy_boost(Incinerator.total_level())) }}</span></b> multiplier to Entropy.
    <br>
    Incinerator's maximum input: <b>{{ format(Incinerator.limit,0) }}</b>
  </div>
  <PrimaryButton class="upgrade-RO half-big-upgrade" @click="Resets.root.reset()">Reload Reinforcement</PrimaryButton>
  <div class="table-center" style="margin: 10px 0px; gap: 10px;">
    <IncineratorItem v-for="x in 3" :key="'in-'+x" :n="x-1" />
  </div>
</template>
