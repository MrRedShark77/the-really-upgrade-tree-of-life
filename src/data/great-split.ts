import { player, temp } from "@/main"
import { expPow, scale, simpleCost, sumBase } from "@/utils/decimal"
import { Effect, EffectType } from "@/utils/effect"
import { formatMult, formatPow } from "@/utils/formats"
import Decimal, { type DecimalSource } from "break_eternity.js"
import { hasUpgrade } from "./upgrades"

export const Flower = {
  level: {
    get require() { return simpleCost(scale(player.flower.level, 30, 2, "P"), "E", 100, 2) },
    get bulk() { return scale(simpleCost(player.flower.exp, "EI", 100, 2), 30, 2, "P", true).floor().add(1) },
  },
}

export const Radiation = {
  get cap() { return Decimal.mul(1e3, this.isotope_boosts[1](player.radiation.isotopes[0][1], 0)) },

  get exp() { return Decimal.mul(player.radiation.cleaned, temp.radiation.cleaning_exp).add(player.radiation.cleaning_exp) },

  isotopes: [
    {
      name: "Uranium-234",
      half_life: [600,1.5],
    },{
      name: "Uranium-235",
      half_life: [18000,6],
    },{
      name: "Uranium-238",
      half_life: [1e12,1e3],
    },{
      name: "Radium-226",
      half_life: [1e51,1e15],
    },{
      name: "Radium-228",
      half_life: [1e250,1e110],
    },{
      name: "Plutonium-238",
      half_life: ['e1375','e600'],
    },
  ] as {
    name: string,
    half_life: [DecimalSource, DecimalSource],
  }[],

  isotope_boosts: [
    (x,i) => {
      let y = Decimal.mul(x, .25).add(1)
      if (hasUpgrade("L\\-21")) y = y.pow(i+1);
      return y
    },
    (x,i) => i === 0 ? Decimal.pow(2, x) : Decimal.mul(x, 5),
  ] as ((x: DecimalSource, i: number) => DecimalSource)[],

  tiers: [
    {
      name: "Level",
      requirement: [x => sumBase(Decimal.add(x, 1), 2).mul(1e3), x => sumBase(Decimal.div(x, 1e3), 2, true).floor(), x => Decimal.pow(2, x).mul(1e3)],
      boost: [
        [x => Decimal.pow(1.75, x), formatMult, 'Cleaning Power'],
        [x => Decimal.root(x, 2).div(4).add(1), x => formatPow(x, 3), 'static Seed multiplier'],
      ],
    },{
      name: "Rank",
      requirement: [x => Decimal.mul(x,10).add(25), x => Decimal.sub(x,25).div(10).floor().add(1), x => Decimal.gte(x,1) ? 10 : 25],
      boost: [
        [x => Decimal.pow(10, x), formatMult, 'Cleaning Power'],
        [x => Decimal.pow(3, x), formatMult, 'Beneficial Viruses'],
      ],
    },{
      name: "Tier",
      requirement: [x => Decimal.mul(x,10).add(25), x => Decimal.sub(x,25).div(10).floor().add(1), x => Decimal.gte(x,1) ? 10 : 25],
      boost: [
        [x => Decimal.pow(1e4, x), formatMult, 'Cleaning EXP'],
        [x => Decimal.pow(2, x), formatMult, 'Sacred Leaves'],
      ],
    },{
      name: "Class",
      requirement: [x => simpleCost(x, "P", 25, 5), x => simpleCost(x, "PI", 25, 5).floor().add(1), x => Decimal.mul(x, 5).add(25)],
      boost: [
        [x => Decimal.pow(1e12, x), formatMult, 'Cleaning EXP'],
        [x => Decimal.pow(1e9, x), formatMult, 'Flowers'],
      ],
    },/*{
      name: "Tetr",
      requirement: [x => simpleCost(x, "E", 100, 1.1).floor(), x => simpleCost(x, "EI", 100, 1.1).floor().add(1)],
    },*/
  ] as {
    name: string,
    requirement: [(x: DecimalSource) => DecimalSource, (x: DecimalSource) => DecimalSource, (x: DecimalSource) => DecimalSource],
    boost: [(x: DecimalSource) => DecimalSource, (x: DecimalSource) => string, string][],
  }[],
}

function getTierBoost(i: number, j: number) { return Radiation.tiers[i].boost[j][0](player.radiation.tiers[i]) }

export function setupGreatSplit() {
  new Effect({
    id: "floral-level-boost",
    type: EffectType.Multiplier,
    static: true,
    group: "flowers",
    calc: () => Decimal.pow(2, player.flower.level),
  })

  new Effect({
    id: "pollen",
    group: "pollen",
    static: false,
    type: EffectType.Base,
    calc: () => Decimal.sub(player.flower.level, 10).pow_base(1.4).mul(5)
  })

  new Effect({
    id: "radiation-boost",
    group: "cleaning-exp",
    static: false,
    type: EffectType.Multiplier,
    calc: () => Decimal.add(player.radiation.cleaned, 10).log10().pow(2),
  })
  new Effect({
    id: "decay-boost",
    group: "decay-speed",
    static: false,
    type: EffectType.Multiplier,
    calc: () => Decimal.add(player.radiation.cleaning_power, 1).root(4),
  })
  new Effect({
    id: "roots-cp-boost",
    group: "cleaning-power",
    static: false,
    type: EffectType.Multiplier,
    calc: () => expPow(Decimal.div(player.root.amount, 1e45).add(1), .25),
  })

  new Effect({
    id: "c-tiers-0-0",
    group: "cleaning-power",
    static: false,
    type: EffectType.Multiplier,
    calc: () => getTierBoost(0,0),
  })
  new Effect({
    id: "c-tiers-0-1",
    group: "seeds",
    static: false,
    type: EffectType.BaseExponent,
    calc: () => getTierBoost(0,1),
  })

  new Effect({
    id: "c-tiers-1-0",
    group: "cleaning-power",
    static: false,
    type: EffectType.Multiplier,
    calc: () => getTierBoost(1,0),
  })
  new Effect({
    id: "c-tiers-1-1",
    group: "BV",
    static: false,
    type: EffectType.Multiplier,
    calc: () => getTierBoost(1,1),
  })

  new Effect({
    id: "c-tiers-2-0",
    group: "cleaning-exp",
    static: false,
    type: EffectType.Multiplier,
    calc: () => getTierBoost(2,0),
  })
  new Effect({
    id: "c-tiers-2-1",
    group: "sacred",
    static: false,
    type: EffectType.Multiplier,
    calc: () => getTierBoost(2,1),
  })

  new Effect({
    id: "c-tiers-3-0",
    group: "cleaning-exp",
    static: false,
    type: EffectType.Multiplier,
    calc: () => getTierBoost(3,0),
  })
  new Effect({
    id: "c-tiers-3-1",
    group: "flowers",
    static: false,
    type: EffectType.Multiplier,
    calc: () => getTierBoost(3,1),
  })

  for (let i = 0; i < Radiation.isotopes.length; i++) {
    new Effect({
      id: "isotope-boost-"+i,
      group: "cleaning-exp",
      static: false,
      type: EffectType.Multiplier,
      calc: () => Radiation.isotope_boosts[0](player.radiation.isotopes[i][1], i),
    })
  }

  new Effect({
    id: "leaf-tier-boost",
    group: ['fallen-0','fallen-1','fallen-2','fallen-3','fallen-4','fallen-5','fallen-6'],
    static: false,
    type: EffectType.Multiplier,
    calc: () => Decimal.pow(10, player.leaf_tier),
  })
}
