/**
 * Pure planning logic for stock imports and delivery logging: parsing, matching
 * and planning. No network calls — see lib/stock-apply.ts for the write side.
 *
 * No imports and no I/O on purpose, so it can be exercised with plain `node`
 * against a real sheet. The page does the file reading and the API calls.
 *
 * The rules, and why:
 *  - PRODUCT NAME is the primary key. Merchant names in real sheets are full of the
 *    duplicate spellings ("360" / "360 store" / "360 Stores") that get merged away,
 *    so merchant is only used to break a tie between same-named products.
 *  - Quantities are ABSOLUTE (it's a stock count): the sheet value replaces what is
 *    stored for that branch. Branches the sheet doesn't mention are left alone.
 *  - When the sheet lists the same product + branch more than once with different
 *    numbers, the HIGHER one wins — same rule as the merchant merge — and it is
 *    reported so a human can check.
 *  - Nothing ambiguous is guessed. Unknown products, unmapped branches and ties are
 *    set aside with a reason instead.
 */

export type Field = 'name' | 'merchant' | 'branch' | 'quantity'

export const COLUMN_ALIASES: Record<Field, string[]> = {
  name: ['product name', 'product', 'name', 'item name', 'item', 'product_name'],
  merchant: ['merchant', 'merchant name', 'supplier', 'vendor', 'brand', 'store'],
  branch: ['branch', 'branch name', 'location', 'outlet'],
  quantity: ['quantity', 'qty', 'stock', 'stock count', 'count', 'amount'],
}

export const MERCHANT_MATCH_MIN = 0.62

/* ─────────────── normalising ─────────────── */

export const normalize = (s: unknown) =>
  String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const stem = (t: string) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t)

/** Product identity: case, punctuation and plurals ignored; word order kept. */
export const productKey = (s: unknown) =>
  normalize(s).split(' ').filter(Boolean).map(stem).join(' ')

const merchantCanonical = (s: unknown) =>
  normalize(s).split(' ').filter(Boolean).map(stem).sort().join(' ')

const tokenSet = (s: unknown, stemmed = true) =>
  new Set(
    normalize(s)
      .split(' ')
      .filter(Boolean)
      .map((t) => (stemmed ? stem(t) : t))
  )

const isSubset = (a: Set<string>, b: Set<string>) =>
  a.size > 0 && [...a].every((t) => b.has(t))

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[n]
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

/** Same layered matcher as the merchant cleanup tool, used only to break ties. */
export function merchantSimilarity(a: unknown, b: unknown): number {
  const ac = merchantCanonical(a)
  const bc = merchantCanonical(b)
  if (!ac || !bc) return 0
  if (ac === bc) return 1
  const at = tokenSet(a)
  const bt = tokenSet(b)
  if (isSubset(at, bt) || isSubset(bt, at)) return 0.85
  if (commonPrefixLength(ac, bc) < Math.min(ac.length, bc.length) * 0.5) return 0
  return 1 - levenshtein(ac, bc) / Math.max(ac.length, bc.length)
}

/* ─────────────── reading the sheet ─────────────── */

export type SheetRow = {
  /** 1-based row number as shown in Excel */
  row: number
  name: string
  merchant: string
  branch: string
  rawQuantity: unknown
}

const asText = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim())

export function detectColumns(header: unknown[]) {
  const norms = header.map(normalize)
  const used = new Set<number>()
  const map: Partial<Record<Field, number>> = {}

  for (const field of ['name', 'merchant', 'branch', 'quantity'] as Field[]) {
    for (const alias of COLUMN_ALIASES[field]) {
      const idx = norms.findIndex((h, i) => h === normalize(alias) && !used.has(i))
      if (idx !== -1) {
        map[field] = idx
        used.add(idx)
        break
      }
    }
  }

  // Merchant is optional — it only disambiguates.
  const missing = (['name', 'branch', 'quantity'] as Field[]).filter((f) => map[f] === undefined)
  return { map, missing }
}

