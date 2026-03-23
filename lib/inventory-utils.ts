import { InventoryItem } from "@/types/inventory"

export const totalStock = (item: InventoryItem) =>
  Object.values(item.stock).reduce<number>((a, b) => a + (b ?? 0), 0)

export const isLow = (item: InventoryItem) =>
  Object.values(item.stock).some(v => (v ?? 0) < (item.lowAlert ?? 0))

export const isCritical = (item: InventoryItem) =>
  totalStock(item) < (item.lowAlert ?? 0)