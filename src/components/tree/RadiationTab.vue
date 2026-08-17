<script setup lang="ts">
import { Radiation } from '@/data/great-split';
import { player, temp } from '@/main';
import { sumBase } from '@/utils/decimal';
import { Effects } from '@/utils/effect';
import { format, formatGain, formatMult, formatPlus, formatTime } from '@/utils/formats';
import Decimal from 'break_eternity.js';
import { computed } from 'vue';

const exp = computed(() => Radiation.exp)
</script>

<template>
  <p>
    Your Cleaning Power is <span class="big-text">{{ format(player.radiation.cleaning_power,0) }}</span> {{ formatGain(player.radiation.cleaning_power,temp.radiation.cleaning_power) }}, based on <b>Roots</b>.<br>
    Decaying Speed: <b>{{ formatMult(temp.radiation.decaying_speed) }}</b>
  </p>
  <div id="rad_list">
    <div>
      <div class="isotope-frame">
        <b style="font-size: 16px;">Radiation</b>
        <div><b>{{ format(player.radiation.cleaned,0) }} / {{ format(Radiation.cap, 0) }}</b> cleaned</div>
        <div>➜ <h4>{{ formatMult(Effects['radiation-boost'].temp) }}</h4> EXP</div>
        <div>(<b>{{ formatPlus(temp.radiation.cleaning_exp) }}</b> EXP/clean)</div>
      </div>

      <template v-for="(x,i) in Radiation.isotopes" :key="'is'+i">
        <div class="isotope-frame" v-if="i === 0 || Decimal.gt(player.radiation.isotopes[i-1][1],0)">
          <b style="font-size: 16px;">{{ x.name }}</b>
          <div><b>{{ format(player.radiation.isotopes[i][1],0) }} / {{ format(Decimal.mul(player.radiation.isotopes[i+1]?.[1] ?? 0, 5).add(10),0) }}</b> cleaned</div>
          <div>
            <div>➜ <h4>{{ formatMult(Radiation.isotope_boosts[0](player.radiation.isotopes[i][1],i)) }}</h4> EXP</div>
            <div v-if="i===0"><h4>{{ formatMult(Radiation.isotope_boosts[1](player.radiation.isotopes[i][1],i)) }}</h4> Radiation Cap</div>
            <div v-else><h4>+{{ format(Radiation.isotope_boosts[1](player.radiation.isotopes[i][1],i),0) }}</h4> {{ Radiation.isotopes[i-1].name }} Cap</div>
          </div>
          <div>{{ formatTime(Decimal.sub(player.radiation.isotopes[i][0], sumBase(player.radiation.isotopes[i][1], x.half_life[1]).mul(x.half_life[0])).max(0)) }} / {{ formatTime(
            Decimal.pow(x.half_life[1], player.radiation.isotopes[i][1]).mul(x.half_life[0])) }}</div>
        </div>
      </template>
    </div>

    <div>
      <template v-for="(x,i) in Radiation.tiers" :key="'ct'+i">
        <div class="tier-frame" v-if="i === 0 || Decimal.gt(player.radiation.tiers[i-1],0)">
          <div>{{ x.name }} <b>{{ format(player.radiation.tiers[i],0) }}</b></div>
          <div>
            <b>{{ format(Decimal.sub(i === 0 ? exp : player.radiation.tiers[i-1], Decimal.gte(player.radiation.tiers[i], 1) ? x.requirement[0](Decimal.sub(player.radiation.tiers[i], 1)) : 0).max(0),0) }} / {{ format(x.requirement[2](player.radiation.tiers[i]),0) }}</b> {{ i === 0 ? "EXP" : Radiation.tiers[i-1].name }}
          </div>
          <div>
            <template v-for="(y,j) in x.boost" :key="'ctb'+i+'-'+j">
              <div><template v-if="j === 0">➜ </template><h4>{{ y[1](Effects['c-tiers-'+i+'-'+j].temp) }}</h4> {{ y[2] }}</div>
            </template>
          </div>
          <div v-if="i === 0">
            <b>{{ format(exp, 0) }}</b> total Cleaning EXP
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
#rad_list {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 5px;

  & > div {
    display: grid;
    grid-auto-rows: 150px;
    gap: 5px;

    &:nth-child(1) {
      grid-template-columns: repeat(2, 1fr);
    }

    &:nth-child(2) {
      grid-template-columns: 1fr;
    }
  }
}

.isotope-frame {
  padding: 5px;

  border: solid 2px #0f0;
  box-shadow: 0px 0px 10px #0f0;
  background-color: #001b00;

  color: white;

  display: grid;
  grid-template-rows: auto 1fr 2fr 1fr;
  align-items: center;

  font-size: 12px;

  & > b {
    font-size: 14px;
  }
}

.tier-frame {
  padding: 5px;

  border: solid 2px #0f8;
  box-shadow: 0px 0px 10px #0f8;
  background-color: #001b1b;

  color: white;

  display: grid;
  grid-template-rows: auto 1fr 2fr 1fr;
  align-items: center;

  font-size: 12px;

  & > div:first-child {
    font-size: 14px;
  }
}
</style>
