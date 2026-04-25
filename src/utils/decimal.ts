import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";

export const D = (x: DecimalSource) => new Decimal(x);

export const DC = {
  D0: D(0),
  D1: D(1),

  D10: D(10),
  DE10: D(1e10),
  DE100: D(1e100),

  DE308: Decimal.dNumberMax,
  DE308LOG: Decimal.dNumberMax.log10(),

  DE19728: Decimal.pow(2, 65536),
  DE19728LOG: Decimal.pow(2, 65536).log10(),

  DINF: Decimal.dInf,
}

type ScaleMode = "L" | "P" | "E1" | "E2" | "ME1" | "ME2" | "D";

export function advanced_scale (num: DecimalSource, s: DecimalSource, p: DecimalSource, strength: DecimalSource = 1, mode: ScaleMode, reverse: boolean = false): Decimal {
  const d = new Decimal(num);

  if (d.lt(s)) return d;

  switch (mode) {
    case "L": // (x-s)*p+s
      return reverse ? d.sub(s).div(p).add(s) : d.sub(s).mul(p).add(s);
    case "P": // (x/s)^p*s
      return reverse ? d.div(s).root(p).mul(s) : d.div(s).pow(p).mul(s);
    case 'E1': // p^(x-s)*s
      return reverse ? d.div(s).max(1).log(p).div(strength).add(s) : Decimal.pow(p,d.sub(s).mul(strength)).mul(s)
    case 'E2': // p^(x/s-1)*s, p >= 2.71828
      return reverse ? d.div(s).max(1).log(p).div(strength).add(1).mul(s).min(d) : Decimal.pow(p,d.div(s).sub(1).mul(strength)).mul(s).max(d)
    case 'ME1': {
      // p^(x-s)*x
      const ln_p = Decimal.ln(p).mul(strength)
      return reverse ? Decimal.pow(p,s).mul(d).mul(ln_p).lambertw().div(ln_p) : Decimal.pow(p,d.sub(s).mul(strength)).mul(d)
    }
    case 'ME2': {
      // p^(x/s-1)*x
      const ln_p = Decimal.ln(p).mul(strength)
      return reverse ? (Decimal.lt(strength, 1) ? d.root(strength).mul(p).pow(strength) : Decimal.pow(p, strength).mul(d)).mul(ln_p).div(s).lambertw().mul(s).div(ln_p) : Decimal.pow(p,d.div(s).sub(1).mul(strength)).mul(d)
    }
    case 'D': {
      // 10^((lg(x)/s)^p*s)
      const s10 = Decimal.log10(s)
      return reverse ? Decimal.pow(10,d.log10().div(s10).root(p).mul(s10)) : Decimal.pow(10,d.log10().div(s10).pow(p).mul(s10))
    }
  }
}

export const scale = (num: DecimalSource, s: DecimalSource, p: DecimalSource, mode: ScaleMode, reverse: boolean = false) => advanced_scale (num,s,p,1,mode,reverse);

type Scaling = [DecimalSource, DecimalSource, ScaleMode, boolean?];

export function scaleAll (num: DecimalSource, scalings: Scaling[], reverse: boolean = false): Decimal {
  let d = new Decimal(num);

  if (!reverse) scalings.reverse();

  for (const [start, power, mode, inactive] of scalings) {
    if (inactive) continue;

    if (reverse && d.lt(start)) break;

    d = scale(d, start, power, mode, reverse)
  }

  return d
}

type SoftcapMode = "L" | "P" | "LOG" | "E";

