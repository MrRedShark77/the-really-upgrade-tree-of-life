import type { DecimalSource } from "break_eternity.js"
import { buyAllUpgrades, hasUpgrade } from "./upgrades"
import { Composter } from "./composter"
import { purchaseAllRepeatableUpgrades } from "./repeatable_upgrades"
import { player } from "@/main"
import { purchaseAllBigUpgrades } from "./big_upgrades"

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
    cost: 30,

    color: '#d02013',

    tick() { buyAllUpgrades("F", true, true) },
  },
  "FRU": {
    condition: () => hasUpgrade("F\\45"),
    name: "Repeatable Fruit Upgrades Automation",
    get description() { return `Automate repeatable Fruit upgrades.` },
    cost: 60,

    color: '#d02013',

    tick() { purchaseAllRepeatableUpgrades("FR",true) },
  },

  "CF": {
    condition: () => player.first.weather[0],
    name: "Composting Automation",
    get description() {
      return hasUpgrade("RO\\M2")
      ? `Automatically compost Leaves, Seeds, Fruits, and Entropy without taking them away.`
      : `Automatically compost Leaves, Seeds, and Fruits without taking them away.`
    },
    cost: 20,

    color: '#d02013',

    tick() {
      const p = hasUpgrade("RO\\M2") ? 4 : 3
      for (let i = 0; i < p; i++) Composter.compost(i, true);
    },
  },

  "EU": {
    condition: () => hasUpgrade("RO\\M1"),
    name: "Entropy Upgrades Automation",
    get description() { return `Automate first-purchased Entropy upgrades.` },
    cost: 40,

    color: '#b1c4eb',

    tick() { buyAllUpgrades("E", true, true) },
  },
  "ERU": {
    condition: () => hasUpgrade("E\\53"),
    name: "Repeatable Entropy Upgrades Automation",
    get description() { return `Automate repeatable Entropy upgrades.` },
    cost: 80,

    color: '#b1c4eb',

    tick() { purchaseAllRepeatableUpgrades("ER",true) },
  },

  "CU": {
    condition: () => hasUpgrade("RO\\M3"),
    name: "Cell Upgrades Automation",
    get description() { return `Automate Cell upgrades.` },
    cost: 40,

    color: '#b1c4eb',

    tick() { purchaseAllBigUpgrades("cell") },
  },

  "BU": {
    condition: () => hasUpgrade("RO\\M6"),
    name: "Bacteria Upgrades Automation",
    get description() { return `Automate Bacteria upgrades.` },
    cost: 40,

    color: '#9ae8a5',

    tick() { purchaseAllBigUpgrades("bacteria") },
  },

  "FAU0": {
    condition: () => hasUpgrade("FA\\3"),
    name: "Fallen Leaf Upgrades Automation",
    get description() { return `Automate Fallen Leaf upgrades.` },
    cost: 200,

    color: 'linear-gradient(135deg, #fe0, #f40)',

    tick() { purchaseAllBigUpgrades("fallen-0") },
  },
  "FAU1": {
    condition: () => hasUpgrade("FA\\4"),
    name: "Bronze Leaf Upgrades Automation",
    get description() { return `Automate Bronze Leaf upgrades.` },
    cost: 200,

    color: 'linear-gradient(135deg, #CD7F32, #f3455a)',

    tick() { purchaseAllBigUpgrades("fallen-1") },
  },
  "FAU2": {
    condition: () => hasUpgrade("FA\\5"),
    name: "Silver Leaf Upgrades Automation",
    get description() { return `Automate Silver Leaf upgrades.` },
    cost: 200,

    color: 'linear-gradient(135deg, #c4c4c4, #888)',

    tick() { purchaseAllBigUpgrades("fallen-2") },
  },
  "FAU3": {
    condition: () => hasUpgrade("FA\\6"),
    name: "Golden Leaf Upgrades Automation",
    get description() { return `Automate Golden Leaf upgrades.` },
    cost: 200,

    color: 'linear-gradient(135deg, gold, #b80)',

    tick() { purchaseAllBigUpgrades("fallen-3") },
  },
  "FAU4": {
    condition: () => hasUpgrade("FA\\7"),
    name: "Platinum Leaf Upgrades Automation",
    get description() { return `Automate Platinum Leaf upgrades.` },
    cost: 200,

    color: 'linear-gradient(135deg, #eef, #c4c4ff)',

    tick() { purchaseAllBigUpgrades("fallen-4") },
  },
}

export const AutoKeys = Object.keys(Auto)
