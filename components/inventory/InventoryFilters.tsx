"use client"

import { InventoryItem } from "@/types/inventory"
import { useState } from "react"

export default function InventoryFilters({
  items,
  onFilter
}: {
  items: InventoryItem[]
  onFilter: (items: InventoryItem[]) => void
}) {

  const [query, setQuery] = useState("")

  function handleSearch(value: string) {
    setQuery(value)

    const filtered = items.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase()) ||
      i.sku.toLowerCase().includes(value.toLowerCase())
    )

    onFilter(filtered)
  }

  return (
    <div className="flex gap-2 mb-4">
      <input
        className="border px-3 py-2 rounded w-full"
        placeholder="Search inventory..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}