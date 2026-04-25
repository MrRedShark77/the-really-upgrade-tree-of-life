import { Effect, EffectType } from "@/utils/effect"
import type { DecimalSource } from "break_eternity.js"
import { hasUpgrade } from "./upgrades"
import Decimal from "break_eternity.js"
import { simpleCost } from "@/utils/decimal"
import { formatMult } from "@/utils/formats"
import { splitIntoGroups } from "@/utils/misc"
import { player } from "@/main"
import { Currencies, Currency } from "./currencies"

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

    get max() { return Decimal.add(10, Effect.effect("upg-E\\30")).add(Effect.effect("upg-E\\35")).add(Effect.effect("upg-RO\\2")).add(Effect.effect("upg-RO\\10")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Seeds and Fruits.` },

    cost: [
      'leaves',
      x => simpleCost(x, "ES", hasUpgrade("RO\\2") ? 1 : 'e500', ...(hasUpgrade("E\\34") ? [1e4 * CS1(), 10**.5] : [1e5 * CS1(), 10**.625])).mul(Effect.effect("upg-E\\43")),
      x => simpleCost(Decimal.div(x, Effect.effect("upg-E\\43")), "ESI", hasUpgrade("RO\\2") ? 1 : 'e500', ...(hasUpgrade("E\\34") ? [1e4 * CS1(), 10**.5] : [1e5 * CS1(), 10**.625])).floor().add(1)],
    effect: {
      get base() { return Decimal.add(2, Effect.effect("upg-E\\32")) },
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

    get max() { return 15 },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Entropy.` },

    cost: ['leaves', x => simpleCost(x, "ES", 'e3500', 1e50, 10**6.25), x => simpleCost(x, "ESI", 'e3500', 1e50, 10**6.25).floor().add(1)],
    effect: {
      base: 2,
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: 'entropy',
      display: x => formatMult(x),
    }),
  },

  "SR\\1": {
    condition: () => hasUpgrade("S\\44"),

    get max() { return Decimal.add(10, Effect.effect("upg-E\\39")).mul(Effect.effect("upg-RO\\4")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Leaves and Tree aging speed.` },

    cost: [
      'seeds',
      x => simpleCost(x, "ES", hasUpgrade("RO\\4") ? 1 : 'e650', 1e6 * CS1(), 10**.75).mul(Effect.effect("upg-E\\45")),
      x => simpleCost(Decimal.div(x, Effect.effect("upg-E\\45")), "ESI", hasUpgrade("RO\\4") ? 1 : 'e650', 1e6 * CS1(), 10**.75).floor().add(1)
    ],
    effect: {
      get base() { return Decimal.add(8, Effect.effect("upg-E\\41")) },
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: ['leaves','age'],
      display: x => formatMult(x),
    }),
  },

  "FR\\1": {
    condition: () => hasUpgrade("F\\45"),

    get max() { return Decimal.add(10, Effect.effect("upg-E\\44")).add(Effect.effect("upg-E\\47")) },

    get description() { return `<b>${formatMult(this.effect.base)}</b> to Leaves, Seeds, and Fruits.` },

    cost: [
      'fruits',
      x => simpleCost(x, "ES", 'e750', 1e10 * CS1(), 10).mul(Effect.effect("upg-E\\46")),
      x => simpleCost(Decimal.div(x, Effect.effect("upg-E\\46")), "ESI", 'e750', 1e10 * CS1(), 10).floor().add(1)
    ],
    effect: {
      get base() { return Decimal.pow(10, Effect.effect("upg-E\\51")) },
      calc(x) { return Decimal.pow(this.base, x) },
    },
    preEffect: new Effect({
      type: EffectType.BaseMultiplier,
      static: true,
      group: ['leaves','seeds','fruits'],
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
}

export function resetRepeatableUpgradesByGroup(id: string, keep: string[] = []) { for (const i of RepeatableUpgradeGroups[id]) if (!keep.includes(i)) player.repeatable_upgrades[i][0] = 0; }

export function purchaseRepeatableUpgrade(id: string, auto: boolean = false) {
  const U = RepeatableUpgrades[id]

  if (!U.condition()) return;

  const amount = player.repeatable_upgrades[id][0], limit = Decimal.round(U.max)

  if (Decimal.gte(amount, limit)) return;

  const C = Currencies[U.cost[0] as Currency]
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