/**
 * `grid[0]` must be Excel row 1. The header is the first row with at least two
 * non-empty cells; fully empty rows after it are skipped.
 */
export function parseGrid(grid: unknown[][]) {
  const headerIndex = grid.findIndex((r) => (r || []).filter((c) => asText(c) !== '').length >= 2)
  if (headerIndex === -1) {
    return { rows: [] as SheetRow[], missing: ['name', 'branch', 'quantity'] as Field[], headers: [] as string[] }
  }

  const headers = (grid[headerIndex] || []).map(asText)
  const { map, missing } = detectColumns(headers)
  if (missing.length) return { rows: [] as SheetRow[], missing, headers }

  const rows: SheetRow[] = []
  for (let i = headerIndex + 1; i < grid.length; i++) {
    const r = grid[i] || []
    if (r.every((c) => asText(c) === '')) continue
    rows.push({
      row: i + 1,
      name: asText(r[map.name!]),
      merchant: map.merchant === undefined ? '' : asText(r[map.merchant]),
      branch: asText(r[map.branch!]),
      rawQuantity: r[map.quantity!],
    })
  }
  return { rows, missing, headers }
}

export function parseQuantity(raw: unknown): { value: number | null; error?: string } {
  if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) {
    return { value: null, error: 'quantity is blank' }
  }
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim())
  if (!Number.isFinite(n)) return { value: null, error: `quantity "${String(raw)}" is not a number` }
  if (n < 0) return { value: null, error: `quantity ${n} is negative` }
  if (!Number.isInteger(n)) return { value: null, error: `quantity ${n} is not a whole number` }
  return { value: n }
}

/* ─────────────── branches ─────────────── */

export type SystemBranch = { id: string; name: string }

export function branchGroups(rows: SheetRow[]) {
  const groups = new Map<string, { key: string; spellings: Set<string>; count: number }>()
  for (const r of rows) {
    const key = normalize(r.branch)
    if (!key) continue
    const g = groups.get(key) || { key, spellings: new Set<string>(), count: 0 }
    g.spellings.add(r.branch)
    g.count++
    groups.set(key, g)
  }
  return [...groups.values()]
    .map((g) => ({ key: g.key, spellings: [...g.spellings], count: g.count }))
    .sort((a, b) => b.count - a.count)
}

/** Exact match first, then a unique whole-word match ("Enugu" -> "Enugu Branch"). */
export function suggestBranch(key: string, branches: SystemBranch[]): string | null {
  const exact = branches.find((b) => normalize(b.name) === key)
  if (exact) return exact.id

  const kt = tokenSet(key, false)
  const hits = branches.filter((b) => {
    const bt = tokenSet(b.name, false)
    return isSubset(kt, bt) || isSubset(bt, kt)
  })
  return hits.length === 1 ? hits[0].id : null
}

/* ─────────────── products & planning ─────────────── */

export type SystemStock = { branchId: string; quantity: number; lowStockAlert: number }

export type SystemProduct = {
  id: string
  name: string
  merchantName: string
  trackingId?: string
  stocks: SystemStock[]
}

/**
 * 'set'    — a stock count. The number IS the new quantity.
 * 'deduct' — a delivery note. The number is how many left the branch, so it is
 *            subtracted from what is stored (never below zero).
 */
export type PlanMode = 'set' | 'deduct'

export type RowStatus = 'update' | 'unchanged' | 'unmatched' | 'ambiguous' | 'invalid' | 'unmapped-branch'

export type RowOutcome = {
  row: SheetRow
  status: RowStatus
  reason?: string
  productId?: string
  branchId?: string
  candidates?: SystemProduct[]
}

export type BranchChange = {
  branchId: string
  before: number | null
  after: number
  /** deduct mode: units delivered out of this branch */
  delta?: number
  /** deduct mode: more was delivered than the system had in stock */
  shortfall?: boolean
  rows: number[]
}

