import { player } from "@/main"
import { scale, simpleCost, softcap } from "@/utils/decimal"
import { formatPercent, formatTime, formatPow, formatPlus, formatMult } from "@/utils/formats"
import type { DecimalSource } from "break_eternity.js"
import Decimal from "break_eternity.js"
import { hasUpgrade } from "./upgrades"
import { splitIntoGroups } from "@/utils/misc"
import { Currencies } from "./currencies"
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
    effect: [1, x => Decimal.add(x, 1).pow(hasUpgrade("E\\42") ? Decimal.div(x, 100).add(1) : 1), x => formatPercent(Decimal.div(x, 100))],
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
    cost: ['bacteria', x => simpleCost(scale(scale(x, 50, 2, 'ME2'), 10, 2, 'P'), "E", 1e3, 5).floor(), x => scale(scale(simpleCost(x, "EI", 1e3, 5), 10, 2, "P", true), 50, 2, "ME2", true).floor().add(1)],
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
    effect: [1, x => softcap(Decimal.root(x, 2).pow_base(1.5).mul(Decimal.div(x, 5).add(1)), 1000, 1, "LOG"), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "bacteria\\3": {
    unl: () => hasUpgrade("RO\\16"),
    nospend: true,
    get description() { return `Replicate Bacteria faster again.` },
    cost: ['roots', x => simpleCost(x, "E", 1, 1.5).floor(), x => simpleCost(x, "EI", 1, 1.5).floor().add(1)],
    effect: [1, x => Decimal.add(x, 1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },

  //#region Fallen Leaves
  "fallen-0\\1": {
    unl: () => false,
    get description() { return `Increase Fallen Leaves gain.` },
    cost: ['', x => simpleCost(x, "E", 10, 1.5).floor(), x => simpleCost(x, "EI", 10, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-0",
    })
  },
  "fallen-0\\2": {
    unl: () => false,
    get description() { return `Increase Ash gain.` },
    cost: ['', x => simpleCost(x, "E", 10, 1.4).floor(), x => simpleCost(x, "EI", 10, 1.4).floor().add(1)],
    effect: [1, x => Decimal.pow(2, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "ash",
    })
  },
  "fallen-0\\3": {
    unl: () => false,
    get description() { return `Increase Leaves falling speed.` },
    cost: ['', x => simpleCost(x, "E", 750, 2).floor(), x => simpleCost(x, "EI", 750, 2).floor().add(1)],
    effect: [1, x => Decimal.add(1, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-speed",
    })
  },
  "fallen-0\\4": {
    unl: () => false,
    get description() { return `Increase Basket cap.` },
    cost: ['', x => simpleCost(x, "E", 25, 1.75).floor(), x => simpleCost(x, "EI", 25, 1.75).floor().add(1)],
    effect: [1, x => Decimal.add(1, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-basket",
    })
  },
  //#endregion
  //#region Bronze Leaves
  "fallen-1\\1": {
    unl: () => false,
    get description() { return `Increase Fallen Leaves gain.` },
    cost: ['', x => simpleCost(x, "E", 1, 1.5).floor(), x => simpleCost(x, "EI", 1, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(1.2, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-0",
    })
  },
  "fallen-1\\2": {
    unl: () => false,
    get description() { return `Increase Heat gain.` },
    cost: ['', x => simpleCost(x, "E", 5, 1.4).floor(), x => simpleCost(x, "EI", 5, 1.4).floor().add(1)],
    effect: [1, x => Decimal.pow(2, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "heat",
    })
  },
  "fallen-1\\3": {
    unl: () => false,
    get description() { return `Decrease Fallen Leaves conversion.` },
    cost: ['', x => simpleCost(x, "E", 10, 2).floor(), x => simpleCost(x, "EI", 10, 2).floor().add(1)],
    effect: [1, x => Decimal.add(1, x).pow(-1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "fallen-1\\4": {
    unl: () => false,
    get description() { return `Increase Basket cap.` },
    cost: ['', x => simpleCost(x, "E", 25, 1.5).floor(), x => simpleCost(x, "EI", 25, 1.5).floor().add(1)],
    effect: [1, x => Decimal.mul(.5, x).add(1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-basket",
    })
  },
  //#endregion
  //#region Silver Leaves
  "fallen-2\\1": {
    unl: () => false,
    get description() { return `Increase Bronze Leaves gain.` },
    cost: ['', x => simpleCost(x, "E", 1, 1.5).floor(), x => simpleCost(x, "EI", 1, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-1",
    })
  },
  "fallen-2\\2": {
    unl: () => false,
    get description() { return `Increase Roots gain.` },
    cost: ['', x => simpleCost(x, "E", 5, 3).floor(), x => simpleCost(x, "EI", 5, 3).floor().add(1)],
    effect: [1, x => Decimal.pow(1.15, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "roots",
    })
  },
  "fallen-2\\3": {
    unl: () => false,
    get description() { return `Decrease Bronze Leaves conversion.` },
    cost: ['', x => simpleCost(x, "E", 10, 2).floor(), x => simpleCost(x, "EI", 10, 2).floor().add(1)],
    effect: [1, x =>Decimal.mul(.5, x).add(1).pow(-1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "fallen-2\\4": {
    unl: () => false,
    get description() { return `Increase Leaves falling speed.` },
    cost: ['', x => simpleCost(x, "E", 25, 1.5).floor(), x => simpleCost(x, "EI", 25, 1.5).floor().add(1)],
    effect: [1, x => Decimal.mul(.5, x).add(1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-speed",
    })
  },
  //#endregion
  //#region Golden Leaves
  "fallen-3\\1": {
    unl: () => false,
    get description() { return `Increase Silver Leaves gain.` },
    cost: ['', x => simpleCost(x, "E", 1, 1.5).floor(), x => simpleCost(x, "EI", 1, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-2",
    })
  },
  "fallen-3\\2": {
    unl: () => false,
    get description() { return `Increase Incinerator's Entropy buff.` },
    cost: ['', x => simpleCost(x, "E", 5, 3).floor(), x => simpleCost(x, "EI", 5, 3).floor().add(1)],
    effect: [1, x => Decimal.mul(.1, x).add(1), x => formatPow(x)],
    preEffect: new Effect({
      type: EffectType.Exponent,
      static: false,
    })
  },
  "fallen-3\\3": {
    unl: () => false,
    get description() { return `Decrease Silver Leaves conversion.` },
    cost: ['', x => simpleCost(x, "E", 10, 2).floor(), x => simpleCost(x, "EI", 10, 2).floor().add(1)],
    effect: [1, x =>Decimal.mul(.5, x).add(1).pow(-1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "fallen-3\\4": {
    unl: () => false,
    get description() { return `Increase Basket cap.` },
    cost: ['', x => simpleCost(x, "E", 25, 1.5).floor(), x => simpleCost(x, "EI", 25, 1.5).floor().add(1)],
    effect: [1, x => Decimal.mul(.5, x).add(1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-basket",
    })
  },
  //#endregion
  //#region Platinum Leaves
  "fallen-4\\1": {
    unl: () => false,
    get description() { return `Increase Golden Leaves gain.` },
    cost: ['', x => simpleCost(x, "E", 10, 1.5).floor(), x => simpleCost(x, "EI", 10, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-3",
    })
  },
  "fallen-4\\2": {
    unl: () => false,
    get description() { return `Increase Leaves and Seeds gain.` },
    cost: ['', x => simpleCost(x, "E", 50, 2).floor(), x => simpleCost(x, "EI", 50, 2).floor().add(1)],
    effect: [1, x => Decimal.pow(1e33, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: ['leaves', 'seeds']
    })
  },
  "fallen-4\\3": {
    unl: () => false,
    get description() { return `Decrease Golden Leaves conversion.` },
    cost: ['', x => simpleCost(x, "E", 200, 2).floor(), x => simpleCost(x, "EI", 200, 2).floor().add(1)],
    effect: [1, x =>Decimal.mul(.25, x).add(1).pow(-1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "fallen-4\\4": {
    unl: () => false,
    get description() { return `Increase Leaves falling speed.` },
    cost: ['', x => simpleCost(x, "E", 500, 1.5).floor(), x => simpleCost(x, "EI", 500, 1.5).floor().add(1)],
    effect: [1, x => Decimal.mul(.5, x).add(1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-speed",
    })
  },
  //#endregion
  //#region Diamond Leaves
  "fallen-5\\1": {
    unl: () => false,
    get description() { return `Increase Platinum Leaves gain.` },
    cost: ['', x => simpleCost(x, "E", 50, 1.5).floor(), x => simpleCost(x, "EI", 50, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-4",
    })
  },
  "fallen-5\\2": {
    unl: () => false,
    get description() { return `Raise static Leaf miltiplier.` },
    cost: ['', x => simpleCost(x, "E", 200, 2).floor(), x => simpleCost(x, "EI", 200, 2).floor().add(1)],
    effect: [1, x => Decimal.mul(.1, x).add(1), x => formatPow(x)],
    preEffect: new Effect({
      type: EffectType.BaseExponent,
      static: false,
      group: 'leaves'
    })
  },
  "fallen-5\\3": {
    unl: () => false,
    get description() { return `Decrease Platinum Leaves conversion.` },
    cost: ['', x => simpleCost(x, "E", 750, 1.5).floor(), x => simpleCost(x, "EI", 750, 1.5).floor().add(1)],
    effect: [1, x => Decimal.mul(.25, x).add(1).pow(-1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "fallen-5\\4": {
    unl: () => false,
    get description() { return `Increase Basket cap.` },
    cost: ['', x => simpleCost(x, "E", 1e3, 1.5).floor(), x => simpleCost(x, "EI", 1e3, 1.5).floor().add(1)],
    effect: [1, x => Decimal.mul(.5, x).add(1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-basket",
    })
  },
  //#endregion
  //#region Diamond Leaves
  "fallen-6\\1": {
    unl: () => false,
    get description() { return `Increase Diamond Leaves gain.` },
    cost: ['', x => simpleCost(x, "E", 2e9, 1.5).floor(), x => simpleCost(x, "EI", 2e9, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-5",
    })
  },
  "fallen-6\\2": {
    unl: () => false,
    get description() { return `Raise Virus gain.` },
    cost: ['', x => simpleCost(x, "E", 3e9, 2).floor(), x => simpleCost(x, "EI", 3e9, 2).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatPow(x)],
    preEffect: new Effect({
      type: EffectType.Exponent,
      static: false,
      group: 'virus'
    })
  },
  "fallen-6\\3": {
    unl: () => false,
    get description() { return `Decrease Diamond Leaves conversion.` },
    cost: ['', x => simpleCost(x, "E", 5e9, 3).floor(), x => simpleCost(x, "EI", 5e9, 3).floor().add(1)],
    effect: [1, x => Decimal.mul(.5, x).add(1).pow(-1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "fallen-6\\4": {
    unl: () => false,
    get description() { return `Increase Leaves falling speed.` },
    cost: ['', x => simpleCost(x, "E", 1e10, 2).floor(), x => simpleCost(x, "EI", 1e10, 2).floor().add(1)],
    effect: [1, x => Decimal.mul(1, x).add(1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-speed",
    })
  },
  //#endregion
  //#region Sacred Leaves
  "sacred\\1": {
    unl: () => true,
    get description() { return `Increase Fallen Leaves of all types.` },
    cost: ['sacred', x => simpleCost(x, "E", 1, 2).floor(), x => simpleCost(x, "EI", 1, 2).floor().add(1)],
    effect: [1, x => Decimal.pow(1.35, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: ["fallen-0","fallen-1","fallen-2","fallen-3","fallen-4","fallen-5","fallen-6"],
    })
  },
  "sacred\\2": {
    unl: () => true,
    get description() { return `Increase Fallen Leaves gain.` },
    cost: ['sacred', x => simpleCost(x, "E", 5, 1.5).floor(), x => simpleCost(x, "EI", 5, 1.5).floor().add(1)],
    effect: [1, x => Decimal.pow(2, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "fallen-0",
    })
  },
  "sacred\\3": {
    unl: () => true,
    get description() { return `Increase Sacred Leaves gain.` },
    cost: ['sacred', x => simpleCost(x, "E", 10, 2).floor(), x => simpleCost(x, "EI", 10, 2).floor().add(1)],
    effect: [1, x => Decimal.pow(1.2, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "sacred",
    })
  },
  "sacred\\4": {
    unl: () => true,
    get description() { return `Increase Leaves falling speed and Basket cap.` },
    cost: ['sacred', x => simpleCost(x, "E", 1, 2).floor(), x => simpleCost(x, "EI", 1, 2).floor().add(1)],
    effect: [1, x => Decimal.pow(1.25, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: ["fallen-speed","fallen-basket"],
    })
  },
  //#endregion
  //#region Virus
  "virus\\1": {
    unl: () => true,
    get description() { return `Increase Entropy gain.` },
    cost: ['virus', x => Decimal.add(x, 1).pow_base(2).pow10(), x => Decimal.log10(x).log(2).floor()],
    get bonus() { return Effect.effect("upg-RO\\58") },
    effect: [1, x => Decimal.pow(1e3, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "entropy",
    })
  },
  "virus\\2": {
    unl: () => player.season.active === 2,
    get description() { return `Increase Virus nerf starting.` },
    cost: ['virus', x => Decimal.pow(1.5, x).pow10(), x => Decimal.log10(x).log(1.5).floor().add(1)],
    effect: [1, x => Decimal.add(x, 1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "virus\\3": {
    unl: () => player.season.active === 2,
    get description() { return `Reduce Virus nerf exponent.` },
    cost: ['virus', x => Decimal.pow(2, x).mul(1e3).pow10(), x => Decimal.log10(x).div(1e3).log(2).floor().add(1)],
    effect: [1, x => Decimal.div(x, 3).add(1).pow(-1), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  "virus\\4": {
    unl: () => player.first.beneficial_virus,
    get description() { return `Increase Mutation chance.` },
    cost: ['virus', x => Decimal.pow(2, x).mul(2e5).pow10(), x => Decimal.log10(x).div(2e5).log(2).floor().add(1)],
    effect: [1, x => Decimal.add(x, 1), x => formatPercent(Decimal.div(x, 100))],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
    })
  },
  //#endregion
  //#region Beneficial Virus
  "BV\\1": {
    unl: () => true,
    get description() { return `Delay Sueprscaled Fertilizers.` },
    cost: ['BV', x => simpleCost(x, "E", 5, 3).floor(), x => simpleCost(x, "EI", 5, 3).floor().add(1)],
    effect: [0, x => Decimal.mul(x, 10), x => formatPlus(x)],
    preEffect: new Effect({
      type: EffectType.Addition,
      static: false,
    })
  },
  "BV\\2": {
    unl: () => true,
    get description() { return `Increase Virus gain.` },
    cost: ['BV', x => simpleCost(x, "E", 100, 2).floor(), x => simpleCost(x, "EI", 100, 2).floor().add(1)],
    effect: [1, x => Decimal.pow(1.5, x), x => formatPow(x)],
    preEffect: new Effect({
      type: EffectType.Exponent,
      static: false,
      group: "virus",
    })
  },
  "BV\\3": {
    unl: () => true,
    get description() { return `Increase Sacred Leaves gain.` },
    cost: ['BV', x => simpleCost(x, "E", 1000, 2).floor(), x => simpleCost(x, "EI", 1000, 2).floor().add(1)],
    effect: [1, x => Decimal.pow(1.15, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "sacred",
    })
  },
  "BV\\4": {
    unl: () => true,
    get description() { return `Increase Beneficial Virus gain.` },
    cost: ['BV', x => simpleCost(x, "E", 1e4, 4).floor(), x => simpleCost(x, "EI", 1e4, 4).floor().add(1)],
    effect: [1, x => Decimal.pow(2, x), x => formatMult(x)],
    preEffect: new Effect({
      type: EffectType.Multiplier,
      static: false,
      group: "BV",
    })
  },
  //#endregion
}
export const BigUpgradeKeys = Object.keys(BigUpgrades)
export const BigUpgradeGroups: Record<string, string[]> = splitIntoGroups(BigUpgradeKeys)

export const BigUpgradesEL: Record<string, () => boolean> = {
  "sacred": () => hasUpgrade("FA\\9"),
}

export function getBigUpgradeEffect(id: string) { return Effect.effect("bupg-"+id) }
export function resetBigUpgradesByGroup(id: string, keep: string[] = []) { for (const i of BigUpgradeGroups[id]) if (!keep.includes(i)) player.big_upgrades[i] = 0; }

export function purchaseBigUpgrade(id: string, auto: boolean = false) {
  const U = BigUpgrades[id], G = id.split("\\")[0]

  if (!U.unl()) return;

  const amount = player.big_upgrades[id], C = Currencies[U.cost[0]]
  let cost = U.cost[1](amount)

  if (Decimal.lt(C.amount, cost)) return;

  let bulk = Decimal.add(amount, 1)

  if (auto) cost = U.cost[1]((bulk = bulk.max(U.cost[2](C.amount))).sub(1));

  player.big_upgrades[id] = bulk
  if (!auto && !U.nospend && !BigUpgradesEL[G]?.()) C.amount = G === 'virus' ? Decimal.div(C.amount, cost) : Decimal.sub(C.amount, cost);

  // U.onbuy?.()
}

export function purchaseAllBigUpgrades(group: string) { for (const id of BigUpgradeGroups[group]) purchaseBigUpgrade(id, true); }

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
