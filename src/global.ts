import type { DecimalSource } from "break_eternity.js";
import { player, temp } from "./main";
import { copySave, deepAssign, save, type Save } from "./utils/saveload";
import Decimal from "break_eternity.js";
import { D, scaleAll, expPow, sumBase, simpleCost, advanced_scale, advanced_softcap } from "./utils/decimal";
import { calc } from "./update";
import { Effects, TotalEffectGroups } from "./utils/effect";

declare global {
  interface Window {
    player: Save;
    D: (x: DecimalSource) => Decimal;
    Decimal: unknown;

    formulas: Record<string, unknown>;

    dev: Record<string, unknown>;
  }
}

if (import.meta.env.DEV) {
  window.player = player;
  window.D = D;
  window.Decimal = Decimal;

  window.formulas = {
    advanced_softcap, advanced_scale, scaleAll, expPow, sumBase, simpleCost
  }

  window.dev = {
    save, calc, temp, copySave, deepAssign, Effects, TotalEffectGroups
  }
}