export type ProductUpdate = {
  product: SystemProduct
  /** branchId -> quantity to write, as previewed. Only branches that change. */
  targets: Record<string, number>
  /**
   * deduct mode: branchId -> units to subtract. This is what the write actually
   * uses — the subtraction is redone against fresh stock at write time, so a sale
   * recorded between preview and write can't be silently overwritten.
   */
  deltas?: Record<string, number>
  changes: BranchChange[]
}

export type Conflict = {
  product: SystemProduct
  branchId: string
  values: { row: number; quantity: number }[]
  chosen: number
  /** 'higher-wins' = one count contradicts another; 'summed' = separate deliveries */
  kind: 'higher-wins' | 'summed'
}

export type Shortfall = {
  product: SystemProduct
  branchId: string
  delivered: number
  stock: number
}

export type Plan = {
  mode: PlanMode
  updates: ProductUpdate[]
  changeCount: number
  unchangedPairs: number
  outcomes: RowOutcome[]
  conflicts: Conflict[]
  shortfalls: Shortfall[]
  counts: Record<RowStatus, number>
}

export function buildProductIndex(products: SystemProduct[]) {
  const index = new Map<string, SystemProduct[]>()
  for (const p of products) {
    const k = productKey(p.name)
    if (!k) continue
    const list = index.get(k) || []
    list.push(p)
    index.set(k, list)
  }
  return index
}

