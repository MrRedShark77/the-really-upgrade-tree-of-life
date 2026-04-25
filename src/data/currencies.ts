import { FPS, player, temp } from "@/main";
import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";
import { hasUpgrade } from "./upgrades";
import { Effect, Effects, EffectType, TotalEffectGroups } from "@/utils/effect";
import { Resets } from "./resets";
import { advanced_softcap, softcap } from "@/utils/decimal";
import { format, formatGain, formatMult, formatTime } from "@/utils/formats";
import { softcapped_text } from "@/utils/misc";
import { Cell } from "./cell";
import { Seasons } from "./challenges";

export enum Currency {
  Leaves = 'leaves',
  TreeAge = 'age',
  Seeds = 'seeds',
  Fruits = 'fruits',
  PotentialEnergy = "potential-energy",
  Entropy = "entropy",
  Bacteria = "bacteria",
  Roots = "roots",
  TotalRoots = "total-roots",
  Heat = "heat",
  Ash = "ash",
}

export const Currencies: Record<Currency, {
  name: string;
  amount: DecimalSource;
  gain: DecimalSource;
  passive: DecimalSource;
}> = {
  leaves: {
    name: "Leaves",
    get amount() { return player.leaves },
    set amount(v) { player.leaves = Decimal.max(v, 0) },

    get gain() {
      if (!hasUpgrade("L\\0")) return 0;

      return Effect.calculateEffects("leaves", 1)
    },

    passive: 1,
  },
  age: {
    name: "Tree Age",
    get amount() { return player.age },
    set amount(v) { player.age = Decimal.max(v, 0) },

    get gain() {
      if (!hasUpgrade("L\\0")) return 0;

      let x = Effect.calculateEffects("age", 1)

      x = advanced_softcap(x, '4.351968e367', .5, hasUpgrade("E\\52") ? .9 : 1, "E")

      return x
    },

    passive: 1,
  },
  seeds: {
    name: "Seeds",
    get amount() { return player.seeds },
    set amount(v) { player.seeds = Decimal.max(v, 0) },

    get gain() {
      if (!Resets.seeds.reached) return 0;

      const x = Effect.calculateEffects("seeds", 1)

      return Decimal.max(x, 0).floor()
    },

    get passive() { return +player.first.weather[1] },
  },
  fruits: {
    name: "Fruits",
    get amount() { return player.fruits },
    set amount(v) { player.fruits = Decimal.max(v, 0) },

    get gain() {
      if (!Resets.fruits.reached) return 0;

      if (Seasons.in(0)) return 1;

      const x = Effect.calculateEffects("fruits", 1)

      return Decimal.max(x, 0).floor()
    },

    get passive() { return +player.first.season[0] },
  },
  'potential-energy': {
    name: "Potential Energy",
    get amount() { return player.PE },
    set amount(v) { player.PE = Decimal.max(v, 0) },

    gain: 0,

    passive: 0,
  },
  'entropy': {
    name: "Entropy",
    get amount() { return player.entropy },
    set amount(v) { player.entropy = Decimal.max(v, 0) },

    get gain() {
      if (!Resets.entropy.reached) return 0;

      const x = Effect.calculateEffects("entropy", 1)

      return Decimal.max(x, 1).floor()
    },

    passive: 0,
  },
  'bacteria': {
    name: "Bacteria",
    get amount() { return player.bacteria.amount },
    set amount(v) { player.bacteria.amount = Decimal.max(v, 0) },

    get gain() {
      if (Decimal.lt(player.bacteria.types, 1) || !Resets.bacteria.reached) return 0;

      const x = Effect.calculateEffects("bacteria", 1)

      return Decimal.max(x, 1).floor()
    },

    get passive() { return +hasUpgrade("RO\\M7") },
  },
  'roots': {
    name: "Roots",
    get amount() { return player.root.amount },
    set amount(v) { player.root.amount = Decimal.max(v, 0) },

    get gain() {
      if (!Resets.root.reached) return 0;

      const x = Effect.calculateEffects("roots", 1)

      return Decimal.max(x, 1).floor()
    },

    passive: 0,
  },
  'total-roots': {
    name: "total Roots",
    get amount() { return player.root.total },
    set amount(v) { player.root.total = Decimal.max(v, 0) },

    gain: 0,
    passive: 0,
  },
  'heat': {
    name: "Heat",
    get amount() { return player.furnace.heat },
    set amount(v) { player.furnace.heat = Decimal.max(v, 0) },

    get gain() {
      if (!hasUpgrade("RO\\35")) return 0;

      const x = Effect.calculateEffects("heat", 1)

      return Decimal.max(x, 0)
    },

    passive: 1,
  },
  'ash': {
    name: "Ash",
    get amount() { return player.furnace.ash },
    set amount(v) { player.furnace.ash = Decimal.max(v, 0) },

    get gain() {
      if (!hasUpgrade("RO\\35")) return 0;

      const x = Effect.calculateEffects("ash", 1)

      return Decimal.max(x, 1).floor()
    },

    passive: 1,
  },
}

