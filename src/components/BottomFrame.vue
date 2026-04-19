<script setup lang="ts">
import { Currency_Stats } from '@/data/currencies';
import { player } from '@/main';
import { horHandleScroll } from '@/utils/misc';
import { ref } from 'vue';

const hovered_stats = ref('')
const currency_scroll = ref(null)

const handleScroll = (event: WheelEvent) => horHandleScroll(currency_scroll.value, event);
</script>

<template>
  <div style="height: 200px;"></div>
  <div id="bottom-frame" ref="currency_scroll" @wheel.prevent="handleScroll">
    <template v-for="(CS, x) in Currency_Stats" :key="'cs-'+x">
      <div v-if="player.options.show_currencies[x] && CS.condition()" class="currency-frame" :style="{'--color': CS.color}" @mouseover="hovered_stats = x" @mouseout="hovered_stats = ''">
        <div v-html="CS.html"></div>
      </div>
    </template>
  </div>
  <div id="hovered-currency-frame" v-if="'hover' in (Currency_Stats[hovered_stats] ?? {})" v-html="Currency_Stats[hovered_stats].hover()"></div>
</template>

<style>

</style>
