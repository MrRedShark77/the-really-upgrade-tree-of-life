import { Effect, EffectType } from "@/utils/effect"
import type { DecimalSource } from "break_eternity.js"
import { hasUpgrade } from "./upgrades"
import Decimal from "break_eternity.js"
import { simpleCost } from "@/utils/decimal"
import { formatMult, formatPlus, formatPow } from "@/utils/formats"
import { splitIntoGroups } from "@/utils/misc"
import { player } from "@/main"
import { Currencies } from "./currencies"

const CS1 = () => hasUpgrade("RO\\11") ? .1 : 1;

export const RepeatableUpgrades: Record<string, {
  priority?: number

  condition?(): boolean
  max: DecimalSource

  description: string

  cost: [string, (x: DecimalSource) => DecimalSource, (x: DecimalSource) => DecimalSource],
  effect: {
    base: DecimalSource
    calc(x: DecimalSource): DecimalSource
  }
  preEffect: Effect
}> = {
  "LR\\1": {
    condition: () => hasUpgrade("L\\46"),

    get max() { return Decimal.add(10, Effect.effect("upg-E\\30")).add(Effect.effect("upg-E\\35")).add(Effect.effect("upg-RO\\2")).add(Effect.effect("upg-RO\\10")).add(Effect.effect("rupg-SR\\3")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Seeds and Fruits.` },

    cost: [
      'leaves',
      x => simpleCost(x, "ES", hasUpgrade("RO\\2") ? 1 : 'e500', ...(hasUpgrade("E\\34") ? [1e4 * CS1(), 10**.5] : [1e5 * CS1(), 10**.625])).mul(Effect.effect("upg-E\\43")).mul(Effect.effect("rupg-SR\\2")),
      x => simpleCost(Decimal.div(x, Effect.effect("upg-E\\43")).div(Effect.effect("rupg-SR\\2")), "ESI", hasUpgrade("RO\\2") ? 1 : 'e500', ...(hasUpgrade("E\\34") ? [1e4 * CS1(), 10**.5] : [1e5 * CS1(), 10**.625])).floor().add(1)],
    effect: {
      get base() { return Decimal.add(2, Effect.effect("upg-E\\32")).pow(Effect.effect("upg-E\\63")) },
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: ['seeds','fruits'],
      display: x => formatMult(x),
    }),
  },
  "LR\\2": {
    condition: () => Decimal.gte(player.repeatable_upgrades['LR\\1'][1], 100),

    get max() { return Decimal.add(15, Effect.effect("upg-S\\47")).add(Effect.effect("upg-E\\59")).add(Effect.effect("rupg-SR\\3")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Entropy.` },

    cost: [
      'leaves',
      x => simpleCost(x, "ES", 'e3500', 1e50, 10**6.25).mul(Effect.effect("rupg-SR\\2")),
      x => simpleCost(Decimal.div(x, Effect.effect("rupg-SR\\2")), "ESI", 'e3500', 1e50, 10**6.25).floor().add(1)
    ],
    effect: {
      get base() { return Decimal.pow(2, Effect.effect("upg-E\\66")) },
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: 'entropy',
      display: x => formatMult(x),
    }),
  },
  "LR\\3": {
    condition: () => Decimal.gte(player.repeatable_upgrades['LR\\2'][1], 100),

    get max() { return Decimal.add(25, Effect.effect("rupg-SR\\3")) },

    get description() { return `<b>+${formatPow(this.effect.base)}</b> to Potential Energy.` },

    cost: [
      'leaves',
      x => simpleCost(x, "ES", 'e60000', 'e1000', 1e125),
      x => simpleCost(x, "ESI", 'e60000', 'e1000', 1e125).floor().add(1)
    ],
    effect: {
      base: .01,
      calc(x) { return Decimal.mul(this.base, x).add(1) },
    },
    preEffect: new Effect({
      type: EffectType.Exponent,
      static: false,
      group: 'PE',
      display: x => formatPow(x),
    }),
  },

  "SR\\1": {
    condition: () => hasUpgrade("S\\44"),

    get max() { return Decimal.add(10, Effect.effect("upg-E\\39")).add(Effect.effect("rupg-SR\\3")).mul(Effect.effect("upg-RO\\4")).mul(Effect.effect("upg-E\\62")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Leaves and Tree aging speed.` },

    cost: [
      'seeds',
      x => simpleCost(x, "ES", hasUpgrade("RO\\4") ? 1 : 'e650', 1e6 * CS1(), 10**.75).mul(Effect.effect("upg-E\\45")).mul(Effect.effect("rupg-SR\\2")).mul(Effect.effect("rupg-SR\\2")),
      x => simpleCost(Decimal.div(x, Effect.effect("upg-E\\45")).div(Effect.effect("rupg-SR\\2")), "ESI", hasUpgrade("RO\\4") ? 1 : 'e650', 1e6 * CS1(), 10**.75).floor().add(1)
    ],
    effect: {
      get base() { return Decimal.add(8, Effect.effect("upg-E\\41")).pow(Effect.effect("upg-E\\63")) },
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: ['leaves','age'],
      display: x => formatMult(x),
    }),
  },
  "SR\\2": {
    condition: () => Decimal.gte(player.repeatable_upgrades['SR\\1'][1], 100),

    get max() { return Decimal.add(25, Effect.effect("upg-E\\59")).add(Effect.effect("rupg-SR\\3")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to <b>LR1-2</b>, <b>SR2</b>, and <b>FR1-2</b>' cost.` },

    cost: [
      'seeds',
      x => simpleCost(x, "ES", 'e6000', 1e75, 10**9.375).mul(Effect.effect("upg-E\\61")),
      x => simpleCost(Decimal.div(x, Effect.effect("upg-E\\61")), "ESI", 'e6000', 1e75, 10**9.375).floor().add(1)
    ],
    effect: {
      base: 1e200,
      calc(x) { return Decimal.neg(x).pow_base(this.base) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: false,
      display: x => formatMult(x),
    }),
  },
  "SR\\3": {
    condition: () => Decimal.gte(player.repeatable_upgrades['SR\\2'][1], 100),

    get max() { return 50 },

    get description() { return `<b>${formatPlus(this.effect.base)}</b> to <b>LSFER</b> repeatable upgrades' level cap, except itself.` },

    cost: [
      'seeds',
      x => simpleCost(x, "ES", 'e90000', 'e1000', 1e100),
      x => simpleCost(x, "ESI", 'e90000', 'e1000', 1e100).floor().add(1)
    ],
    effect: {
      base: 1,
      calc(x) { return Decimal.mul(x, 1) },
    },
    preEffect: new Effect({
      type: EffectType.Addition,
      static: false,
      display: x => formatPlus(x),
    }),
  },

  "FR\\1": {
    condition: () => hasUpgrade("F\\45"),

    get max() { return Decimal.add(10, Effect.effect("upg-E\\44")).add(Effect.effect("upg-E\\47")).add(Effect.effect("upg-E\\56")).add(Effect.effect("rupg-SR\\3")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Leaves, Seeds, and Fruits.` },

    cost: [
      'fruits',
      x => simpleCost(x, "ES", 'e750', 1e10 * CS1(), 10).mul(Effect.effect("upg-E\\46")).mul(Effect.effect("rupg-SR\\2")),
      x => simpleCost(Decimal.div(x, Effect.effect("upg-E\\46")).div(Effect.effect("rupg-SR\\2")), "ESI", 'e750', 1e10 * CS1(), 10).floor().add(1)
    ],
    effect: {
      get base() { return Decimal.pow(10, Effect.effect("upg-E\\51")).pow(Effect.effect("upg-E\\63")) },
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: ['leaves','seeds','fruits'],
      display: x => formatMult(x),
    }),
  },
  "FR\\2": {
    condition: () => Decimal.gte(player.repeatable_upgrades['FR\\1'][1], 100),

    get max() { return Decimal.add(25, Effect.effect("rupg-SR\\3")).mul(Effect.effect("upg-E\\64")) },

    get description() { return `<b>${formatMult(Decimal.pow(this.effect.base, -1))}</b> to the first 3 Fertilizers' cost.` },

    cost: [
      'fruits',
      x => simpleCost(x, "ES", 'e10000', 1e100, 1e10).mul(Effect.effect("rupg-SR\\2")),
      x => simpleCost(Decimal.div(x, Effect.effect("rupg-SR\\2")), "ESI", 'e10000', 1e100, 1e10).floor().add(1)
    ],
    effect: {
      get base() { return Decimal.pow(1e200, Effect.effect("upg-L\\-19")) },
      calc(x) { return Decimal.neg(x).pow_base(this.base) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      display: x => formatMult(x),
    }),
  },

  "ER\\1": {
    condition: () => hasUpgrade("E\\53"),

    get max() { return Decimal.add(25, Effect.effect("upg-E\\60")).add(Effect.effect("rupg-SR\\3")).mul(Effect.effect("upg-E\\62")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Cell replication speed.` },

    cost: ['entropy', x => simpleCost(x, "ES", 'e150', 10, 10**.125), x => simpleCost(x, "ESI", 'e150', 10, 10**.125).floor().add(1)],
    effect: {
      get base() { return Decimal.mul(1e3, Effect.effect("upg-E\\58")) },
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: ['cell-speed'],
      display: x => formatMult(x),
    }),
  },
  "ER\\2": {
    condition: () => Decimal.gte(player.repeatable_upgrades['ER\\1'][1], 100),

    get max() { return Decimal.add(25, Effect.effect("rupg-SR\\3")) },

    get description() { return `<b>+${formatPow(this.effect.base)}</b> to Bacteria's limit.` },

    cost: ['entropy', x => simpleCost(x, "ES", 'e1500', 1e10, 10), x => simpleCost(x, "ESI", 'e1500', 1e10, 10).floor().add(1)],
    effect: {
      base: .05,
      calc(x) { return Decimal.mul(this.base, x).add(1) },
    },
    preEffect: new Effect({
      type: EffectType.Exponent,
      static: false,
      group: ['bacteria-limit'],
      display: x => formatPow(x),
    }),
  },

  "ROR\\1": {
    condition: () => hasUpgrade("RO\\53"),

    get max() { return Decimal.add(100, Effect.effect("rupg-SR\\3")) },

    get description() { return `<b>${formatMult(this.effect.base,3)}</b> to Fallen Leaves.` },

    cost: [
      'roots',
      x => simpleCost(x, "ES", 1, 1.5, 1.05).pow(Effect.effect('upg-E\\65')).mul(1e23),
      x => simpleCost(Decimal.div(x, 1e23).root(Effect.effect('upg-E\\65')), "ESI", 1, 1.5, 1.05).floor().add(1)
    ],
    effect: {
      base: 1.075,
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: 'fallen-0',
      display: x => formatMult(x),
    }),
  },
}

export const RepeatableUpgradeKeys = Object.keys(RepeatableUpgrades)

export const RepeatableUpgradeGroups: Record<string, string[]> = splitIntoGroups(RepeatableUpgradeKeys)

{(()=>{
  RepeatableUpgradeKeys.forEach(x => {
    RepeatableUpgrades[x].condition ??= () => true;
    RepeatableUpgrades[x].priority ??= 0;
  })
})()}

export const RepeatableUpgradeKeysPriority = Object.keys(RepeatableUpgrades).sort((x,y) => RepeatableUpgrades[y].priority! - RepeatableUpgrades[x].priority!)

export const RepeatableUpgradeStyle: Record<string, {
  name: string,
  color: string,
}> = {
  "LR": {
    name: "Repeatable Leaf Upgrades",
    color: "L"
  },
  "SR": {
    name: "Repeatable Seed Upgrades",
    color: "S"
  },
  "FR": {
    name: "Repeatable Fruit Upgrades",
    color: "F"
  },
  "ER": {
    name: "Repeatable Entropy Upgrades",
    color: "E"
  },
  "ROR": {
    name: "Repeatable Root Upgrades",
    color: "RO"
  },
}

export function resetRepeatableUpgradesByGroup(id: string, keep: string[] = []) { for (const i of RepeatableUpgradeGroups[id]) if (!keep.includes(i)) player.repeatable_upgrades[i][0] = 0; }

export function purchaseRepeatableUpgrade(id: string, auto: boolean = false) {
  const U = RepeatableUpgrades[id]

  if (!U.condition()) return;

  const amount = player.repeatable_upgrades[id][0], limit = Decimal.round(U.max)

  if (Decimal.gte(amount, limit)) return;

  const C = Currencies[U.cost[0]]
  let cost = U.cost[1](amount)

  if (Decimal.lt(C.amount, cost)) return;

  let bulk = Decimal.add(amount, 1)

  if (auto) cost = U.cost[1]((bulk = bulk.max(U.cost[2](C.amount)).min(limit)).sub(1));

  player.repeatable_upgrades[id][1] = (player.repeatable_upgrades[id][0] = bulk).max(player.repeatable_upgrades[id][1])

  if (!auto) C.amount = Decimal.sub(C.amount, cost);

  // U.onbuy?.()
}
export function purchaseAllRepeatableUpgrades(group: string, auto: boolean = false) { for (const id of RepeatableUpgradeGroups[group]) purchaseRepeatableUpgrade(id, auto); }

export function setupRepeatableUpgrades() {
  for (const id of RepeatableUpgradeKeysPriority) {
    const U = RepeatableUpgrades[id], E = U.effect, PE = U.preEffect

    PE.changeID('rupg-'+id)
    PE.active = () => Decimal.gt(player.repeatable_upgrades[id][0], 0);

    PE.calc = () => E.calc(player.repeatable_upgrades[id][0]);
  }
}
