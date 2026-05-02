<script setup lang="ts">
import { formatMult } from '@/utils/formats';
import WeatherItem from './WeatherItem.vue';
import { hasUpgrade } from '@/data/upgrades';
import SeasonItem from './SeasonItem.vue';

</script>

<template>
  <div class="challenges-table">
    <div class="challenges-subtab">
      <h3>The Weather</h3>
      <p>Weather is challenge that forces a transformation and gives debuffs upon entering. To beat a weather, you need to pass the requirement below.</p>
      <hr class="sub-line" />
      <p>While in challenge, the Cell's effects are reduced by <b>^0.5</b>. Each completion gives <b>{{ formatMult(2,0) }}</b> Entropy.</p>
      <div class="challenge-buttons">
        <WeatherItem v-for="x in 4" :key="'w-'+x" :n="x-1" />
      </div>
    </div><div class="challenges-subtab" v-if="hasUpgrade('L\\-10')">
      <h3>The Season</h3>
      <p>Season is challenge that forces a reinforcement and gives debuffs upon entering. To beat a season, you need to pass the requirement below.</p>
      <hr class="sub-line" />
      <p>While in challenge, the Cell's effects are reduced by <b>^0.5</b>. Each completion gives <b>{{ formatMult(2,0) }}</b> Roots.</p>
      <div class="challenge-buttons">
        <SeasonItem v-for="x in 3" :key="'s-'+x" :n="x-1" />
      </div>
    </div>
  </div>
</template>

<style>
.challenge-buttons {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(2, 300px);
  grid-auto-rows: 240px;
  gap: 5px;
}
</style>
