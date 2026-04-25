import './assets/main.css'

import { createApp, reactive } from 'vue'
import App from './App.vue'
import { checkPlayer, deepAssign, getSaveData, loadSave, save } from './utils/saveload'
import { getStateData } from './utils/state'
import { getTempData, loop, updateTemp } from './update'
import { setupUpgrades } from './data/upgrades'
import { setupCurrencies } from './data/currencies'
import { Composter } from './data/composter'
import { Cell } from './data/cell'
import { Bacteria } from './data/bacteria'
import { setupBigUpgrades } from './data/big_upgrades'
import { Seasons, Weathers } from './data/challenges'
import { setupRepeatableUpgrades } from './data/repeatable_upgrades'
import { Effect } from './utils/effect'
import { Incinerator } from './data/incinerator'
import { Furnace } from './data/furnace'

export const FPS = 30

export const player = reactive(getSaveData())
export const state = reactive(getStateData())
export const temp = reactive(getTempData())

export function load() {
  setupUpgrades()
  setupBigUpgrades()
  setupRepeatableUpgrades()
  setupCurrencies()
  Weathers.setup()
  Seasons.setup()
  Incinerator.setup()
  Furnace.setup()

  Composter.setup()
  Cell.setup()
  Bacteria.setup()

  deepAssign(player, loadSave());
  checkPlayer();

  for (let i = 0; i < 10; i++) updateTemp();

  loop()
  setInterval(() => {
    loop();
  }, 1000 / FPS)

  setInterval(save, 60000);

  console.log(Effect.calculateEffectHTML("leaves"))
  console.log(Effect.calculateEffectHTML("seeds", true))
}

try {
  createApp(App).mount('#app')
} catch (error) {
  console.error(error)
}
