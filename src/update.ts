import type { DecimalSource } from "break_eternity.js";
import { Currencies } from "./data/currencies";
import { player, state, temp } from "./main";
import { Effect } from "./utils/effect";
import { deepAssign } from "./utils/saveload";
import Decimal from "break_eternity.js";
import { hasUpgrade, UpgradeKeys } from "./data/upgrades";
import { Composter } from "./data/composter";
import { Cell, Virus } from "./data/cell";
import { Bacteria } from "./data/bacteria";
import { Auto, AutoKeys } from "./data/automation";
import { Seasons, Weathers } from "./data/challenges";
import { DC, scale, sumBase } from "./utils/decimal";
import { Furnace } from "./data/furnace";
import { FallenLeaves } from "./data/fallen";
import { Flower, Radiation } from "./data/great-split";

// Calculation

let diff = 0, date = Date.now();

export function loop() {
  // requestAnimationFrame(loop)

  diff = Date.now() - player.lastPlayed;
  calc(diff/1000 * 10 ** state.dev_speed);

  updateTemp()

  player.lastPlayed = Date.now() // player.lastPlayed
}

export function calc(dt: number) {
  for (let i = 0; i < 4; i++) {
    const P = player.composter[i]

    if (!Composter.fertilizers[i].unl()) {
      P.active = false;
      P.time = 0
    }

    if (!P.active) continue;

    if ((P.time = Decimal.mul(temp.compostingSpeed, dt).add(P.time)).gte(Composter.calculateTimeRequired(P.fertilizers))) {
      P.time = 0;
      P.active = false;

      P.fertilizers = Decimal.add(P.fertilizers, 1)
      if (hasUpgrade("E\\21")) P.fertilizers = P.fertilizers.max(Composter.calculateFeritizerBulk(i, Currencies[Composter.fertilizers[i].cost[0]].amount));
    }
  }

  if (hasUpgrade('L\\28')) {
    const L = Decimal.max(player.leaves, 0), S = Decimal.max(player.seeds, 0), F = Decimal.max(player.fruits, 0)

    let LR = 12, SR = 4

    if (hasUpgrade("L\\29")) LR -= 2.5;

    if (hasUpgrade("S\\25")) SR -= 1.5;

    player.PE = Effect.calculateEffects('PE', L.root(LR).mul(S.root(SR)).mul(F))
  } else player.PE = 0;

  if (hasUpgrade("E\\1")) {
    player.cell.amount = Cell.calc(dt);
    player.auto.total = scale(scale(scale(Decimal.max(player.cell.amount, 1).log(1e12).sub(1), 100, 2, "L", true), 400, 2, "P", true), 1000, 2, "ME2", true).floor().add(1).max(player.auto.total);

    if (hasUpgrade("RO\\M8") && Decimal.gte(player.cell.amount, Cell.cap)) player.bacteria.types = Decimal.add(player.bacteria.types, 1).max(Bacteria.BacteriaTypeBulk);
  }

  const L = Bacteria.limit
  if (Decimal.gte(player.bacteria.types, 1) && Decimal.lt(player.bacteria.amount, L)) player.bacteria.amount = Decimal.mul(dt, Bacteria.speed).pow_base(2).mul(player.bacteria.amount).min(L);

  if (hasUpgrade("RO\\35")) {
    if (Decimal.gte(player.root.total, Furnace.charcoal.require)) player.furnace.charcoal = Decimal.add(player.furnace.charcoal, 1).max(Furnace.charcoal.bulk);
    if (Decimal.gte(player.furnace.ash, Furnace.coal.require)) player.furnace.coal = Decimal.add(player.furnace.coal, 1).max(Furnace.coal.bulk);
  }

  if (player.first.season[1]) {
    let r = DC.D1

    if (!player.first.fallen[FallenLeaves.resources.length-1]) for (let i = 0; i < FallenLeaves.resources.length; i++) {
      r = r.mul(FallenLeaves.resources[i].ratio)
      if (!player.first.fallen[i] && r.lte(temp.basket_cap)) player.first.fallen[i] = true;
    }

    if (Decimal.gte(temp.basket_cap, FallenLeaves.tier.requirement)) player.leaf_tier = Decimal.add(player.leaf_tier, 1).max(FallenLeaves.tier.amount);
  }

  if (Seasons.in(2) || Decimal.gte(player.season.best[2][0], 'e1200')) player.virus = Virus.calc(dt);

  if (Decimal.gte(player.virus, 'ee5')) player.first.beneficial_virus = true;

  for (const i in Currencies) {
    const C = Currencies[i]
    C.amount = Decimal.mul(C.gain, C.passive).mul(dt).add(C.amount)
  }

  if (hasUpgrade("RO\\61") && Decimal.gte(player.flower.exp, Flower.level.require)) player.flower.level = Decimal.add(player.flower.level, 1).max(Flower.level.bulk);

  if (hasUpgrade("RO\\60")) {
    player.radiation.cleaning_power = Decimal.mul(temp.radiation.cleaning_power, dt).add(player.radiation.cleaning_power)

    if (hasUpgrade("FA\\14")) player.radiation.cleaning_exp = Decimal.mul(temp.radiation.cleaning_exp, Radiation.cap).mul(dt).add(player.radiation.cleaning_exp);

    let cap: DecimalSource = 0;

    for (let i = Radiation.isotopes.length-1; i >= 0; i--) {
      const R = Radiation.isotopes[i], A = player.radiation.isotopes[i][1]
      cap = Decimal.mul(player.radiation.isotopes[i+1]?.[1] ?? 0, 5).add(10)

      if (Decimal.lt(A, cap)) {
        const X = player.radiation.isotopes[i][0] = Decimal.mul(temp.radiation.decaying_speed, dt).add(player.radiation.isotopes[i][0]).min(sumBase(cap, R.half_life[1]).mul(R.half_life[0]));
        if (sumBase(Decimal.add(A, 1), R.half_life[1]).mul(R.half_life[0]).lte(X)) {
          player.radiation.isotopes[i][1] = sumBase(Decimal.div(X, R.half_life[0]), R.half_life[1], true).floor().clamp(Decimal.add(A, 1), cap)
        }
      }
    }

    cap = Radiation.cap

    if (Decimal.lt(player.radiation.cleaned, cap)) player.radiation.cleaned = Decimal.mul(player.radiation.cleaning_power, dt).add(player.radiation.cleaned).min(cap);

    for (let i = 0; i < Radiation.tiers.length; i++) {
      const T = Radiation.tiers[i], L = player.radiation.tiers[i], C = i === 0 ? Radiation.exp : player.radiation.tiers[i-1];

      if (Decimal.gte(C, T.requirement[0](L))) player.radiation.tiers[i] = Decimal.add(L, 1).max(T.requirement[1](C));
    }
  }

  if (hasUpgrade("FA\\8")) player.root.total = Decimal.mul(temp.currencies.roots, Currencies.roots.passive).mul(dt).add(player.root.total);

  for (const i of AutoKeys) {
    const A = Auto[i]
    if (A.condition() && player.auto.enabled[i]) A.tick?.(dt);
  }

  state.time += dt
  player.timePlayed += dt
}

