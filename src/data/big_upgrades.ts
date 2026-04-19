import { player } from "@/main"
import { scale, simpleCost, softcap } from "@/utils/decimal"
import { formatPercent, formatTime, formatPow, formatPlus, formatMult } from "@/utils/formats"
import type { DecimalSource } from "break_eternity.js"
import Decimal from "break_eternity.js"
import { hasUpgrade } from "./upgrades"
import { splitIntoGroups } from "@/utils/misc"
import { Currencies, Currency } from "./currencies"
import { Effect, EffectType } from "@/utils/effect"

export const BigUpgrades: Record<string, {
  unl(): boolean,
  nospend?: boolean,
  bonus?: DecimalSource,
  description: string,
  cost: [string, (x: DecimalSource) => DecimalSource, (x: DecimalSource) => DecimalSource],
  effect: [DecimalSource,(x: DecimalSource) => DecimalSource, (x: DecimalSource) => string]
  preEffect: Effect
}> = {
  "cell\\1": {
    unl: () => true,
    get description() { return `Increase replicate chance.` },
    cost: ['entropy', x => simpleCost(x, "E", 1, 1.1).floor(), x => simpleCost(x, "EI", 1, 1.1).floor().add(1)],
    effect: [1, x => Decimal.add(x, 1), x => formatPercent(Decimal.div(x, 100))],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "cell-speed",
    })
  },
  "cell\\2": {
    unl: () => true,
    get description() { return `Decrease replicate interval.` },
    cost: ['fruits', x => simpleCost(x, "E", 1e6, 5).floor(), x => simpleCost(x, "EI", 1e6, 5).floor().add(1)],
    get bonus() { return Effect.effect("upg-E\\20") },
    effect: [1, x => Decimal.pow(1.25, x), x => formatTime(Decimal.pow(x, -1).mul(Decimal.max(player.cell.amount, 1e20).log10().div(20).sub(1).pow_base(2)))],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "cell-speed",
    })
  },
  "cell\\3": {
    unl: () => hasUpgrade("E\\18"),
    get description() { return `Increase replicate amount.` },
    cost: ['entropy', x => simpleCost(x, "E", 1e3, 1.5).floor(), x => simpleCost(x, "EI", 1e3, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(2, x), x => formatPow(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "cell-speed",
    })
  },

  "bacteria\\1": {
    unl: () => true,
    nospend: true,
    get description() { return `Add bonus Fertilizers of all types.` },
    cost: ['bacteria', x => simpleCost(scale(scale(x, 100, 2, 'P'), 10, 2, 'P'), "E", 1e3, 5).floor(), x => scale(scale(simpleCost(x, "EI", 1e3, 5), 10, 2, "P", true), 100, 2, "P", true).floor().add(1)],
    effect: [0, x => x, x => formatPlus(x, 0)],
    preEffect: new Effect({
      type: EffectType.Addition,
      static: false,
    })
  },
  "bacteria\\2": {
    unl: () => true,
    nospend: true,
    get description() { return `Replicate Bacteria faster.` },
    cost: ['bacteria', x => simpleCost(x, "E", 1e4, 10).floor(), x => simpleCost(x, "EI", 1e4, 10).floor().add(1)],
    effect: [1, x => softcap(Decimal.root(x, 2).pow_base(1.5).mul(Decimal.div(x, 5).add(1)), 100, 1, "LOG"), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
}
export const BigUpgradeKeys = Object.keys(BigUpgrades)
export const BigUpgradeGroups: Record<string, string[]> = splitIntoGroups(BigUpgradeKeys)

export const BigUpgradeColors: Record<string, string> = {
  "cell": "#b1c4eb",
  "bacteria": "#9ae8a5",
}

export function getBigUpgradeEffect(id: string) { return Effect.effect("bupg-"+id) }

export function purchaseBigUpgrade(id: string, auto: boolean = false) {
  const U = BigUpgrades[id]

  if (!U.unl()) return;

  const amount = player.big_upgrades[id], C = Currencies[U.cost[0] as Currency]
  let cost = U.cost[1](amount)

  if (Decimal.lt(C.amount, cost)) return;

  let bulk = Decimal.add(amount, 1)

  if (auto) cost = U.cost[1]((bulk = bulk.max(U.cost[2](C.amount))).sub(1));

  player.big_upgrades[id] = bulk
  if (!auto && !U.nospend) C.amount = Decimal.sub(C.amount, cost);

  // U.onbuy?.()
}

export function setupBigUpgrades() {
  for (const id of BigUpgradeKeys) {
    const U = BigUpgrades[id], E = U.effect, PE = U.preEffect

    PE.changeID('bupg-'+id)
    PE.active = () => Decimal.add(player.big_upgrades[id], U.bonus ?? 0).gt(0);

    PE.default = E[0];
    PE.calc = () => E[1](Decimal.add(player.big_upgrades[id], U.bonus ?? 0));
    PE.display = E[2];
  }
}