export function buildPlan(
  rows: SheetRow[],
  branchMap: Record<string, string | null>,
  products: SystemProduct[],
  mode: PlanMode = 'set',
  /** sheet row number -> product id the user picked by hand, overriding matching */
  resolutions: Record<number, string> = {}
): Plan {
  const index = buildProductIndex(products)
  const productById = new Map(products.map((p) => [p.id, p]))
  const outcomes: RowOutcome[] = []

  // productId -> branchId -> every sheet value seen for that pair
  const acc = new Map<string, { product: SystemProduct; byBranch: Map<string, { row: number; quantity: number }[]> }>()

  for (const row of rows) {
    if (!normalize(row.name)) {
      outcomes.push({ row, status: 'invalid', reason: 'product name is blank' })
      continue
    }
    if (!normalize(row.branch)) {
      outcomes.push({ row, status: 'invalid', reason: 'branch is blank' })
      continue
    }
    const q = parseQuantity(row.rawQuantity)
    if (q.error || q.value === null) {
      outcomes.push({ row, status: 'invalid', reason: q.error })
      continue
    }

    const branchId = branchMap[normalize(row.branch)]
    if (!branchId) {
      outcomes.push({ row, status: 'unmapped-branch', reason: `branch "${row.branch}" is not mapped to a system branch` })
      continue
    }

    // A product picked by hand wins over anything the matcher would decide.
    const forcedId = resolutions[row.row]
    let product: SystemProduct | undefined = forcedId ? productById.get(forcedId) : undefined

    if (!product) {
      const candidates = index.get(productKey(row.name)) || []

      if (candidates.length === 0) {
        outcomes.push({ row, status: 'unmatched', reason: 'no product with this name exists' })
        continue
      }

      if (candidates.length === 1) {
        product = candidates[0]
      } else if (!normalize(row.merchant)) {
        outcomes.push({
          row,
          status: 'ambiguous',
          reason: `${candidates.length} products share this name and the row has no merchant`,
          candidates,
        })
        continue
      } else {
        const scored = candidates
          .map((c) => ({ c, s: merchantSimilarity(row.merchant, c.merchantName) }))
          .sort((a, b) => b.s - a.s)
        const top = scored[0]
        const runnerUp = scored[1]
        if (top.s >= MERCHANT_MATCH_MIN && (!runnerUp || top.s > runnerUp.s)) {
          product = top.c
        } else {
          outcomes.push({
            row,
            status: 'ambiguous',
            reason:
              top.s < MERCHANT_MATCH_MIN
                ? `${candidates.length} products share this name and none of their merchants resemble "${row.merchant}"`
                : `${candidates.length} products share this name under equally matching merchants`,
            candidates,
          })
          continue
        }
      }
    }

    const entry = acc.get(product.id) || { product, byBranch: new Map() }
    const vals = entry.byBranch.get(branchId) || []
    vals.push({ row: row.row, quantity: q.value })
    entry.byBranch.set(branchId, vals)
    acc.set(product.id, entry)

    // status filled in once every row for this product+branch has been seen
    outcomes.push({ row, status: 'update', productId: product.id, branchId })
  }

  const updates: ProductUpdate[] = []
  const conflicts: Conflict[] = []
  const shortfalls: Shortfall[] = []
  const pairStatus = new Map<string, 'update' | 'unchanged'>()
  let unchangedPairs = 0
  let changeCount = 0

  for (const { product, byBranch } of acc.values()) {
    const existing = new Map(product.stocks.map((s) => [s.branchId, s.quantity]))
    const targets: Record<string, number> = {}
    const deltas: Record<string, number> = {}
    const changes: BranchChange[] = []

    for (const [branchId, vals] of byBranch) {
      const before = existing.has(branchId) ? (existing.get(branchId) as number) : null
      const key = `${product.id}|${branchId}`

      let after: number
      let delta: number | undefined
      let shortfall = false

      if (mode === 'deduct') {
        // Two lines for one product are two deliveries, so they add up — unlike a
        // stock count, where two lines contradict each other.
        const delivered = vals.reduce((n, v) => n + v.quantity, 0)
        if (vals.length > 1) {
          conflicts.push({ product, branchId, values: vals, chosen: delivered, kind: 'summed' })
        }
        const stock = before ?? 0
        delta = delivered
        after = Math.max(0, stock - delivered)
        shortfall = delivered > stock
        if (shortfall) shortfalls.push({ product, branchId, delivered, stock })
      } else {
        after = Math.max(...vals.map((v) => v.quantity))
        if (new Set(vals.map((v) => v.quantity)).size > 1) {
          conflicts.push({ product, branchId, values: vals, chosen: after, kind: 'higher-wins' })
        }
      }

      // Deducting from a branch that holds no stock row for this product would
      // only create an empty row. Nothing to subtract, so flag it and write nothing.
      const nothingToDeduct = mode === 'deduct' && before === null

      if (before === after || nothingToDeduct) {
        unchangedPairs++
        pairStatus.set(key, 'unchanged')
      } else {
        targets[branchId] = after
        if (mode === 'deduct' && delta !== undefined) deltas[branchId] = delta
        changes.push({
          branchId,
          before,
          after,
          ...(delta !== undefined ? { delta, shortfall } : {}),
          rows: vals.map((v) => v.row),
        })
        pairStatus.set(key, 'update')
        changeCount++
      }
    }

    if (changes.length) {
      updates.push({
        product,
        targets,
        ...(mode === 'deduct' ? { deltas } : {}),
        changes,
      })
    }
  }

  for (const o of outcomes) {
    if (o.status === 'update' && o.productId && o.branchId) {
      o.status = pairStatus.get(`${o.productId}|${o.branchId}`) || 'update'
    }
  }

  const counts: Record<RowStatus, number> = {
    update: 0,
    unchanged: 0,
    unmatched: 0,
    ambiguous: 0,
    invalid: 0,
    'unmapped-branch': 0,
  }
  for (const o of outcomes) counts[o.status]++

  updates.sort((a, b) => a.product.name.localeCompare(b.product.name))

  return { mode, updates, changeCount, unchangedPairs, outcomes, conflicts, shortfalls, counts }
}

/* ─────────────── delivery messages ─────────────── */

