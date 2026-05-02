import type { DecimalSource } from "break_eternity.js"
import { Currencies } from "./currencies"
import { FPS, player, temp } from "@/main"
import Decimal from "break_eternity.js"
import { BigUpgradeGroups, BigUpgrades } from "./big_upgrades"
import { DC } from "@/utils/decimal"
import { Effect } from "@/utils/effect"

export const FallenLeaves = {
  resources: [
    {
      name: "Fallen Leaves",
      ratio: 1,
    },{
      name: "Bronze Leaves",
      get ratio() { return Decimal.mul(100, Effect.effect("bupg-fallen-1\\3")) },
    },{
      name: "Silver Leaves",
      get ratio() { return Decimal.mul(100, Effect.effect("bupg-fallen-2\\3")) },
    },{
      name: "Golden Leaves",
      get ratio() { return Decimal.mul(1000, Effect.effect("bupg-fallen-3\\3")) },
    },{
      name: "Platinum Leaves",
      get ratio() { return Decimal.mul(10000, Effect.effect("bupg-fallen-4\\3")) },
    },{
      name: "Diamond Leaves",
      get ratio() { return Decimal.mul(1e6, Effect.effect("bupg-fallen-5\\3")) },
    },{
      name: "True Autumn Leaves",
      get ratio() { return Decimal.mul(1e10, Effect.effect("bupg-fallen-6\\3")) },
    },
  ] as {
    name: string,
    ratio: DecimalSource,
  }[],

  get nextType() {
    let x = DC.D1

    for (let i = 1; i < FallenLeaves.resources.length; i++) {
      x = x.mul(this.resources[i].ratio)
      if (!player.first.fallen[i]) break;
    }

    return x
  },

  calculate_ratio(type: number) {
    let x = DC.D1

    for (let i = 0; i < type + 1; i++) x = x.mul(this.resources[i].ratio);

    return x
  },

  setup() {
    for (let i = 0; i < FallenLeaves.resources.length; i++) {
      const F = this.resources[i], id = 'fallen-'+i

      Currencies[id] = {
        name: F.name,

        get amount() { return player.fallen[i] },
        set amount(v) { player.fallen[i] = Decimal.max(v, 0) },

        get gain() {
          const ratio = FallenLeaves.calculate_ratio(i)

          if (!player.first.fallen[i] || Decimal.lt(temp.basket_cap, ratio)) return 0;

          const x = Effect.calculateEffects("fallen-"+i)

          return Decimal.mul(temp.basket_cap, FPS).min(temp.fallen_speed).div(ratio).mul(x)
        },

        passive: 1,
      }

      for (const j of BigUpgradeGroups[id]) {
        const U = BigUpgrades[j]

        U.unl = () => true // player.first.fallen[i]
        U.cost[0] = id
      }
    }
  },
}