export function setupCurrencies() {
  new Effect({
    id: "seeds",
    group: "seeds",
    static: false,
    type: EffectType.Base,
    calc: () => Decimal.div(player.leaves, 1e7).cbrt()
  })
  new Effect({
    id: "fruits",
    group: "fruits",
    static: false,
    type: EffectType.Base,
    calc: () => Decimal.div(player.seeds, 2.5e7).root(4)
  })
  new Effect({
    id: "entropy",
    group: "entropy",
    static: false,
    type: EffectType.Base,
    calc: () => softcap(Decimal.div(player.PE, 2e22).root(20), 100, 0.75, "E")
  })
  new Effect({
    id: "bacteria",
    group: "bacteria",
    static: false,
    type: EffectType.Base,
    calc: () => softcap(Decimal.max(player.cell.amount, 1).pow(Decimal.add(player.entropy, 1).log10().div(200)).div(5e7), 1e9, 0.5, "E")
  })
  new Effect({
    id: "roots",
    group: "roots",
    static: false,
    type: EffectType.Base,
    variables: {
      get exp() { return Decimal.add(3, Effect.effect("upg-RO\\13")).add(Effect.effect("upg-E\\50")) },
    },
    calc() { return Decimal.max(player.leaves, 1).log10().div(1500).pow(this.variables.exp) },
  })
  new Effect({
    id: "heat",
    group: "heat",
    static: false,
    type: EffectType.Base,
    calc: () => Decimal.mul(player.incinerator[0][1], player.incinerator[1][1]).pow(2).mul(Decimal.div(player.incinerator[2][1], 10).pow(2).max(1)).div(1e3)
  })
  new Effect({
    id: "ash",
    group: "ash",
    static: false,
    type: EffectType.Base,
    calc: () => player.furnace.heat
  })
}