export type DeliveryLayout = 'quantity-last' | 'quantity-first' | 'quantity-last-loose'

export type DeliveryParse = {
  date: string
  branchLabel: string
  layout: DeliveryLayout
  rows: SheetRow[]
  unparsed: { line: number; text: string }[]
}

/**
 * Matches "Nova Shampoo......4", "Arm Shaper...... 2(Dm)", "Prostdex....7".
 * The name is lazy so a trailing "(Merchant)" and the quantity are peeled off the
 * end — which keeps names that contain digits intact, e.g.
 * "Brown Leather watch and 1 bracelet.....1(TB1)".
 */
const DELIVERY_ITEM = /^(.+?)\s*(?:\.{2,}|\s[-–—:]\s*|\s{2,})\s*(\d+)\s*(?:\(([^)]*)\))?\s*\.*\s*$/

/**
 * "4 Kreain gel", "2 Ginseng five treasure tea (Yusmine)".
 * Only the LEADING number is the quantity, so a name may contain digits of its
 * own: "1 Brown leather watch and 1 Bracelet (TB1)" is 1 of that product.
 * A separator after the number is deliberately not allowed — "1. Kreain gel"
 * would be a numbered list, and reading the index as a quantity would be wrong.
 */
const DELIVERY_ITEM_QTY_FIRST = /^(\d+)\s+(.+?)\s*(?:\(([^)]*)\))?\s*$/

/**
 * "Laxira capsule 12", "Hamachin 3(Topmost)", "Airtab 10 pro xl 1(Nuclear vision)".
 * Quantity last with nothing but a space in front of it — no dots, no dash.
 *
 * The name is lazy and the pattern is anchored, so the LAST number on the line
 * is the quantity and any earlier ones stay in the name ("Airtab 10 pro xl").
 * A line with no trailing number, such as
 * "Black leather watch 1 and 1 bracelet (TB1)", matches nothing and is reported
 * as unreadable rather than guessed at — which is the right answer, because
 * whether that is one watch or one bracelet is unclear in the message itself.
 */
const DELIVERY_ITEM_LOOSE = /^(.+?)\s+(\d+)\s*(?:\(([^)]*)\))?\s*$/
const DATE_IN_TEXT = /(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{2,4})/

/**
 * Reads a pasted delivery message. The first line mentioning "delivered" is the
 * header: it carries the date and the branch. Every other line is an item.
 * A trailing "(Merchant)" is kept — it is what tells two same-named products apart.
 */
