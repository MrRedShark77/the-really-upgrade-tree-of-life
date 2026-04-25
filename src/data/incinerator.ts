import { player } from "@/main";
import { DC } from "@/utils/decimal";
import { Effect, EffectType } from "@/utils/effect";
import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";
import { hasUpgrade } from "./upgrades";

export const Incinerator = {
  levels: [
    [() => true, x => Decimal.pow(x, 1.25).mul(-8).pow10(), 'fruits'],
    [() => hasUpgrade("RO\\29"), x => Decimal.pow(x, 1.25).mul(-20).pow10(), 'seeds'],
    [() => false, x => Decimal.pow(x, 1.25).mul(-35).pow10(), 'leaves'],
  ] as [
    () => boolean,
    (x: DecimalSource) => DecimalSource,
    string,
  ][],

  get limit() { return Decimal.add(5, Effect.effect("upg-RO\\28")) },

  total_level(current = false) {
    let x = DC.D0
    for (let i = 0; i < this.levels.length; i++) x = x.add(player.incinerator[i][+current]);
    return x
  },

  entropy_boost: (lvl: DecimalSource) => Decimal.pow(10, lvl),

  setup() {
    for (let i = 0; i < this.levels.length; i++) {
      const L = this.levels[i]

      new Effect({
        id: "inc-nerf-"+i,
        type: EffectType.Multiplier,
        static: false,
        group: L[2],
        calc: () => L[1](player.incinerator[i][1]),
      })
    }

    new Effect({
      id: "inc-boost",
      type: EffectType.Multiplier,
      static: false,
      group: 'entropy',
      calc: () => this.entropy_boost(Incinerator.total_level(true)),
    })
  },
}
