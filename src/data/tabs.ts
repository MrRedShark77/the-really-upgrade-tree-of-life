import LayersTab from "@/components/LayersTab.vue";
import { player } from "@/main";
import type { Component, StyleValue } from "vue";
import { hasUpgrade } from "./upgrades";
import ComposterTab from "@/components/ComposterTab.vue";
import CellularTab from "@/components/CellularTab.vue";
import BacteriaTab from "@/components/BacteriaTab.vue";
import AutomationTab from "@/components/AutomationTab.vue";
import ChallengesTab from "@/components/ChallengesTab.vue";
import TheStatueTab from "@/components/TheStatueTab.vue";
import Decimal from "break_eternity.js";
import OptionsTab from "@/components/OptionsTab.vue";

export const TABS: {
  name: string;
  style?: StyleValue;
  class?: Record<string, boolean>;
  condition?: () => boolean;
  pre_stab?: Component;
  stabs: [Component, string?, (() => boolean)?][];
}[] = [
  { // 0
    name: "Layers",

    stabs: [
      [LayersTab],
    ],
  },{ // 1
    name: "Options",

    stabs: [
      [OptionsTab],
    ],
  },{ // 2
    name: "Composter",

    condition: () => hasUpgrade('F\\1'),

    stabs: [
      [ComposterTab],
    ],
  },{ // 3
    name: "Cellular Lab",

    condition: () => hasUpgrade('E\\1'),

    stabs: [
      [CellularTab, "Cells"],
      [AutomationTab, "Automation"],
      [BacteriaTab, "Bacteria", () => Decimal.gt(player.bacteria.types, 0)],
    ],
  },{ // 4
    name: "Challenges",

    condition: () => hasUpgrade('E\\22'),

    stabs: [
      [ChallengesTab],
    ],
  },{ // 5
    name: "The Statue",

    condition: () => hasUpgrade('L\\46'),

    stabs: [
      [TheStatueTab],
    ],
  },
]

export function checkTab() {
  player.stab[player.tab] = Math.min(player.stab[player.tab] ??= 0, TABS[player.tab].stabs.length - 1)
}

export function setTab(i: number, stab: boolean = false) {
  if (stab) player.stab[player.tab] = i;
  else player.tab = i;

  checkTab()
}
