import { player } from "@/main"

export const Layers: Record<string, {
  unlock(): boolean
  currency: string
  upgrade_group: string
  reset?: string
}> = {
  leaves: {
    unlock: () => true,
    currency: "leaves",
    upgrade_group: "L",
  },
  seeds: {
    unlock: () => player.discovered_upgrades['L\\6'],
    currency: "seeds",
    upgrade_group: "S",
    reset: "seeds",
  },
  fruits: {
    unlock: () => player.discovered_upgrades['L\\16'],
    currency: "fruits",
    upgrade_group: "F",
    reset: "fruits",
  },
  entropy: {
    unlock: () => player.discovered_upgrades['L\\28'],
    currency: "entropy",
    upgrade_group: "E",
    reset: "entropy",
  },
}

export const LayerKeys = Object.keys(Layers)
