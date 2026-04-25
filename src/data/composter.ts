import { player, temp } from "@/main"
import { advanced_scale, DC } from "@/utils/decimal"
import { Effect, EffectType } from "@/utils/effect";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { hasUpgrade } from "./upgrades";
import { Currencies, Currency } from "./currencies";
import { Bacteria } from "./bacteria";
import { getBigUpgradeEffect } from "./big_upgrades";
import { Seasons, Weathers } from "./challenges";

export const Composter = {
  get freeFertilizers(): DecimalSource[] {
    const x = [DC.D0,DC.D0,DC.D0,DC.D0]
    if (Weathers.in(1)) return x;
    const B = getBigUpgradeEffect('bacteria\\1')
    for (let i = 0; i < 4; i++) x[i] = x[i].add(B).add(Effect.calculateEffects('fertilizers-'+i, 0));
    return x
  },

  get totalFertilizers(): DecimalSource {
    let x = DC.D0
    const y = temp.free_fertilizers
    for (let i = 0; i < 4; i++) if (this.fertilizers[i].unl()) x = x.add(player.composter[i].fertilizers).add(y[i]);
    return x
  },

  get effectiveFertilizers(): DecimalSource {
    return DC.D0
  },

  get entropyBoost(): DecimalSource {
    if (!this.fertilizers[3].unl()) return 0;
    return Decimal.add(player.composter[3].fertilizers, temp.free_fertilizers[3]).root(2).mul(.01)
  },

  get fertilizerBase(): DecimalSource {
    if (Seasons.in(0)) return 1;
    return Decimal.add(1.5, Bacteria.effect(0)).add(this.entropyBoost)
  },

  fertilizers: [
    {
      name: "The Leaf Composter",
      unl: () => hasUpgrade("F\\1"),
      get cost () { return ["leaves", Decimal.div(1e6, hasUpgrade("L\\35") ? 15 : 1).div(hasUpgrade("L\\39") ? 50 : 1)] },
    },{
      name: "The Seed Composter",
      unl: () => hasUpgrade("F\\2"),
      get cost () { return ["seeds", Decimal.div(100, hasUpgrade("S\\30") ? 3 : 1)] },
    },{
      name: "The Fruit Composter",
      unl: () => hasUpgrade("F\\6"),
      cost: ["fruits", 2],
    },{
      name: "The Entropy Composter",
      unl: () => hasUpgrade("RO\\3"),
      cost: ["entropy", 10],
    },
  ] as {
    name: string,
    unl(): boolean,
    cost: [string, DecimalSource],
  }[],

  calculateFeritizerCost(i: number, x: DecimalSource): DecimalSource {
    let y = advanced_scale(advanced_scale(x, ...temp.scaled_fertilizers[1], "ME2"), ...temp.scaled_fertilizers[0], "P")

    y = y.pow_base(this.fertilizers[i].cost[1])

    if (i < 3) y = y.mul(Effect.effect("upg-E\\48"));

    return y
  },
  calculateTimeRequired(x: DecimalSource) { return Decimal.pow(2, x).mul(.5) },

  // It triggers if composter is done in one tick.
  calculateFeritizerBulk(i: number, x: DecimalSource): DecimalSource {
    if (Decimal.lt(x, 1)) return 0;

    let y1 = Decimal.max(x, 1)

    if (i < 3) y1 = y1.div(Effect.effect("upg-E\\48"));

    y1 = y1.log(this.fertilizers[i].cost[1])

    y1 = advanced_scale(y1, ...temp.scaled_fertilizers[0], "P", true)
    y1 = advanced_scale(y1, ...temp.scaled_fertilizers[1], "ME2", true)

    y1 = y1.floor().add(1)

    let y2 = Decimal.div(temp.compostingSpeed, .5).log(2)

    y2 = y2.floor().add(1)

    return y1.min(y2)
  },

  compost(i: number, no_spend = false) {
    const P = player.composter[i], F = this.fertilizers[i], C = Currencies[F.cost[0] as Currency]
    let cost

    if (P.active || !F.unl() || Decimal.lt(C.amount, cost = this.calculateFeritizerCost(i, P.fertilizers))) return;

    P.active = true
    P.time = 0

    if (!no_spend) C.amount = Decimal.sub(C.amount, cost);
  },

  setup() {
    new Effect({
      type: EffectType.Multiplier,
      id: "fertilizers",
      static: false,
      group: "age",
      calc: () => Decimal.pow(Composter.fertilizerBase, temp.total_fertilizers),
    })
  }
}
