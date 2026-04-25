import { player } from "@/main"

export const Layers: Record<string, {
  unlock(): boolean
  currency: string
  upgrade_group: string
  upgrade_name: string
  reset?: string
}> = {
  leaves: {
    unlock: () => true,
    currency: "leaves",
    upgrade_group: "L",
    upgrade_name: "Leaf Upgrades",
  },
  seeds: {
    unlock: () => player.discovered_upgrades['L\\6'],
    currency: "seeds",
    upgrade_group: "S",
    reset: "seeds",
    upgrade_name: "Seed Upgrades",
  },
  fruits: {
    unlock: () => player.discovered_upgrades['L\\16'],
    currency: "fruits",
    upgrade_group: "F",
    reset: "fruits",
    upgrade_name: "Fruit Upgrades",
  },
  entropy: {
    unlock: () => player.discovered_upgrades['L\\28'],
    currency: "entropy",
    upgrade_group: "E",
    reset: "entropy",
    upgrade_name: "Entropy Upgrades",
  },
  root: {
    unlock: () => player.discovered_upgrades['L\\-4'],
    currency: "roots",
    upgrade_group: "RO",
    reset: "root",
    upgrade_name: "Root Upgrades",
  },
}

export const LayerKeys = Object.keys(Layers)