export function parseDeliveryMessage(text: string): DeliveryParse {
  const lines = text.split(/\r?\n/)
  let date = ''
  let branchLabel = ''
  const rows: SheetRow[] = []
  const unparsed: { line: number; text: string }[] = []

  // Collect the item lines first, so the layout can be decided from the message
  // as a whole. Deciding line by line would misread names that contain numbers.
  const items: { index: number; text: string }[] = []

  for (let i = 0; i < lines.length; i++) {
    const cleaned = lines[i].replace(/[*_~]/g, '').trim()
    if (!cleaned) continue

    if (!branchLabel && /deliver/i.test(cleaned)) {
      const d = cleaned.match(DATE_IN_TEXT)
      if (d) date = d[0].replace(/\s+/g, '')
      branchLabel = cleaned
        .replace(DATE_IN_TEXT, '')
        // "products" is optional: headers vary between "ENUGU DELIVERED PRODUCTS"
        // and "Nsukka delivered 21/09/26".
        .replace(/deliver(?:ed|y)?(?:\s*products?)?/i, '')
        .replace(/[:\-–—]/g, ' ')
        .trim()
      continue
    }

    items.push({ index: i, text: cleaned })
  }

  // Whichever layout explains the most lines wins. Ties go to the stricter
  // patterns: the loose one accepts a bare space as the separator, so it can
  // also match a dotted line that happens to have a space, and should only be
  // chosen when it genuinely reads more of the message.
  let lastCount = 0
  let firstCount = 0
  let looseCount = 0
  for (const it of items) {
    if (DELIVERY_ITEM.test(it.text)) lastCount++
    if (DELIVERY_ITEM_QTY_FIRST.test(it.text)) firstCount++
    if (DELIVERY_ITEM_LOOSE.test(it.text)) looseCount++
  }

  let layout: DeliveryLayout = 'quantity-last'
  if (firstCount > lastCount && firstCount >= looseCount) layout = 'quantity-first'
  else if (looseCount > lastCount && looseCount > firstCount) layout = 'quantity-last-loose'

  const pattern =
    layout === 'quantity-first'
      ? DELIVERY_ITEM_QTY_FIRST
      : layout === 'quantity-last-loose'
        ? DELIVERY_ITEM_LOOSE
        : DELIVERY_ITEM

  for (const it of items) {
    const m = it.text.match(pattern)
    const name = layout === 'quantity-first' ? m?.[2] : m?.[1]
    const quantity = layout === 'quantity-first' ? m?.[1] : m?.[2]

    if (m && name && normalize(name)) {
      rows.push({
        row: it.index + 1,
        name: name.trim(),
        merchant: (m[3] || '').trim(),
        branch: branchLabel,
        rawQuantity: Number(quantity),
      })
    } else {
      unparsed.push({ line: it.index + 1, text: it.text })
    }
  }

  // The header may appear after some items; make sure every row carries the branch.
  for (const r of rows) if (!r.branch) r.branch = branchLabel

  return { date, branchLabel, layout, rows, unparsed }
}

export type LooseAmbiguity = {
  row: SheetRow
  /** The product that the line reads as when the trailing number is its name. */
  product: SystemProduct
}

/**
 * Only meaningful for 'quantity-last-loose', where a bare space separates the
 * quantity. "Omega 3" is then either 3 of "Omega" or a product called "Omega 3"
 * whose count was left off, and the message cannot say which.
 *
 * Flags exactly the lines where the second reading names a real product, so a
 * person is asked only when there is something genuine to choose between.
 */
export function looseAmbiguities(
  parse: DeliveryParse,
  products: SystemProduct[]
): LooseAmbiguity[] {
  if (parse.layout !== 'quantity-last-loose') return []

  const index = buildProductIndex(products)
  const out: LooseAmbiguity[] = []

  for (const row of parse.rows) {
    const asName = `${row.name} ${row.rawQuantity}`
    const hit = index.get(productKey(asName))
    if (hit && hit.length > 0) out.push({ row, product: hit[0] })
  }

  return out
}

/**
 * "Did you mean" for rows with no exact product. Display only — never applied
 * automatically, because near-identical names are often genuinely different
 * products ("Prosta Fix capsule" / "Prosta Fix Tea").
 */
export function suggestProduct(row: SheetRow, products: SystemProduct[]): SystemProduct | undefined {
  const k = productKey(row.name)
  if (!k) return undefined

  const kt = new Set(k.split(' '))
  let best: SystemProduct | undefined
  let bestScore = 0

  for (const p of products) {
    const pk = productKey(p.name)
    if (!pk || pk[0] !== k[0]) continue

    let score: number
    const pt = new Set(pk.split(' '))
    if (isSubset(kt, pt) || isSubset(pt, kt)) {
      score = 0.82
    } else {
      if (commonPrefixLength(k, pk) < Math.min(k.length, pk.length) * 0.5) continue
      score = 1 - levenshtein(k, pk) / Math.max(k.length, pk.length)
    }

    if (row.merchant && merchantSimilarity(row.merchant, p.merchantName) >= MERCHANT_MATCH_MIN) {
      score += 0.05
    }

    if (score > bestScore) {
      bestScore = score
      best = p
    }
  }

  return bestScore >= 0.8 ? best : undefined
}

/* ─────────────── new-product intake messages ─────────────── */

