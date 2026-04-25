<script setup lang="ts">
import { Currency_Stats } from '@/data/currencies';
import { Layers } from '@/data/layers';
import { player } from '@/main';
import { EffectNames, EffectType } from '@/utils/effect';
import { copySave, importy, importy_file, save, saveFile, wipe } from '@/utils/saveload';

</script>

<template>
  <div class="challenges-table">
    <div class="challenges-subtab">
      <h3>Main Settings</h3>
      <hr class="sub-line" />
      <div class="o-options-grid">
        <button class="o-primary-btn" style="grid-row: 1 / 3; grid-column: 1 / 3;" @click="save">Save</button>
        <button class="o-primary-btn" style="grid-row: 1 / 2; grid-column: 3 / 5;" @click="saveFile">Export as file</button>
        <button class="o-primary-btn" style="grid-row: 1 / 2; grid-column: 5 / 7;" @click="copySave">Export to clipboard</button>
        <button class="o-primary-btn" style="grid-row: 2 / 3; grid-column: 3 / 5;" @click="importy_file">Import from file</button>
        <button class="o-primary-btn" style="grid-row: 2 / 3; grid-column: 5 / 7;" @click="importy">Import from prompt</button>
        <button class="o-primary-btn" style="grid-row: 1 / 3; grid-column: 7 / 9; --button-color: red" @click="wipe">WIPE!!!</button>
        <button class="o-primary-btn no-active" style="grid-row: 3 / 4; grid-column: 1 / 5;">
          Scientific Notation starts at:<br><select class="o-options-select" v-model="player.options.notation">
            <option value=0 style="color:green">Instantly</option>
            <option value=1 style="color:green">1e33 (1Dc)</option>
            <option value=2 style="color:green">1e303 (1Ce)</option>
            <option value=3 style="color:green">1e3,003</option>
          </select>
        </button>
        <button class="o-primary-btn no-active" style="grid-row: 3 / 4; grid-column: 5 / 9;">
          Hide upgrades when:<br><select class="o-options-select" v-model="player.options.hide_upgrades">
            <option value=0 style="color:green">Never</option>
            <option value=1 style="color:green">Upgrades bought (faster)</option>
            <option value=2 style="color:green">Upgrades bought or don't meet purchased upgrades (fastest)</option>
            <option value=3 style="color:green">Advanced</option>
          </select>
        </button>
      </div><div style="margin: 10px 0;">
        <div>The Really Upgrade Tree of Life - Made by <b><a href="https://mrredshark77.github.io/" target="_blank">MrRedShark77</a></b></div>
        <div>Inspired by <b><a href="https://www.roblox.com/games/11658616007/The-Upgrade-Tree-Of-Life" target="_blank">The Upgrade Tree of Life</a></b> (Roblox)</div>
      </div>
    </div><div class="challenges-subtab">
      <h3>Currency Pins</h3>
      <hr class="sub-line" />
      <div class="table-center" style="gap: 5px;">
        <template v-for="(CS, x) in Currency_Stats" :key="'css-'+x">
          <div v-if="CS.condition()" class="o-options-currency">
            {{ CS.name }} <input type="checkbox" v-model="player.options.show_currencies[x]">
          </div>
        </template>
      </div>
    </div><div class="challenges-subtab">
      <h3>Advanced Purchased Upgrades Visibility</h3>
      <hr class="sub-line" />
      <table align="center" class="o-adv-opt-table">
        <tbody>
          <tr>
            <td></td>

            <td v-for="x in [0,1,2,3,5,6]" :key="'etn-'+x">{{ EffectNames[x as EffectType] }}</td>
          </tr>

          <template v-for="(x, y) in Layers" :key="'lnv-'+y">
            <tr v-if="x.unlock()">
              <td>{{ x.upgrade_name }}</td>

              <td v-for="z in [0,1,2,3,5,6]" :key="'etn-'+y+'-'+z">
                <input type="checkbox" v-model="player.options.advanced_upgrades[y][z]">
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.o-options-grid {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(8, 80px);
  grid-template-rows: repeat(3, 80px);
  grid-gap: 5px;
}
.o-options-grid > button {
  margin: 0px;
}

.o-options-select {
  width: calc(100% - 10px);
  pointer-events: all;
}
.o-options-select option, .o-options-select optGroup {
  text-align: left;
}

.o-options-currency {
  font-size: 18px;
  border: solid 1px black;
  border-radius: 10px;
  padding: 10px;
  background-color: white;

  display: flex;
  align-items: center;
  gap: 10px;

  & > input[type="checkbox"] {
    width: 25px;
    height: 25px;
  }
}

.o-adv-opt-table {
  background: #0002;
  border-collapse: collapse;

  &, & tr, & td {
    border: solid 1px black;
  }

  & td {
    padding: 5px;
  }

  & td:nth-child(n+2) {
    width: 80px;
  }

  & input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }
}
</style>
