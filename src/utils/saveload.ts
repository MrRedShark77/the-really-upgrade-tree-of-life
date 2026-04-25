import { AutoKeys } from "@/data/automation";
import { BigUpgradeKeys } from "@/data/big_upgrades";
import { Currency_Stats } from "@/data/currencies";
import { RepeatableUpgradeKeys } from "@/data/repeatable_upgrades";
import { checkTab } from "@/data/tabs";
import { UpgradeKeys } from "@/data/upgrades";
import { Weathers } from "@/data/challenges";
import { player } from "@/main";
import { resetTemp, updateTemp } from "@/update";
import type { DecimalSource } from "break_eternity.js"
import { toRaw } from "vue";
import { Layers } from "@/data/layers";

const LOCALSTORAGE_NAME = "TUTOL-save";
const VERSION = 1;

export type Save = {
  leaves: DecimalSource;
  age: DecimalSource;
  seeds: DecimalSource;
  fruits: DecimalSource;
  PE: DecimalSource;
  entropy: DecimalSource;

  composter: {
    active: boolean;
    time: DecimalSource;
    fertilizers: DecimalSource;
  }[]

  cell: {
    amount: DecimalSource;
    upgrades: DecimalSource[];
  },

  auto: {
    total: DecimalSource;
    enabled: Record<string, boolean>;
  },

  bacteria: {
    types: DecimalSource;
    amount: DecimalSource;
    upgrades: DecimalSource[];
  },

  weather: {
    active: number;
    best: [DecimalSource, DecimalSource][];
  },

  season: {
    active: number;
    best: [DecimalSource, DecimalSource][];
  },

  root: {
    amount: DecimalSource;
    total: DecimalSource;
  },

  incinerator: [DecimalSource, DecimalSource][],

  furnace: {
    charcoal: DecimalSource;
    heat: DecimalSource;
    ash: DecimalSource;
    coal: DecimalSource;
  },

  first: {
    seed: boolean;
    fruit: boolean;
    entropy: boolean;
    weather: boolean[];
    root: boolean;
    season: boolean[];
  },

  timePlayed: number;
  lastPlayed: number;

  upgrades: Record<string, boolean>
  discovered_upgrades: Record<string, boolean>

  big_upgrades: Record<string, DecimalSource>

  repeatable_upgrades: Record<string, [DecimalSource, DecimalSource]>

  options: {
    notation: number;
    hide_upgrades: number;
    show_currencies: Record<string, boolean>
    advanced_upgrades: Record<string, boolean[]>
  };

  tab: number;
  stab: number[];

  _VERSION: number,
}

export function getSaveData(): Save {
  const s: Save = {
    leaves: 0,
    age: 0,
    seeds: 0,
    fruits: 0,
    PE: 0,
    entropy: 0,

    composter: [],

    first: {
      seed: false,
      fruit: false,
      entropy: false,
      weather: [false,false,false,false],
      root: false,
      season: [false,false,false,false],
    },

    cell: {
      amount: 1,
      upgrades: [0,0,0],
    },

    auto: {
      total: 0,
      enabled: {},
    },

    bacteria: {
      types: 0,
      amount: 0,
      upgrades: [0,0],
    },

    weather: {
      active: -1,
      best: [],
    },

    season: {
      active: -1,
      best: [],
    },

    root: {
      amount: 0,
      total: 0,
    },

    incinerator: [],

    furnace: {
      charcoal: 0,
      heat: 0,
      ash: 0,
      coal: 0,
    },

    timePlayed: 0,
    lastPlayed: Date.now(),

    upgrades: {},
    discovered_upgrades: {},

    big_upgrades: {},

    repeatable_upgrades: {},

    options: {
      notation: 2,
      hide_upgrades: 0,
      show_currencies: {},
      advanced_upgrades: {},
    },

    tab: 0,
    stab: [0,0,0,0,0],

    _VERSION: VERSION,
  }

  for (const id of UpgradeKeys) {
    s.upgrades[id] = false;
    s.discovered_upgrades[id] = false;
  }
  for (const id of BigUpgradeKeys) s.big_upgrades[id] = 0;
  for (const id of RepeatableUpgradeKeys) s.repeatable_upgrades[id] = [0, 0];

  for (let x = 0; x < 4; x++) s.composter[x] = {
    active: false,
    time: 0,
    fertilizers: 0,
  }

  for (const id of AutoKeys) s.auto.enabled[id] = false;

  for (let i = 0; i < 4; i++) s.weather.best[i] = [0,1];
  for (let i = 0; i < 4; i++) s.season.best[i] = [0,1];
  for (let i = 0; i < 3; i++) s.incinerator[i] = [0,0];

  for (const [id, v] of Object.entries(Currency_Stats)) s.options.show_currencies[id] = v.default ?? false;

  for (const id in Layers) {
    const x = []
    for (const i of [0,1,2,3,5,6]) x[i] = true;
    s.options.advanced_upgrades[id] = x;
  };

  return s
}

