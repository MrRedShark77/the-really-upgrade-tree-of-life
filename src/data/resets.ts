import { player, temp } from "@/main"
import Decimal from "break_eternity.js"
import { hasUpgrade, resetUpgradesByGroup } from "./upgrades"
import { resetTemp } from "@/update"
import { format } from "@/utils/formats"
import { resetRepeatableUpgradesByGroup } from "./repeatable_upgrades"

export const Resets: Record<string, {
  reached: boolean
  description: string
  perform(): void
  reset(): void
}> = {
  seeds: {
    get reached() { return player.discovered_upgrades['L\\6'] && Decimal.gte(player.leaves, 1e7) },

    get description() {
      return this.reached ? `Decompolize your tree for <b>${format(temp.currencies.seeds, 0)}</b> Seeds` : `Reach <b>${format(1e7)}</b> Leaves`
    },

    perform() {
      if (!this.reached) return;

      player.seeds = Decimal.add(player.seeds, temp.currencies.seeds)
      player.first.seed = true

      this.reset();
    },

    reset() {
      player.leaves = 0
      player.age = 0
      resetUpgradesByGroup("L")
      resetRepeatableUpgradesByGroup("LR")

      resetTemp()
    },
  },
  fruits: {
    get reached() { return player.discovered_upgrades['L\\16'] && Decimal.gte(player.seeds, 2.5e7) },

    get description() {
      return this.reached ? `Harvest your tree for <b>${format(temp.currencies.fruits, 0)}</b> Fruits` : `Reach <b>${format(2.5e7)}</b> Seeds`
    },

    perform() {
      if (!this.reached) return;

      player.fruits = Decimal.add(player.fruits, temp.currencies.fruits)
      player.first.fruit = true

      this.reset();
    },

    reset() {
      player.seeds = 0
      resetUpgradesByGroup("S")
      resetRepeatableUpgradesByGroup("SR")
      if (hasUpgrade("E\\3") && player.discovered_upgrades["S\\20"]) player.upgrades["S\\20"] = true;

      if (!hasUpgrade("E\\8")) for (let i = 0; i < 2; i++) {
        player.composter[i].active = false;
        player.composter[i].time = 0;
        player.composter[i].fertilizers = 0;
      }

      Resets.seeds.reset()
    },
  },
  entropy: {
    get reached() { return player.discovered_upgrades['L\\28'] && Decimal.gte(player.PE, 2e22) },

    get description() {
      return this.reached ? `Transform your tree into some powerful energy for <b>${format(temp.currencies.entropy, 0)}</b> Entropy` : `Reach <b>${format(2e22)}</b> Potential Energy`
    },

    perform() {
      if (!this.reached) return;

      player.entropy = Decimal.add(player.entropy, temp.currencies.entropy)
      player.first.entropy = true

      this.reset();
    },

    reset() {
      player.fruits = 0
      const k = []
      if (hasUpgrade("E\\5")) k.push("F\\1","F\\2","F\\6");
      resetUpgradesByGroup("F",k)

      for (let i = 0; i < 3; i++) {
        player.composter[i].active = false;
        player.composter[i].time = 0;
        player.composter[i].fertilizers = 0;
      }

      if (!hasUpgrade("E\\12")) player.cell.amount = 1

      Resets.fruits.reset()
    },
  },
  bacteria: {
    get reached() { return Decimal.gte(player.entropy, 3e4) && Decimal.gte(player.cell.amount, 'e350') },

    get description() {
      return this.reached ? `Convert all your Cells and Entropy for <b>${format(temp.currencies.bacteria, 0)}</b> Bacteria` : `Reach <b>${format(3e4)}</b> Entropy and <b>${format('e350')}</b> Cells`
    },

    perform() {
      if (!this.reached) return;

      player.bacteria.amount = Decimal.add(player.bacteria.amount, temp.currencies.bacteria)

      this.reset();
    },

    reset() {
      player.entropy = hasUpgrade("E\\27") ? Decimal.div(player.entropy, 100).round() : 0
      player.cell.amount = 1
    },
  },
}
