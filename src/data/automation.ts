import type { DecimalSource } from "break_eternity.js"
import { buyAllUpgrades, hasUpgrade } from "./upgrades"
import { Weathers } from "./weather"
import { Composter } from "./composter"
import { purchaseAllRepeatableUpgrades } from "./repeatable_upgrades"

export const Auto: Record<string, {
  condition(): boolean
  name: string
  description: string
  cost: DecimalSource

  color?: string

  tick?(): void
}> = {
  "LU": {
    condition: () => true,
    name: "Leaf Upgrades Automation",
    get description() { return `Automate first-purchased Leaf upgrades.` },
    cost: 10,

    color: '#71aa34',

    tick() { buyAllUpgrades("L", true, true) },
  },
  "LRU": {
    condition: () => hasUpgrade("L\\46"),
    name: "Repeatable Leaf Upgrades Automation",
    get description() { return `Automate repeatable Leaf upgrades.` },
    cost: 20,

    color: '#71aa34',

    tick() { purchaseAllRepeatableUpgrades("LR",true) },
  },

  "SU": {
    condition: () => true,
    name: "Seed Upgrades Automation",
    get description() { return `Automate first-purchased Seed upgrades.` },
    cost: 20,

    color: '#9A4D13',

    tick() { buyAllUpgrades("S", true, true) },
  },
  "SRU": {
    condition: () => hasUpgrade("S\\44"),
    name: "Repeatable Seed Upgrades Automation",
    get description() { return `Automate repeatable Seed upgrades.` },
    cost: 40,

    color: '#9A4D13',

    tick() { purchaseAllRepeatableUpgrades("SR",true) },
  },

  "FU": {
    condition: () => true,
    name: "Fruit Upgrades Automation",
    get description() { return `Automate first-purchased Fruit upgrades.` },
    cost: 40,

    color: '#d02013',

    tick() { buyAllUpgrades("F", true, true) },
  },
  "CF": {
    condition: () => Weathers.is_completed(0),
    name: "Composting Automation",
    get description() { return `Automatically compost Leaves, Seeds, and Fruits without taking them away.` },
    cost: 20,

    color: '#d02013',

    tick() {
      for (let i = 0; i < 3; i++) Composter.compost(i, true);
    },
  },
}

export const AutoKeys = Object.keys(Auto)
