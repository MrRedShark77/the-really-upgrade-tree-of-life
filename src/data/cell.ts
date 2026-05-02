import { player, temp } from "@/main"
import { D, DC, scale } from "@/utils/decimal"
import { Effect, EffectType } from "@/utils/effect"
import type { DecimalSource } from "break_eternity.js"
import Decimal from "break_eternity.js"
import { hasUpgrade } from "./upgrades"
import { Bacteria } from "./bacteria"
import { Auto, AutoKeys } from "./automation"
import { Seasons } from "./challenges"

export const Cell = {
  get power() {
    let x: DecimalSource = D(.01)

    x = Effect.calculateEffects("cell-speed", x)

    return x
  },

  get cap() {
    return DC.DE308.pow(Bacteria.CellBoost)
  },

  extend() {
    if (Decimal.lt(player.cell.amount, this.cap)) return;

    player.cell.amount = 1
    player.bacteria.types = Decimal.add(player.bacteria.types, 1)
  },

  calc(dt: DecimalSource, amount: DecimalSource = player.cell.amount) {
    if (Seasons.in(1)) return DC.D1;

    amount = Decimal.max(amount, 1).log10()

    const S = temp.cell_overflow

    amount = scale(amount, ...S[1], "L");
    amount = scale(amount, ...S[0], "ME2");

    const base = Decimal.log(10, 2)
    amount = amount.mul(base).add(Decimal.mul(dt, this.power)).div(base)

    amount = scale(amount, ...S[0], "ME2", true);
    amount = scale(amount, ...S[1], "L", true);

    amount = amount.pow10()

    if (!hasUpgrade("RO\\M8")) amount = amount.min(this.cap);

    return amount
  },

  setup() {
    new Effect({
      type: EffectType.Multiplier,
      id: "cell-L",
      static: false,
      active: () => hasUpgrade("E\\1"),
      calc: () => Decimal.add(player.cell.amount, 1).log2().pow(2).mul(Effect.effect("upg-E\\11")).root(player.weather.active > -1 && player.season.active > -1 ? 2 : 1),
      group: "leaves",
    })
    new Effect({
      type: EffectType.Multiplier,
      id: "cell-S",
      static: false,
      active: () => hasUpgrade("E\\1"),
      calc: () => Decimal.add(player.cell.amount, 1).log2().mul(Decimal.root(Effect.effect("upg-E\\11"), 2)).root(player.weather.active > -1 && player.season.active > -1 ? 2 : 1),
      group: "seeds",
    })
    new Effect({
      type: EffectType.Multiplier,
      id: "cell-F",
      static: false,
      active: () => hasUpgrade("E\\1"),
      calc: () => Decimal.add(player.cell.amount, 1).log2().root(2).mul(Decimal.root(Effect.effect("upg-E\\11"), 4)).root(player.weather.active > -1 && player.season.active > -1 ? 2 : 1),
      group: "fruits",
    })
  },

  cellular_power: {
    get requirement() { return Decimal.add(scale(scale(scale(player.auto.total, 1000, 2, "ME2"), 400, 2, "P"), 100, 2, "L"), 1).pow_base(1e12) },

    get amount() {
      let x = D(player.auto.total)

      for (const id of AutoKeys) if (player.auto.enabled[id]) x = x.sub(Auto[id].cost);

      return x.max(0)
    },
  },
}

export const Virus = {
  get speed() {
    let x: DecimalSource = 1.1

    x = Effect.calculateEffects('virus', x)

    return x
  },

  calc(dt: DecimalSource, amount: DecimalSource = player.virus) {
    return Decimal.pow(temp.virus_mult, dt).mul(amount)
  },

  setup() {
    new Effect({
      active: () => player.season.active === 2,
      type: EffectType.Exponent,
      static: false,
      id: "virus-nerf",
      group: ['leaves', 'seeds', 'fruits'],
      calc: () => Decimal.mul(0.002, Effect.effect('bupg-virus\\2')).div(Decimal.max(player.virus, 1).log10().div(10).add(1).root(2).pow(Effect.effect('bupg-virus\\3'))).min(1),
    })

    new Effect({
      type: EffectType.Exponent,
      static: false,
      id: "virus-boost-1",
      group: 'virus',
      calc: () => Decimal.add(player.leaves, 1).log10().div(100).add(1),
    })

    new Effect({
      type: EffectType.Exponent,
      static: false,
      id: "virus-boost-2",
      group: 'virus',
      calc: () => Decimal.add(player.bacteria.amount, 1).log10().div(100000).add(1),
    })
  },
}