export const Currency_Stats: Record<string, {
  default?: boolean
  name: string,
  condition(): boolean
  color: string
  html: string
  hover?(): string
}> = {
  "leaves": {
    default: true,
    name: "Leaves",
    condition: () => true,
    color: '#84ff00',
    get html() {
      const C = Currencies.leaves
      return `<b>Leaves</b>: ${format(C.amount,0)}<br>${formatGain(C.amount, temp.currencies.leaves)}`
    },
    hover: () => `<h3>Leaves</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("leaves")} = <b>${format(temp.currencies.leaves)}</b>`,
  },
  "age": {
    condition: () => true,
    name: "Tree age",
    color: '#d9ff00',
    get html() {
      const C = Currencies.age
      return `<b>Tree age</b>: ${formatTime(C.amount)}<br>${formatGain(C.amount, temp.currencies.age, formatTime)}`
    },
    hover: () => `<h3>Tree aging speed</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("age")} = <b>${format(temp.currencies.age)}</b> ${softcapped_text(Decimal.gte(temp.currencies.age, '4.351968e367'))}`,
  },
  "seeds": {
    default: true,
    name: "Seeds",
    condition: () => player.first.seed,
    color: '#e86400',
    get html() {
      const C = Currencies.seeds
      return `<b>Seeds</b>: ${format(C.amount,0)}<br>${Decimal.neq(C.passive, 0) ? formatGain(C.amount, temp.currencies.seeds) : `(+${format(temp.currencies.seeds, 0)})`}`
    },
    hover: () => `<h3>Seeds</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("seeds",true,`(<b>Leaves</b> / ${format(1e7)})<sup>${format(1/3)}</sup>`)} = <b>${format(temp.currencies.seeds)}</b>`,
  },
  "fruits": {
    default: true,
    name: "Fruits",
    condition: () => player.first.fruit,
    color: '#ff0000',
    get html() {
      const C = Currencies.fruits
      return `<b>Fruits</b>: ${format(C.amount,0)}<br>${Decimal.neq(C.passive, 0) ? formatGain(C.amount, temp.currencies.fruits) : `(+${format(temp.currencies.fruits, 0)})`}`
    },
    hover: () => `<h3>Fruits</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("fruits",true,`(<b>Seeds</b> / ${format(2.5e7)})<sup>${format(1/4)}</sup>`)} = <b>${format(temp.currencies.fruits)}</b>`,
  },
  "fertilizers": {
    name: "Fertilizers",
    condition: () => hasUpgrade("F\\1"),
    color: '#8a3700',
    get html() { return `<b>Fertilizers</b>: ${format(temp.total_fertilizers)}` },
  },
  "pe": {
    default: true,
    name: "Potential Energy",
    condition: () => hasUpgrade("L\\28"),
    color: 'white',
    get html() {
      const C = Currencies["potential-energy"]
      return `<b>Potential Energy</b>: ${format(C.amount,0)}`
    },
  },
  "entropy": {
    default: true,
    name: "Entropy",
    condition: () => player.first.entropy,
    color: '#b1c4eb',
    get html() {
      const C = Currencies.entropy
      return `<b>Entropy</b>: ${format(C.amount,0)}<br>${Decimal.neq(C.passive, 0) ? formatGain(C.amount, temp.currencies.entropy) : `(+${format(temp.currencies.entropy, 0)})`}`
    },
    hover: () => `<h3>Entropy</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("entropy",true,`(<b>Potential Energy</b> / ${format(2e22)})<sup>${format(1/20)}</sup>`, softcapped_text(Decimal.gte(TotalEffectGroups.entropy[EffectType.Base], 100)))} = <b>${format(temp.currencies.entropy)}</b>`,
  },
  "cell": {
    name: "Cell",
    condition: () => false,
    color: '#b1c4eb',
    get html() {
      return `<b>Cells</b>: ${format(player.cell.amount,0)}<br>(${formatMult(Cell.calc(1/FPS).div(player.cell.amount).pow(FPS),3)}/s)`
    },
    hover: () => `<h3>Cell replication speed</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("cell-speed")} / 100 = <b>${format(Cell.power)}</b>`,
  },
  "bacteria": {
    name: "Bacteria",
    condition: () => Decimal.gt(player.bacteria.types, 0),
    color: '#9ae8a5',
    get html() {
      const C = Currencies.bacteria
      return `<b>Bactreria</b>: ${format(C.amount,0)}<br>${Decimal.neq(C.passive, 0) ? formatGain(C.amount, temp.currencies.bacteria) : `(+${format(temp.currencies.bacteria, 0)})`}`
    },
    hover: () => `<h3>Bacteria</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("bacteria",true,`<b>Cells</b><sup>0.005 × log<sub>10</sub>(<b>Entropy</b>+1)</sup> / ${format(5e7)}`, softcapped_text(Decimal.gte(TotalEffectGroups.bacteria[EffectType.Base], 1e9)))} = <b>${format(temp.currencies.bacteria)}</b>`,
  },
  "roots": {
    default: true,
    name: "Roots",
    condition: () => player.first.root,
    color: '#dddf24',
    get html() {
      const C = Currencies.roots
      return `<b>Roots</b>: ${format(C.amount,0)}<br>${Decimal.neq(C.passive, 0) ? formatGain(C.amount, temp.currencies.roots) : `(+${format(temp.currencies.roots, 0)})`}`
    },
    hover: () => `<h3>Roots</h3>
    <hr class='sub-line white-line' />
    ${Effect.calculateEffectHTML("roots",true,`(log<sub>10</sub><b>Leaves</b> / ${format(1500)})<sup>${format(Effects['roots'].variables.exp,3)}</sup>`)} = <b>${format(temp.currencies.roots)}</b>`,
  },
}