type DeepObject = { [index: string | number]: unknown }
export function deepAssign(target: DeepObject, data: DeepObject) {
  for (const [k, v] of Object.entries(data)) {
    if (target[k] === undefined) target[k] = v;
    else if (v !== null && typeof v === 'object') deepAssign(target[k] as DeepObject, v as DeepObject);
    else if (v !== undefined) target[k] = v;
  }
}
export function forceDeepAssign(target: DeepObject, data: DeepObject) {
  for (const [k, v] of Object.entries(data)) {
    if (target[k] === undefined) target[k] = v;
    else if (v !== undefined) target[k] = v;
  }
}

export function loadSave(): Save {
  const data = localStorage.getItem(LOCALSTORAGE_NAME);

  if (data === null) return getSaveData();
  else {
    try {
      return JSON.parse(atob(data));
    } catch {
      return getSaveData();
    }
  }
}

export function save() {
  localStorage.setItem(LOCALSTORAGE_NAME, btoa(JSON.stringify(toRaw(player))));

  // notify("Game Saved!",'success')
}

export function copySave() {
  const str = btoa(JSON.stringify(toRaw(player)))
  const copyText = document.getElementById('copy') as HTMLInputElement
  copyText.value = str
  copyText.style.visibility = "visible"
  copyText.select();
  document.execCommand("copy");
  copyText.style.visibility = "hidden"

  // notify("Successfully exported to clipboard, you can paste anywhere!","success")
}

export function saveFile() {
  const str = btoa(JSON.stringify(toRaw(player)))
  const file = new Blob([str], {type: "text/plain"})
  window.URL = window.URL || window.webkitURL;
  const a = document.createElement("a")
  a.href = window.URL.createObjectURL(file)
  a.download = "The RUTOL - "+new Date().toString()+".txt"
  a.click()
}

function attemptImport(data: string | null) {
  if (data != null) {
    try {
      const new_player = getSaveData()
      deepAssign(new_player, JSON.parse(atob(data)))
      forceDeepAssign(player, new_player);

      checkPlayer()
      checkTab()

      resetTemp()
      for (let i = 0; i < 10; i++) updateTemp();
    } catch (error) {
      throw error
    }
  }
}

export function importy_file() {
  const a = document.createElement("input")
  a.setAttribute("type","file")
  a.click()
  a.onchange = ()=>{
    const fr = new FileReader();
    fr.onload = () => {
      attemptImport(fr.result as string)
      /*
      if (findNaN(loadgame, true)) {
        error("Error Importing, because it got NaNed")
        return
      }
      */
    }
    fr.readAsText(a.files![0]);
  }
}

export function importy() {
  const data = prompt("Paste in your save");

  attemptImport(data)
}

export function wipe() {
  if(confirm(`Are you sure you want to wipe your save?`)) {
    forceDeepAssign(player, getSaveData())
    player.stab = player.stab.map(() => 0)

    checkTab()

    resetTemp()
    for (let i = 0; i < 10; i++) updateTemp();
  }
}

export function checkPlayer() {
  // const date = Date.now()
  // const offline_time = (date - player.lastPlayed) / 1e3;

  if (player._VERSION < 1) {
    for (let i = 0; i < 4; i++) player.first.weather[i] ||= Weathers.is_completed(i);
  }

  player._VERSION = VERSION
}
