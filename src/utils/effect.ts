import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";
import { DC } from "./decimal";
import { format, formatMult, formatPlus, formatPow } from "./formats";
import { temp } from "@/main";
import { reactive } from "vue";

export enum EffectType {
  None,

  Addition,

  BaseMultiplier,
  BaseExponent,

  Base,

  Multiplier,
  Exponent,
}

function operateEffect(id: EffectType, x: DecimalSource, y: DecimalSource): DecimalSource {
  switch (id) {
    case EffectType.Addition: return Decimal.add(x, y);

    case EffectType.Base:
    case EffectType.Multiplier:
    case EffectType.BaseMultiplier: return Decimal.mul(x, y);

    case EffectType.Exponent:
    case EffectType.BaseExponent: return Decimal.pow(x, y);

    default: return DC.D0;
  }
}

export class Effect {
  variables : Record<string, DecimalSource> = {};
  type: EffectType = 0

  static : boolean;
  default : DecimalSource = 0;

  id!: string;
  changeID(id : string) {
    if (id in Effects) delete Effects[this.id];

    Effects[this.id = id] = this;
  };

  get temp() { return temp.effects[this.id] }
  set temp(v) { temp.effects[this.id] = v }

  calc : (() => DecimalSource) = () => 1;
  active = () => true;
  display? : (x: DecimalSource) => string;

  constructor(data: {
    id?: string,
    type: EffectType
    variables?: Record<string, DecimalSource>
    static: boolean

    calc? : () => DecimalSource,
    active? : () => boolean,
    display? : (x: DecimalSource) => string,

    group?: string | string[],
  }) {
    if (data.variables) this.variables = data.variables;

    this.type = data.type
    this.static = data.static

    if (this.type === EffectType.Multiplier && this.static) this.type = EffectType.BaseMultiplier;

    switch (this.type) {
      case EffectType.Addition:
        this.default = 0;
      break;
      case EffectType.Base:
      case EffectType.BaseMultiplier:
      case EffectType.Multiplier:
      case EffectType.BaseExponent:
      case EffectType.Exponent:
        this.default = 1;
      break;
    }

    if (data.calc) this.calc = data.calc;
    if (data.active) this.active = data.active;

    if (data.display) this.display = data.display;
    else switch (this.type) {
      case EffectType.Addition:
        if (!this.static) this.display = x => formatPlus(x)
      break;
      case EffectType.Multiplier:
        this.display = x => formatMult(x)
      break;
      case EffectType.Exponent:
        if (!this.static) this.display = x => formatPow(x, 3);
      break;
      case EffectType.BaseExponent:
        if (typeof data.group === "string" && data.group in TotalEffectGroups) {
          const g = TotalEffectGroups[data.group as string]
          const y = (x: DecimalSource) => formatMult(Decimal.pow(g[EffectType.BaseMultiplier], Decimal.sub(x, 1).mul(g[EffectType.BaseExponent]).div(this.active() ? x : 1)))
          this.display = this.static ? y : (x => formatPow(x, 3) + " (" + y(x) + ")")
        }
      break;
    };

    if (data.id) Effects[this.id = data.id] = this;

    if (data.group) {
      if (typeof data.group === "string") data.group = [data.group];

      for (const group of data.group) {
        let G = EffectGroups[group];

        if (G == null) {
          G = EffectGroups[group] = {
            [EffectType.None]: [],
            [EffectType.Addition]: [],
            [EffectType.BaseMultiplier]: [],
            [EffectType.BaseExponent]: [],
            [EffectType.Base]: [],
            [EffectType.Multiplier]: [],
            [EffectType.Exponent]: [],
          };

          TotalEffectGroups[group] = {
            [EffectType.None]: 0,
            [EffectType.Addition]: 0,
            [EffectType.BaseMultiplier]: 1,
            [EffectType.BaseExponent]: 1,
            [EffectType.Base]: 1,
            [EffectType.Multiplier]: 1,
            [EffectType.Exponent]: 1,
          };
        }

        G[this.type].push(this)
      }
    }
  }

  get_effect(calculated=false): DecimalSource { return calculated || this.active() ? this.temp ?? (this.temp = this.calc()) : this.default }
  static effect(id: string): DecimalSource { return Effects[id].get_effect() }

  static calculateEffects(group: string, x: DecimalSource = 1): DecimalSource {
    const G = EffectGroups[group];

    if (G == null) return x;

    let E : Effect

    for (let T: EffectType = EffectType.Addition; T <= EffectType.Exponent; T++) if (T < EffectType.Exponent || Decimal.gt(x, 1)) {
      let p = T === EffectType.Addition ? DC.D0 : DC.D1
      for (E of G[T]) if (E.active()) {
        const y = E.get_effect(true)
        x = operateEffect(E.type, x, y)

        if (T === EffectType.Addition) p = p.add(y);
        else p = p.mul(y);
      };
      TotalEffectGroups[group][T] = p;
    }

    return x
  }

  static updateEffects() {
    for (const E of Object.values(Effects)) E.temp = E.calc();
  }

  static calculateEffectHTML(group: string, base = false, base_formula = '', post_base_formula = ''): string {
    const TEG = TotalEffectGroups[group]
    return (base ? `<b>Base</b> = ${base_formula} = ${format(TEG[EffectType.Base])} ${post_base_formula}<br>` : "") + `(${base ? "<b>Base</b> × " : ""}${format(TEG[EffectType.BaseMultiplier])}<sup>${format(TEG[EffectType.BaseExponent],3)}</sup> × ${format(TEG[EffectType.Multiplier])})<sup>${format(TEG[EffectType.Exponent],3)}</sup>`
  }
}

export const Effects : Record<string, Effect> = {};
export const EffectGroups : Record<string, Record<EffectType, Effect[]>> = {};
export const TotalEffectGroups : Record<string, Record<EffectType, DecimalSource>> = reactive({});

/*
console.log(new Effect({
  type: EffectType.Multiplier,
  static: true,

  calc: () => 2,
}))
*/
