import { player } from "@/main"
import { D, DC, simpleCost } from "@/utils/decimal"
import { Effect, EffectType } from "@/utils/effect"
import Decimal from "break_eternity.js"
import { hasUpgrade } from "./upgrades"

export const Furnace = {
  charcoal: {
    get base() {
      let x = D(1e6)

      x = x.mul(Effect.effect("upg-A\\5"))

      return x
    },

    get require() { return Decimal.pow(10, player.furnace.charcoal).mul(this.base) },
    get bulk() { return Decimal.div(player.root.total, this.base).log(10).floor().add(1) },
  },

  coal: {
    get base() {
      let x = DC.D1

      x = x.mul(Effect.effect("upg-A\\6")).mul(Effect.effect("upg-A\\7"))

      return x
    },

    get require() { return Decimal.pow(10, simpleCost(Decimal.add(player.furnace.coal, 2), "P", 1)).mul(this.base) },
    get bulk() { return simpleCost((Decimal.div(player.furnace.ash, this.base).max(1).log10()), "PI", 1).floor().sub(1) },
  },

  setup() {
    new Effect({
      id: "charcoal-boost",
      type: EffectType.Multiplier,
      static: false,
      group: ["heat","ash"],
      calc: () => Decimal.pow(5, player.furnace.charcoal).pow(Effect.effect("upg-RO\\50")),
    })

    new Effect({
      id: "coal-boost-1",
      type: EffectType.Multiplier,
      static: false,
      group: "ash",
      calc: () => Decimal.pow(10, player.furnace.coal).pow(Effect.effect("upg-RO\\50")),
    })
    new Effect({
      id: "coal-boost-2",
      type: EffectType.Multiplier,
      static: false,
      group: "roots",
      calc: () => Decimal.pow(1.1, player.furnace.coal).pow(hasUpgrade("RO\\42") ? 2 : 1),
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
