import { player } from "@/main";
import { DC, scale } from "@/utils/decimal";
import { Effect, EffectType } from "@/utils/effect";
import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";
import { hasUpgrade } from "./upgrades";
import { Seasons } from "./challenges";

function I_NERF_EXP(x: DecimalSource): Decimal {
  return scale(x,30,2,'P').pow(hasUpgrade("RO\\41") ? 1.2 : 1.25)
}

export const Incinerator = {
  levels: [
    [() => true, x => I_NERF_EXP(x).mul(-8).pow10(), 'fruits'],
    [() => hasUpgrade("RO\\29"), x => I_NERF_EXP(x).mul(-20).pow10(), 'seeds'],
    [() => hasUpgrade("RO\\40"), x => I_NERF_EXP(x).mul(-35).pow10(), 'leaves'],
  ] as [
    () => boolean,
    (x: DecimalSource) => DecimalSource,
    string,
  ][],

  get limit() {
    const x = Decimal.add(5, Effect.effect("upg-RO\\28")).add(Effect.effect("upg-RO\\38"))

    return x.round()
  },

  total_level(current = false) {
    if (current && Seasons.in(2)) return 0

    let x = DC.D0
    for (let i = 0; i < this.levels.length; i++) x = x.add(player.incinerator[i][+current]);
    return x
  },

  entropy_boost: (lvl: DecimalSource) => Decimal.pow(10, lvl).pow(Effect.effect("bupg-fallen-3\\2")),

  setup() {
    for (let i = 0; i < this.levels.length; i++) {
      const L = this.levels[i]

      new Effect({
        active: () => !Seasons.in(2),
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
