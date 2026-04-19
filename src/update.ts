import type { DecimalSource } from "break_eternity.js";
import { Currencies, type Currency } from "./data/currencies";
import { player, state, temp } from "./main";
import { Effect } from "./utils/effect";
import { deepAssign } from "./utils/saveload";
import Decimal from "break_eternity.js";
import { hasUpgrade, UpgradeKeys } from "./data/upgrades";
import { Composter } from "./data/composter";
import { Cell } from "./data/cell";
import { Bacteria } from "./data/bacteria";
import { Auto, AutoKeys } from "./data/automation";
import { Weathers } from "./data/weather";
import { scale } from "./utils/decimal";

// Calculation

let diff = 0;

export function loop() {
  // requestAnimationFrame(loop)

  diff = Date.now() - player.lastPlayed;
  calc(diff/1000 * 10 ** state.dev_speed);

  updateTemp()

  player.lastPlayed = Date.now() // player.lastPlayed
}

export function calc(dt: number) {
  for (let i = 0; i < 3; i++) {
    const P = player.composter[i]

    if (!P.active) continue;

    if ((P.time = Decimal.mul(temp.compostingSpeed, dt).add(P.time)).gte(Composter.calculateTimeRequired(P.fertilizers))) {
      P.time = 0;
      P.active = false;

      P.fertilizers = Decimal.add(P.fertilizers, 1)
      if (hasUpgrade("E\\21")) P.fertilizers = P.fertilizers.max(Composter.calculateFeritizerBulk(i, Currencies[Composter.fertilizers[i].cost[0] as Currency].amount));
    }
  }

  if (hasUpgrade('L\\28')) {
    const L = Decimal.max(player.leaves, 1), S = Decimal.max(player.seeds, 1), F = Decimal.max(player.fruits, 1)

    let LR = 12, SR = 4

    if (hasUpgrade("L\\29")) LR -= 2.5;

    if (hasUpgrade("S\\25")) SR -= 1.5;

    player.PE = L.root(LR).mul(S.root(SR)).mul(F)
  } else player.PE = 0;

  if (hasUpgrade("E\\1")) {
    player.cell.amount = Cell.calc(dt);
    player.auto.total = scale(Decimal.max(player.cell.amount, 1).log(1e12).sub(1), 100, 2, "L", true).floor().add(1).max(player.auto.total);
  }

  const L = Bacteria.limit
  if (Decimal.gte(player.bacteria.types, 1) && Decimal.lt(player.bacteria.amount, L)) player.bacteria.amount = Decimal.mul(dt, Bacteria.speed).pow_base(2).mul(player.bacteria.amount).min(L);

  for (const i in Currencies) {
    const C = Currencies[i as Currency]
    C.amount = Decimal.mul(C.gain, C.passive).mul(dt).add(C.amount)
  }

  for (const i of AutoKeys) {
    const A = Auto[i]
    if (A.condition() && player.auto.enabled[i]) A.tick?.();
  }

  state.time += dt
}

// Temp

export type TempData = {
  purchasedUpgrades: number

  total_fertilizers: DecimalSource

  currencies: Record<string, DecimalSource>;
  effects: Record<string, DecimalSource>;

  compostingSpeed: DecimalSource;

  scaled_fertilizers: [DecimalSource, DecimalSource, DecimalSource][];
  cell_overflow: [DecimalSource, DecimalSource][];

  weathers: DecimalSource[]

  [index: string]: unknown;
}

export function getTempData(): TempData {
  const T: TempData = {
    purchasedUpgrades: 0,

    total_fertilizers: 0,

    currencies: {},
    effects: {},

    scaled_fertilizers: [
      [15, 2, 1],
      [100, 2, 1],
    ],

    cell_overflow: [
      [20, 2],
      [320, 6],
    ],

    compostingSpeed: 1,

    weathers: [],
  };

  for (const i in Currencies) T.currencies[i] = 0;

  for (let i = 0; i < 4; i++) T.weathers[i] = 1;

  return T
}

export function resetTemp() {
  deepAssign(temp, getTempData())
  updateTemp()
}

export function updateTemp() {
  temp.purchasedUpgrades = 0
  for (const id of UpgradeKeys) temp.purchasedUpgrades += +hasUpgrade(id);

  temp.total_fertilizers = Decimal.add(Composter.totalFertilizers, Composter.effectiveFertilizers)

  for (let i = 0; i < 4; i++) {
    const W = Weathers.ctn[i]
    if (!W) continue;
    temp.weathers[i] = Decimal.gte(player.weather.best[i][0], W.goal[0]) ? W.reward[0](player.weather.best[i][0]) : 1
  }

  Effect.updateEffects()

  temp.scaled_fertilizers = [
    [Decimal.add(15, Effect.effect("upg-E\\10")).add(Bacteria.effect(1)), 2, 1],
    [Weathers.in(1) ? 6 : 100, 2, Decimal.mul(Weathers.nerf(1), Effect.effect("upg-E\\29")).mul(Effect.effect("upg-E\\38"))],
  ]

  temp.cell_overflow = [
    [20, 2],
    [320, hasUpgrade("E\\23") ? 5 : 6],
  ]

  temp.compostingSpeed = Effect.calculateEffects("composting-speed")

  for (const i in Currencies) temp.currencies[i] = Currencies[i as Currency].gain;
}