export function advanced_softcap (num: DecimalSource, s: DecimalSource, p: DecimalSource, strength: DecimalSource = 1, mode: SoftcapMode, ...args: DecimalSource[]): Decimal {
  const d = new Decimal(num);

  if (d.lt(s) || Decimal.lte(strength, 0)) return d;

  switch (mode) {
    case "L": { // (x-s)*p+s
      return d.sub(s).mul(p).add(s);
    }
    case "P": { // (x/s)^p*s
      return powPlusOne(d.div(s), Decimal.sub(1,p).root(strength).neg()).mul(s);
    }
    case "LOG": {
      const [height, base] = args as [number, DecimalSource]
      if (height === undefined || height === 1) return d.div(s).log(base ?? 10).mul(p).add(1).mul(s);
      const logD = d.iteratedlog(10, height - 1), logS = Decimal.iteratedlog(s, 10, height - 1);
      return Decimal.iteratedexp(10, height - 1, logD.div(logS).log(base ?? 10).mul(p).add(1).mul(logS))
    }
    case "E": {
      const [height] = args as [number];
      let logD, logS;
      if (height === undefined || height === 1) {
        logD = d.log10();
        logS = Decimal.log10(s);
        return powPlusOne(logD.div(logS), Decimal.sub(1,p).root(strength).neg()).mul(logS).pow10();
      };
      logD = d.iteratedlog(10, height);
      logS = Decimal.iteratedlog(s, 10, height);
      return Decimal.iteratedexp(10,height,powPlusOne(logD.div(logS), Decimal.sub(1,p).root(strength).neg()).mul(logS));
    }
  }
}

export const softcap = (num: DecimalSource, s: DecimalSource, p: DecimalSource, mode: SoftcapMode, ...args: DecimalSource[]) => advanced_softcap(num,s,p,1,mode,...args);

type CostMode = "EA" | "EAI" | "E" | "EI" | "ES" | "ESI" | "P" | "PI"

export function simpleCost (num: DecimalSource, type: CostMode, ...args: DecimalSource[]): Decimal {
  const x = new Decimal(num);

  switch (type) {
    case "EA": { // a * (1+b*x) * c^x, b > 0, c > 1
      const [base,increment,exponent] = args
      return Decimal.pow(exponent,x).mul(Decimal.mul(x,increment).add(1)).mul(base)
    }
    case "EAI": { // inverse of EA
      const [base,increment,exponent] = args
      const ln = Decimal.ln(exponent)
      return ln.mul(x).mul(Decimal.root(exponent,increment)).div(base).div(increment).lambertw().mul(increment).sub(ln).div(ln).div(increment)
    }

    case "E": { // a * b^x, b > 1
      const [base,exponent] = args
      return Decimal.pow(exponent,x).mul(base)
    }
    case "EI": {
      const [base,exponent] = args
      return x.div(base).log(exponent)
    }

    case "ES": { // a * b^x * c^x^2, b > 1, c > 1
      const [base,exponent,exponent_square] = args
      return Decimal.pow(exponent,x).mul(Decimal.sqr(x).pow_base(exponent_square)).mul(base)
    }
    case "ESI": {
      const [base,exponent,exponent_square] = args
      const ln = Decimal.ln(exponent), ln2 = Decimal.ln(exponent_square)
      return Decimal.div(x,base).ln().mul(ln2).mul(4).add(ln.sqr()).sqrt().sub(ln).div(ln2).div(2)
    }

    case "P": { // a + 2 * a + ... = a * (x + x^2) / 2
      const [base] = args
      return x.sqr().add(x).div(2).mul(base)
    }
    case "PI": {
      const [base] = args
      return solveQuadraticPositive(1,1,x.div(base).mul(-2))
    }

    default: {
      return DC.D0
    }
  }
}

export function solveQuadraticPositive (a: DecimalSource, b: DecimalSource, c: DecimalSource): Decimal {
  const d = Decimal.sqr(b).sub(Decimal.mul(a,c).mul(4)).max(0)
  return d.sqrt().sub(b).div(a).div(2)
}

export function expPow (num: DecimalSource, pow: DecimalSource, height: number = 1): Decimal {
  const d = new Decimal(num);

  if (Decimal.eq(pow,0)) return DC.D1;
  if (Decimal.eq(pow,1)) return d;

  height = Math.max(0,Math.round(height));

  if (height === 0) return d.pow(pow);

  if (d.lte(Decimal.iteratedexp(10,height-1))) return expPow(d, pow, height - 1);

  return Decimal.iteratedexp(10,height,d.iteratedlog(10,height).pow(pow));
}

export function sumBase (num: DecimalSource, base: DecimalSource, reverse: boolean = false): Decimal {
  const d = new Decimal(num);
  return reverse ? d.mul(Decimal.sub(base,1)).add(1).log(base) : Decimal.pow(base,d).sub(1).div(Decimal.sub(base,1));
}

export function powPlusOne (num: DecimalSource, exp: DecimalSource): Decimal {
  return Decimal.pow(num, exp).mul(num)
}
