<script setup lang="ts">
import { Furnace } from '@/data/furnace';
import { player, temp } from '@/main';
import { Effects } from '@/utils/effect';
import { format, formatGain, formatMult, formatPow } from '@/utils/formats';

</script>

<template>
  <p>
    You have <span class="big-text">{{ format(player.furnace.ash) }}</span> {{ formatGain(player.furnace.ash, temp.currencies.ash) }} Ash, translated to <span class="big-text">{{ formatPow(Effects['ash-boost'].temp, 3) }}</span> static multiplier to Tree aging speed.
  </p>
  <div class="furnace-grid">
    <div class="furnace-frame">
      <div>
        <b>{{ format(player.furnace.charcoal,0) }}</b> Charcoal<br>(Next at <b>{{ format(Furnace.charcoal.require,0) }}</b> total Roots)
      </div>
      <div>➜ <h3>{{ formatMult(Effects['charcoal-boost'].temp) }}</h3> Heat & Ash</div>
    </div><div class="furnace-frame">
      <div>Incinerator Level: <b style="display: inline-block;">{{ format(player.incinerator[0][1],0) }}:{{ format(player.incinerator[1][1],0) }}:{{ format(player.incinerator[2][1],0) }}</b></div>
      <div>➜ <h3>{{ formatMult(Effects['heat'].temp, 2, false) }}</h3> Heat</div>
    </div><div class="furnace-frame">
      <div><b>{{ format(player.furnace.coal,0) }}</b> Coal<br>(Next at <b>{{ format(Furnace.coal.require,0) }}</b> Ash)</div>
      <div>➜ <span style="display: inline-block;"><h3>{{ formatMult(Effects['coal-boost-1'].temp) }}</h3> Ash,</span> <span style="display: inline-block;"><h3>{{ formatMult(Effects['coal-boost-2'].temp) }}</h3> Roots</span></div>
    </div><div class="furnace-frame">
      <div><b>{{ format(player.furnace.heat) }}</b> Heat<br>{{ formatGain(player.furnace.heat, temp.currencies.heat) }}</div>
      <div>➜ <h3>{{ formatMult(Effects['ash'].temp, 2, false) }}</h3> Ash</div>
    </div>
  </div>
</template>

<style>
.furnace-grid {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(2, 300px);
  grid-auto-rows: 120px;
  gap: 5px;
}

.furnace-frame {
  padding: 5px;

  border: solid 2px #888;
  box-shadow: 0px 0px 10px #888;
  background-color: #1b1b1b;

  color: white;

  display: grid;
  grid-template-rows: 1fr 2fr;
  align-items: center;
}
</style>