// Temp

export type TempData = {
  purchasedUpgrades: number

  free_fertilizers: DecimalSource[]
  total_fertilizers: DecimalSource

  currencies: Record<string, DecimalSource>;
  effects: Record<string, DecimalSource>;

  bacteria_limit: DecimalSource;
  compostingSpeed: DecimalSource;

  scaled_fertilizers: [DecimalSource, DecimalSource, DecimalSource][];
  cell_overflow: [DecimalSource, DecimalSource][];

  weathers: DecimalSource[]

  fallen_speed: DecimalSource
  basket_cap: DecimalSource

  virus_mult: DecimalSource

  floral_exp_mult: DecimalSource

  radiation: {
    cleaning_power: DecimalSource,
    decaying_speed: DecimalSource,
    cleaning_exp: DecimalSource,
  },

  [index: string]: unknown;
}

export function getTempData(): TempData {
  const T: TempData = {
    purchasedUpgrades: 0,

    free_fertilizers: [0,0,0,0],
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

    bacteria_limit: 0,
    compostingSpeed: 1,

    fallen_speed: 2,
    basket_cap: 25,

    virus_mult: 1,

    floral_exp_mult: 1,

    radiation: {
      cleaning_power: 1,
      decaying_speed: 1,
      cleaning_exp: 1,
    },

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

  temp.free_fertilizers = Composter.freeFertilizers
  temp.total_fertilizers = Decimal.add(Composter.totalFertilizers, Composter.effectiveFertilizers)

  for (let i = 0; i < 4; i++) {
    const W = Weathers.ctn[i]
    if (!W) continue;
    temp.weathers[i] = Decimal.gte(player.weather.best[i][0], W.goal[0]) ? W.reward[0](player.weather.best[i][0]) : 1
  }

  Effect.updateEffects()

  temp.bacteria_limit = Bacteria.limit

  temp.scaled_fertilizers = [
    [Decimal.add(15, Effect.effect("upg-E\\10")).add(Bacteria.effect(1)), 2, 1],
    [Weathers.in(1) ? 6 : Decimal.add(100, Effect.effect("upg-RO\\8")).add(Effect.effect("upg-RO\\36")).add(Effect.effect("bupg-BV\\1")), 2, Decimal.mul(Weathers.nerf(1), Effect.effect("upg-E\\29")).mul(Effect.effect("upg-E\\38"))],
  ]

  temp.cell_overflow = [
    [20, 2],
    [320, hasUpgrade("E\\23") ? 5 : 6],
  ]

  temp.compostingSpeed = Effect.calculateEffects("composting-speed")

  temp.fallen_speed = Effect.calculateEffects("fallen-speed", 2)
  temp.basket_cap = Effect.calculateEffects("fallen-basket", 25)

  temp.virus_mult = Virus.speed

  temp.floral_exp_mult = Effect.calculateEffects("floral-exp", 1)

  temp.radiation.cleaning_power = Effect.calculateEffects("cleaning-power", 1)
  temp.radiation.cleaning_exp = Effect.calculateEffects("cleaning-exp", 1)
  temp.radiation.decaying_speed = Effect.calculateEffects("decay-speed", 600)

  for (const i in Currencies) temp.currencies[i] = Currencies[i].gain;
}