/**
 * A different shape from a delivery note: products grouped under the merchant
 * that supplied them.
 *
 *   *‼️NEW PRODUCT RECEIVED IN ENUGU*
 *
 *    *PSF*
 *   20 HAND GRIP BALL
 *   20 FINGER NUMBNESS CREAM
 *
 *    *TNSTORES*
 *   10 SOLAR WALL LAMP
 *
 * The merchant comes from the heading above a run of items rather than from a
 * suffix on each line, which is what makes this worth its own parser.
 */

export type NewProductRow = {
  /** 1-based line number, as pasted. */
  row: number
  name: string
  merchant: string
  quantity: number
}

export type NewProductsParse = {
  branchLabel: string
  date: string
  groups: { merchant: string; rows: NewProductRow[] }[]
  /** Every row, flattened, for callers that do not care about the grouping. */
  rows: NewProductRow[]
  unparsed: { line: number; text: string }[]
}

/** A heading is a whole line wrapped in the asterisks WhatsApp bolds with. */
const BOLD_LINE = /^\*+\s*(.+?)\s*\*+$/
const INTAKE_HEADER = /new\s+product|received\s+in/i

/**
 * True when a pasted message is an intake list rather than a delivery note, so
 * one paste box can take either. Needs both the header and at least one bold
 * merchant heading, because the header alone is not enough to tell them apart.
 */
export function looksLikeNewProducts(text: string): boolean {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!lines.some((l) => INTAKE_HEADER.test(l.replace(/[*_~]/g, '')))) return false
  return lines.slice(1).some((l) => BOLD_LINE.test(l))
}

export function parseNewProductsMessage(text: string): NewProductsParse {
  const lines = text.split(/\r?\n/)
  const groups: { merchant: string; rows: NewProductRow[] }[] = []
  const unparsed: { line: number; text: string }[] = []
  let branchLabel = ''
  let date = ''
  let current: { merchant: string; rows: NewProductRow[] } | null = null

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim()
    if (!raw) continue

    const plain = raw.replace(/[*_~]/g, '').trim()
    if (!plain) continue

    // The header: it names the branch, and may carry a date.
    if (!branchLabel && INTAKE_HEADER.test(plain)) {
      const d = plain.match(DATE_IN_TEXT)
      if (d) date = d[0].replace(/\s+/g, '')

      const after = plain.replace(DATE_IN_TEXT, '').match(/\bin\s+(.+)$/i)
      branchLabel = (after
        ? after[1]
        : plain
            .replace(DATE_IN_TEXT, '')
            .replace(/new\s+product(s)?|received|delivered/gi, '')
      )
        // Drop emoji and punctuation the branch name never contains.
        .replace(/[^\p{L}\p{N}\s'-]/gu, '')
        .trim()
      continue
    }

    // A bold line that is not the header starts a new merchant group.
    if (BOLD_LINE.test(raw)) {
      const merchant = (raw.match(BOLD_LINE)?.[1] || '')
        .replace(/[^\p{L}\p{N}\s'&.-]/gu, '')
        .trim()
      if (merchant) {
        current = { merchant, rows: [] }
        groups.push(current)
        continue
      }
    }

    const m = plain.match(DELIVERY_ITEM_QTY_FIRST)
    const quantity = Number(m?.[1])
    const name = m?.[2]?.trim()

    // An item before any heading has no merchant to attribute it to, and a line
    // that does not read as "<count> <name>" is reported rather than guessed.
    if (!m || !name || !normalize(name) || !Number.isFinite(quantity) || !current) {
      unparsed.push({ line: i + 1, text: plain })
      continue
    }

    current.rows.push({ row: i + 1, name, merchant: current.merchant, quantity })
  }

  return {
    branchLabel,
    date,
    groups: groups.filter((g) => g.rows.length > 0),
    rows: groups.flatMap((g) => g.rows),
    unparsed,
  }
}
