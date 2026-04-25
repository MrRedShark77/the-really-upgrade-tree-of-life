import { player } from "@/main"
import { simpleCost } from "@/utils/decimal"
import { Effect, EffectType } from "@/utils/effect"
import Decimal from "break_eternity.js"

export const Furnace = {
  charcoal: {
    get require() { return Decimal.pow(10, player.furnace.charcoal).mul(1e6) },
    get bulk() { return Decimal.div(player.root.total, 1e6).log(10).floor().add(1) },
  },

  coal: {
    get require() { return Decimal.pow(10, simpleCost(Decimal.add(player.furnace.coal, 2), "P", 1)) },
    get bulk() { return simpleCost((Decimal.max(player.furnace.ash, 1).log10()), "PI", 1).floor().sub(1) },
  },

  setup() {
    new Effect({
      id: "charcoal-boost",
      type: EffectType.Multiplier,
      static: false,
      group: ["heat","ash"],
      calc: () => Decimal.pow(5, player.furnace.charcoal),
    })

    new Effect({
      id: "coal-boost-1",
      type: EffectType.Multiplier,
      static: false,
      group: "ash",
      calc: () => Decimal.pow(10, player.furnace.coal),
    })
    new Effect({
      id: "coal-boost-2",
      type: EffectType.Multiplier,
      static: false,
      group: "roots",
      calc: () => Decimal.pow(1.1, player.furnace.coal),
    })

    new Effect({
      id: "ash-boost",
      type: EffectType.BaseExponent,
      static: false,
      group: "age",
      calc: () => Decimal.add(player.furnace.ash, 1).log10().root(2).div(5).add(1),
    })
  },
}
