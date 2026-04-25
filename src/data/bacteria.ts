import { player, temp } from "@/main"
import Decimal, { type DecimalSource } from "break_eternity.js"
import { getBigUpgradeEffect } from "./big_upgrades"
import { DC, scale, softcap } from "@/utils/decimal"
import { Effect, EffectType } from "@/utils/effect"
import { hasUpgrade } from "./upgrades"

export const Bacteria = {
  get CellBoost() {
    return scale(scale(Decimal.add(player.bacteria.types, 1), 20, 2, "L"), 10, 2, "ME2")
  },

  get BacteriaBoost() {
    return Decimal.sub(player.bacteria.types, 1).max(0).mul(.2).add(1)
  },

  get BacteriaTypeBulk() {
    if (Decimal.lt(player.cell.amount, DC.DE308)) return;

    return scale(scale(Decimal.log10(player.cell.amount).div(DC.DE308LOG), 10, 2, "ME2", true), 20, 2, "L", true).floor()
  },

  get limit() {
    return softcap(Effect.calculateEffects('bacteria-limit'), 'e10000', .5, "E")
  },

  get speed(): DecimalSource {
    return Decimal.div(getBigUpgradeEffect("bacteria\\2"), hasUpgrade("RO\\5") ? 60 : 600).mul(getBigUpgradeEffect("bacteria\\3"))
  },

  effects: [
    x => softcap(softcap(Decimal.add(x, 1).log(3).mul(.075).root(2).div(10), .5, 1, "LOG"), .75, .5, "P").mul(Effect.effect("upg-RO\\23")),
    x => softcap(Decimal.add(x, 1).log(3), 100, 1, "LOG"),
    x => softcap(Decimal.add(x, 1).root(2), 1e50, .5, "E"),
  ] as ((x: DecimalSource) => DecimalSource)[],
  effect(x: number) { return this.effects[x](player.bacteria.amount) },

  setup() {
    new Effect({
      type: EffectType.Multiplier,
      id: "bacteria-limit",
      static: false,
      calc: () => Decimal.mul(temp.currencies.bacteria, 1e4),
      group: "bacteria-limit",
    })

    new Effect({
      type: EffectType.Multiplier,
      id: "bacteria-C",
      static: false,
      active: () => Decimal.gte(player.bacteria.types, 1),
      calc: () => this.effects[2](player.bacteria.amount),
      group: "composting-speed",
    })
    new Effect({
      type: EffectType.Exponent,
      id: "bacteria-B",
      static: false,
      active: () => Decimal.gte(player.bacteria.types, 1),
      calc: () => this.BacteriaBoost,
      group: "bacteria",
    })
  },
}
