import { player, temp } from "@/main"
import { D, DC, scale } from "@/utils/decimal"
import { Effect, EffectType } from "@/utils/effect"
import type { DecimalSource } from "break_eternity.js"
import Decimal from "break_eternity.js"
import { hasUpgrade } from "./upgrades"
import { Bacteria } from "./bacteria"
import { Auto, AutoKeys } from "./automation"

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
    get requirement() { return Decimal.add(scale(scale(player.auto.total, 400, 2, "P"), 100, 2, "L"), 1).pow_base(1e12) },

    get amount() {
      let x = D(player.auto.total)

      for (const id of AutoKeys) if (player.auto.enabled[id]) x = x.sub(Auto[id].cost);

      return x.max(0)
    },
  },
}
