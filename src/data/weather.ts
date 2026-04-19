import { player, temp } from "@/main"
import { format, formatMult, formatPercent, formatPow } from "@/utils/formats"
import type { DecimalSource } from "break_eternity.js"
import Decimal from "break_eternity.js"
import { Resets } from "./resets"
import { Effect, EffectType } from "@/utils/effect"
import { DC, softcap } from "@/utils/decimal"

export const Weathers = {
  enter(x: number) {
    const A = player.weather.active

    if (A > -1) {
      const C = this.ctn[A], P = player.weather.best[A], G = C.goal_intensity(P[1])

      P[0] = Decimal.max(P[0], C.amount).min(G)
    }

    player.weather.active = x === A ? -1 : x

    Resets.entropy.reset()
  },

  is_completed(x: number) { return Decimal.gte(player.weather.best[x][0], this.ctn[x]?.goal[0] ?? DC.DINF) },
  in(x: number) { return player.weather.active === x },
  nerf(x: number, def: DecimalSource = 1): DecimalSource { return this.in(x) ? this.ctn[x].nerf[0](player.weather.best[x][1]) : def },

  ctn: [
    {
      name: "Storm",
      nerf: [
        x => Decimal.pow(.75, x),
        x => `The exponent of Leaves, Seeds, and Fruits is reduced by <b>${formatMult(x,2,true,.1)}</b>.`
      ],
      reward: [
        x => Decimal.add(player.bacteria.amount, 1).log(2.5).pow(3.7).pow(Decimal.div(x, 1e40).add(1).log(1e3).root(2).mul(.45).add(1)),
        x => `Unlock <b>Auto-Composting</b>, and Bacteria boosts Leaves by <b>${formatMult(x)}</b>.`
      ],

      get amount() { return player.seeds },
      goal: [1e45, x => `${format(x)} Seeds`],

      goal_intensity: x => Decimal.pow(1e300, x),
    },{
      name: "Burning Days",
      nerf: [
        x => Decimal.sub(x, 1).pow_base(2).mul(.3).add(1),
        x => `Superscaled Fertilizers always start at <b>6</b> and are <b>${formatPercent(Decimal.sub(x,1))}</b> stronger, and bonus Fertilizers are disabled.`
      ],
      reward: [
        x => softcap(Decimal.add(player.entropy, 1).log(100).pow(.9).mul(.08).mul(Decimal.sub(x, 25).div(25).max(0).pow(.68)).add(1), 2, .5, "P"),
        x => `Passively generate <b>100%</b> of your pending Seeds, and Entropy boosts <b>L10</b>, <b>S8</b>, and <b>E4</b> by <b>${formatPow(x,3)}</b>.`
      ],

      get amount() { return temp.total_fertilizers },
      goal: [50, x => `${format(x)} Fertilizers`],

      goal_intensity: x => Decimal.mul(15, x).add(55),
    },{
      name: "Drought",
      nerf: [
        x => Decimal.pow(.1, x),
        x => `Leaves and Tree aging speed are rooted by <b>${format(Decimal.pow(x,-1))}</b>.`
      ],
      reward: [
        x => softcap(Decimal.add(player.age, 1).log(1e15).pow(.85).mul(.1).mul(Decimal.div(x, 1e22).add(1).log10().pow(.4)).add(1), 5, .5, "P"),
        x => `Tree age boosts <b>L40</b> and <b>S28</b> by <b>${formatPow(x,3)}</b>.`
      ],

      get amount() { return player.fruits },
      goal: [1e24, x => `${format(x)} Fruits`],

      goal_intensity: x => Decimal.pow(1e48, x),
    },{
      name: "Snowfall",
      nerf: [
        () => -4,
        x => `Static Leaf, Tree aging speed, Seed, and Fruit multipliers are powered by <b>${formatPow(x)}</b>.`
      ],
      reward: [
        x => softcap(Decimal.add(player.entropy, 1).log(100).pow(.525).mul(.05).mul(Decimal.div(x, 1e86).add(1).log10().div(10).pow(.1)).add(1), 2, 1, "LOG"),
        x => `Entropy boosts <b>L3</b>, <b>L8</b>, and <b>L15</b> by <b>${formatPow(x,3)}</b>.`
      ],

      get amount() { return player.leaves },
      goal: [1e90, x => `${format(x)} Leaves`],

      goal_intensity: () => '1e600',
    },
  ] as {
    name: string
    nerf: [(x: DecimalSource) => DecimalSource, (x: DecimalSource) => string]
    reward: [(x: DecimalSource) => DecimalSource, (x: DecimalSource) => string]
    goal: [DecimalSource, (x: DecimalSource) => string]
    amount: DecimalSource
    goal_intensity(x: DecimalSource): DecimalSource
  }[],

  setup() {
    new Effect({
      active: () => player.weather.active === 0,
      type: EffectType.Exponent,
      static: false,
      id: "C1-nerf",
      group: ['leaves','seeds','fruits'],
      calc: () => this.ctn[0].nerf[0](player.weather.best[0][1])
    })

    new Effect({
      type: EffectType.Multiplier,
      static: false,
      id: "C1-reward",
      group: 'leaves',
      calc: () => temp.weathers[0]
    })

    new Effect({
      active: () => player.weather.active === 2,
      type: EffectType.Exponent,
      static: false,
      id: "C3-nerf",
      group: ['leaves','age'],
      calc: () => this.ctn[2].nerf[0](player.weather.best[2][1])
    })

    new Effect({
      active: () => player.weather.active === 3,
      type: EffectType.BaseExponent,
      static: true,
      id: "C4-nerf",
      group: ['age','seeds','fruits'],
      calc: () => this.ctn[3].nerf[0](player.weather.best[3][1])
    })
    new Effect({
      active: () => player.weather.active === 3,
      type: EffectType.BaseExponent,
      static: true,
      id: "C4-nerf",
      group: 'leaves',
      calc: () => Decimal.div(this.ctn[3].nerf[0](player.weather.best[3][1]), 1.5)
    })

    new Effect({
      type: EffectType.Multiplier,
      static: false,
      id: "weather-reward",
      group: 'entropy',
      calc: () => {
        let x = 0;
        for (let i = 0; i < 4; i++) if (this.is_completed(i)) x++;
        return Decimal.pow(2,x)
      },
    })
  },
}
