'use client'

/**
 * The daily job: record what went out of a branch today.
 *
 * Built for one thumb on a phone. Pick the branch once, then repeat a short
 * loop — type part of a product name, tap the right one, type how many, add.
 * Everything added so far sits in a list underneath, so the whole delivery can
 * be checked before anything is written.
 *
 * Pasting the delivery message is kept as a second way in: the messages staff
 * already write up get matched against the branch's products and land in the
 * same list, with anything uncertain handed back for a tap.
 *
 * Matching is lib/stock-plan.ts; the writes are lib/stock-apply.ts. Quantities
 * are subtracted from whatever the server holds at write time, not from what
 * this screen last read, so a change made in between is never overwritten.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DM_Mono, Syne } from 'next/font/google'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { getStoredUser } from '@/lib/auth'
import { getBranches } from '@/lib/branches'
import {
  applyUpdate,
  fetchBranchProducts,
  toSystemProduct,
  verifyUpdate,
  type LoadProgress,
} from '@/lib/stock-apply'
import {
  buildPlan,
  normalize,
  parseDeliveryMessage,
  productKey,
  type ProductUpdate,
  type SystemProduct,
} from '@/lib/stock-plan'

const syne = Syne({ subsets: ['latin'] })
const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'] })

/** Section heading: mono caps, the same device the detail panels use. */
const LABEL = 'text-[11px] uppercase tracking-wider text-ink-subtle'
const CARD = 'bg-surface-raised border border-border rounded-xl shadow-[0_1px_2px_rgba(17,24,39,0.04)]'

type Line = { product: SystemProduct; quantity: number }
type Unplaced = { text: string; quantity: number }
type ApplyResult = {
  name: string
  status: 'verified' | 'unverified' | 'failed'
  detail?: string
}

const stockRow = (p: SystemProduct, branchId: string) =>
  p.stocks.find((s) => s.branchId === branchId)

const stockAt = (p: SystemProduct, branchId: string) =>
  stockRow(p, branchId)?.quantity ?? 0

/** Stock pill: red at nothing left, amber at or under the branch's own alert. */
function StockPill({ product, branchId }: { product: SystemProduct; branchId: string }) {
  const row = stockRow(product, branchId)
  const qty = row?.quantity ?? 0
  const alert = row?.lowStockAlert ?? 0

  const tone =
    qty === 0
      ? 'bg-cancelled-bg text-cancelled border-cancelled-border'
      : alert > 0 && qty <= alert
        ? 'bg-amber-muted text-amber-hover border-amber-border'
        : 'bg-surface text-ink-muted border-border'

  return (
    <span
      className={`${mono.className} shrink-0 px-2 py-1 rounded-md border text-[12px] ${tone}`}
    >
      {qty} left
    </span>
  )
}

export default function LogDeliveryPage() {
  /* branch */
  const [branchId, setBranchId] = useState('')
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [branchesLoading, setBranchesLoading] = useState(true)

  /* products for the chosen branch */
  const [products, setProducts] = useState<SystemProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [loaded, setLoaded] = useState<LoadProgress | null>(null)
  const [loadError, setLoadError] = useState('')

  /* the delivery being built */
  const [lines, setLines] = useState<Line[]>([])
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<SystemProduct | null>(null)
  const [qty, setQty] = useState('')
  const [open, setOpen] = useState(false)

  /* paste mode */
  const [mode, setMode] = useState<'type' | 'paste'>('type')
  const [pasteText, setPasteText] = useState('')
  const [unplaced, setUnplaced] = useState<Unplaced[]>([])

  /* writing */
  const [applying, setApplying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [savingName, setSavingName] = useState('')
  const [results, setResults] = useState<ApplyResult[] | null>(null)

  const qtyRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  /* ─────────── loading ─────────── */

  useEffect(() => {
    const mine = getStoredUser()?.branchId || ''
    if (mine) setBranchId(mine)

    getBranches()
      .then((bs) => setBranches(bs.map((b) => ({ id: b.id, name: b.name }))))
      .catch(() => {})
      .finally(() => setBranchesLoading(false))
  }, [])

  const loadProducts = useCallback(async (bid: string) => {
    setProductsLoading(true)
    setLoadError('')
    setProducts([])
    setLoaded(null)
    try {
      // Each page is pushed into state as it arrives, so the search box starts
      // working on page one instead of after the last one.
      await fetchBranchProducts(bid, (list, progress) => {
        setProducts(list.map(toSystemProduct))
        setLoaded(progress)
      })
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load products')
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (branchId) loadProducts(branchId)
  }, [branchId, loadProducts])

  const branchName =
    branches.find((b) => b.id === branchId)?.name || (branchId ? 'your branch' : '')

  /* ─────────── search ─────────── */

  const matches = useMemo(() => {
    const q = normalize(query)
    if (!q) return []
    const key = productKey(query)
    return products
      .filter(
        (p) =>
          normalize(p.name).includes(q) ||
          productKey(p.name).includes(key) ||
          normalize(p.merchantName).includes(q)
      )
      .sort((a, b) => {
        // Names that start with what was typed come first — nearly always the
        // one being looked for.
        const as = normalize(a.name).startsWith(q) ? 0 : 1
        const bs = normalize(b.name).startsWith(q) ? 0 : 1
        return as - bs || a.name.localeCompare(b.name)
      })
      .slice(0, 8)
  }, [query, products])

  const pick = (p: SystemProduct) => {
    setPicked(p)
    setOpen(false)
    setQuery('')
    setQty('')
    // Straight to the number — it is the only thing left to say.
    requestAnimationFrame(() => qtyRef.current?.focus())
  }

  /** The same product twice is one line: two deliveries of it, summed. */
  const addLine = (product: SystemProduct, quantity: number) => {
    setLines((cur) => {
      const at = cur.findIndex((l) => l.product.id === product.id)
      if (at === -1) return [...cur, { product, quantity }]
      const next = [...cur]
      next[at] = { ...next[at], quantity: next[at].quantity + quantity }
      return next
    })
  }

  const commit = () => {
    const n = parseInt(qty, 10)
    if (!picked || !Number.isFinite(n) || n <= 0) return
    addLine(picked, n)
    setPicked(null)
    setQty('')
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const removeLine = (id: string) =>
    setLines((cur) => cur.filter((l) => l.product.id !== id))

  /* ─────────── paste ─────────── */

  const absorbPaste = () => {
    if (!pasteText.trim() || !branchId) return
    const parse = parseDeliveryMessage(pasteText)
    const rows = parse.rows.map((r) => ({ ...r, branch: branchName || 'branch' }))
    const plan = buildPlan(
      rows,
      { [normalize(branchName || 'branch')]: branchId },
      products,
      'deduct'
    )

    const byId = new Map(products.map((p) => [p.id, p]))
    const stillOpen: Unplaced[] = []

    for (const o of plan.outcomes) {
      const n = Number(o.row.rawQuantity)
      const product = o.productId ? byId.get(o.productId) : undefined
      if (o.status === 'update' && product && Number.isFinite(n) && n > 0) {
        addLine(product, n)
      } else {
        stillOpen.push({ text: o.row.name, quantity: Number.isFinite(n) ? n : 0 })
      }
    }
    for (const u of parse.unparsed) stillOpen.push({ text: u.text, quantity: 0 })

    setUnplaced(stillOpen)
    setPasteText('')
    setMode('type')
  }

  /* ─────────── write ─────────── */

  const updates: ProductUpdate[] = useMemo(
    () =>
      lines.map((l) => {
        const before = stockAt(l.product, branchId)
        const after = Math.max(0, before - l.quantity)
        return {
          product: l.product,
          targets: { [branchId]: after },
          deltas: { [branchId]: l.quantity },
          changes: [
            {
              branchId,
              before,
              after,
              delta: l.quantity,
              shortfall: l.quantity > before,
              rows: [],
            },
          ],
        }
      }),
    [lines, branchId]
  )

  const apply = async () => {
    if (updates.length === 0) return
    setApplying(true)
    setProgress(0)
    const out: ApplyResult[] = []

    // One at a time: a phone on mobile data is the normal case here, and each
    // write re-reads its product first.
    for (const u of updates) {
      setSavingName(u.product.name)
      try {
        const expected = await applyUpdate(u)
        const ok = await verifyUpdate(u.product.id, expected)
        out.push({
          name: u.product.name,
          status: ok ? 'verified' : 'unverified',
          detail: ok ? undefined : 'Written, but the value read back did not match',
        })
      } catch (err) {
        out.push({
          name: u.product.name,
          status: 'failed',
          detail: err instanceof Error ? err.message : 'Write failed',
        })
      }
      setProgress((p) => p + 1)
    }

    setResults(out)
    setApplying(false)
    setSavingName('')
    loadProducts(branchId)
  }

  const reset = () => {
    setLines([])
    setUnplaced([])
    setPicked(null)
    setQuery('')
    setQty('')
    setResults(null)
    setProgress(0)
  }

  const totalUnits = lines.reduce((s, l) => s + l.quantity, 0)
  const shortfalls = updates.filter((u) => u.changes[0].shortfall).length
  const busy = branchesLoading || productsLoading

  /* ─────────── results ─────────── */

  if (results) {
    const ok = results.filter((r) => r.status === 'verified')
    const bad = results.filter((r) => r.status !== 'verified')

    return (
      <div className="max-w-xl mx-auto flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
              bad.length === 0
                ? 'bg-delivered-bg border border-delivered-border'
                : 'bg-amber-muted border border-amber-border'
            }`}
          >
            {bad.length === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-delivered" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-hover" />
            )}
          </div>
          <div>
            <h1 className={`${syne.className} text-[24px] leading-tight font-bold text-ink`}>
              {bad.length === 0 ? 'Delivery logged' : 'Logged with problems'}
            </h1>
            <p className="text-[13.5px] text-ink-muted mt-0.5">
              <span className={mono.className}>
                {ok.length}/{results.length}
              </span>{' '}
              confirmed · {branchName}
            </p>
          </div>
        </div>

        {ok.length > 0 && (
          <div className={`${CARD} divide-y divide-border overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-2 bg-delivered-bg">
              <Check className="w-3.5 h-3.5 text-delivered shrink-0" />
              <span className="text-[12.5px] font-medium text-ink">
                Deducted and read back
              </span>
              <span className={`${mono.className} ml-auto text-[12.5px] text-ink-muted`}>
                {ok.length}
              </span>
            </div>
            {ok.map((r, i) => (
              <div key={i} className="px-4 py-2.5 text-[14.5px] text-ink truncate">
                {r.name}
              </div>
            ))}
          </div>
        )}

        {bad.length > 0 && (
          <div className={`${CARD} divide-y divide-border overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-2 bg-cancelled-bg">
              <AlertTriangle className="w-3.5 h-3.5 text-cancelled shrink-0" />
              <span className="text-[12.5px] font-medium text-ink">Needs another look</span>
              <span className={`${mono.className} ml-auto text-[12.5px] text-cancelled`}>
                {bad.length}
              </span>
            </div>
            {bad.map((r, i) => (
              <div key={i} className="px-4 py-3 border-l-2 border-l-cancelled">
                <div className="text-[14.5px] text-ink font-medium">{r.name}</div>
                <div className="text-[12.5px] text-cancelled mt-0.5">{r.detail}</div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={reset}
          className={`${syne.className} h-12 rounded-xl bg-amber text-white text-[15px] font-bold active:bg-amber-hover transition`}
        >
          Log another delivery
        </button>
      </div>
    )
  }

  /* ─────────── compose ─────────── */

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 pb-32">
      <div>
        <h1 className={`${syne.className} text-[26px] leading-tight font-bold text-ink`}>
          Log Delivery
        </h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">
          What went out of the branch today
        </p>
      </div>

      {/* context: branch, and what is loaded for it */}
      <div className={CARD}>
        <div className="relative">
          <select
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value)
              reset()
            }}
            disabled={branchesLoading && branches.length === 0}
            className={`${syne.className} w-full h-14 pl-4 pr-11 appearance-none bg-transparent rounded-xl text-[17px] font-bold text-ink outline-none disabled:opacity-60`}
          >
            {branchId && branches.length === 0 && (
              <option value={branchId}>
                {branchesLoading ? 'Loading branches...' : 'Your branch'}
              </option>
            )}
            {!branchId && branches.length === 0 && <option value="">Loading branches...</option>}
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4.5 h-4.5 text-ink-subtle absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="px-4 py-2.5 border-t border-border">
          {productsLoading ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] text-ink-muted">
                  {products.length > 0 ? 'Still loading products' : 'Loading products'}
                </span>
                <span className={`${mono.className} text-[12px] text-ink-subtle`}>
                  {loaded
                    ? `${loaded.loaded}${loaded.lastPage > 1 ? ` · ${loaded.page}/${loaded.lastPage}` : ''}`
                    : ''}
                </span>
              </div>
              <div className="h-[3px] mt-2 rounded-full bg-border overflow-hidden">
                {loaded ? (
                  <div
                    className="h-full bg-amber rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${Math.max(6, Math.round((loaded.page / Math.max(1, loaded.lastPage)) * 100))}%`,
                    }}
                  />
                ) : (
                  // Nothing has come back yet, so there is no fraction to show.
                  <div className="h-full w-1/3 bg-amber/60 rounded-full animate-pulse" />
                )}
              </div>
              {products.length > 0 && (
                <p className="text-[11.5px] text-ink-subtle mt-1.5">
                  You can start typing — the rest are still arriving
                </p>
              )}
            </>
          ) : (
            <span className="text-[12.5px] text-ink-subtle">
              <span className={mono.className}>{products.length}</span> product
              {products.length === 1 ? '' : 's'} stocked here
            </span>
          )}
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-cancelled-bg border border-cancelled-border">
          <AlertTriangle className="w-5 h-5 text-cancelled shrink-0" />
          <div className="flex-1">
            <p className="text-[14px] text-ink">{loadError}</p>
            <button
              onClick={() => loadProducts(branchId)}
              className="mt-2 h-10 px-3.5 rounded-lg bg-surface-raised border border-border text-[13px] font-medium text-ink active:bg-surface"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* add an item */}
      {!picked ? (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className={`${mono.className} ${LABEL}`}>Add item</span>
            <button
              onClick={() => setMode(mode === 'type' ? 'paste' : 'type')}
              className="text-[12.5px] font-medium text-amber-hover"
            >
              {mode === 'type' ? 'Paste a message' : 'Type items'}
            </button>
          </div>

          {mode === 'paste' ? (
            <div className={`${CARD} overflow-hidden`}>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={7}
                disabled={busy}
                className={`${mono.className} w-full px-4 py-3.5 bg-transparent outline-none text-base text-ink placeholder:text-ink-subtle leading-relaxed resize-y`}
                placeholder={'*Nsukka delivered 21/09/26*\n4 Kreain gel\n7 Moadop eye care tea'}
              />
              <button
                onClick={absorbPaste}
                disabled={!pasteText.trim() || busy}
                className="w-full h-12 border-t border-border text-[15px] font-semibold text-ink disabled:text-ink-subtle active:bg-surface"
              >
                Read this message
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="w-4.5 h-4.5 text-ink-subtle absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                disabled={products.length === 0}
                className="w-full h-14 pl-11 pr-11 bg-surface-raised border border-border rounded-xl text-base text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border placeholder:text-ink-subtle disabled:opacity-60 shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
                placeholder={
                  products.length > 0
                    ? 'Type a product name'
                    : productsLoading
                      ? 'Loading products...'
                      : 'No products at this branch'
                }
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    searchRef.current?.focus()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-ink-subtle active:bg-surface"
                  aria-label="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* picker: full width, so it can never run off a phone screen */}
              {open && query.trim() !== '' && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 bg-surface-raised border border-border rounded-xl shadow-[0_12px_28px_-8px_rgba(17,24,39,0.18)] overflow-hidden">
                  {matches.length === 0 ? (
                    <div className="px-4 py-5 text-center">
                      <p className="text-[14px] text-ink">No match at {branchName}</p>
                      <p className="text-[12.5px] text-ink-subtle mt-0.5">
                        Nothing here is called &ldquo;{query.trim()}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[50vh] overflow-y-auto overscroll-contain divide-y divide-border">
                      {matches.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => pick(p)}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-surface"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[15px] text-ink font-medium truncate">
                              {p.name}
                            </div>
                            <div className="text-[12.5px] text-ink-subtle truncate">
                              {p.merchantName || 'No merchant'}
                            </div>
                          </div>
                          <StockPill product={p} branchId={branchId} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* quantity step — one product, one number */
        <div>
          <div className={`${mono.className} ${LABEL} mb-2`}>How many went out?</div>
          <div className="rounded-xl bg-amber-muted border border-amber-border overflow-hidden">
            <div className="flex items-start gap-3 px-4 pt-4 pb-3">
              <div className="flex-1 min-w-0">
                <div className="text-[16.5px] text-ink font-semibold leading-snug">
                  {picked.name}
                </div>
                <div className="text-[12.5px] text-ink-muted mt-0.5">
                  {picked.merchantName || 'No merchant'}
                </div>
              </div>
              <StockPill product={picked} branchId={branchId} />
              <button
                onClick={() => {
                  setPicked(null)
                  setQty('')
                }}
                className="w-10 h-10 -mt-2 -mr-2 shrink-0 rounded-lg flex items-center justify-center text-ink-subtle active:bg-amber-border/30"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-stretch gap-2 px-4 pb-4">
              <input
                ref={qtyRef}
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && commit()}
                type="text"
                inputMode="numeric"
                className={`${mono.className} w-24 h-13 min-h-12 px-3 bg-surface-raised border border-border-strong rounded-xl text-center text-[22px] font-medium text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border`}
                placeholder="0"
              />
              <button
                onClick={commit}
                disabled={!qty || parseInt(qty, 10) <= 0}
                className={`${syne.className} flex-1 h-13 min-h-12 rounded-xl bg-ink text-white text-[15px] font-bold flex items-center justify-center gap-1.5 disabled:bg-border-strong disabled:text-ink-subtle active:opacity-90 transition`}
              >
                <Plus className="w-4 h-4" />
                Add to list
              </button>
            </div>

            {qty && parseInt(qty, 10) > stockAt(picked, branchId) && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-raised border-t border-amber-border">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-hover shrink-0" />
                <span className="text-[12.5px] text-ink">
                  More than the{' '}
                  <span className={mono.className}>{stockAt(picked, branchId)}</span> in stock —
                  this will go to <span className={mono.className}>0</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* lines the paste could not place */}
      {unplaced.length > 0 && (
        <div className={`${CARD} overflow-hidden`}>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-muted border-b border-amber-border">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-hover shrink-0" />
            <span className="text-[12.5px] font-medium text-ink">
              Not matched
              <span className={`${mono.className} text-ink-muted`}> · {unplaced.length}</span>
            </span>
            <button
              onClick={() => setUnplaced([])}
              className="ml-auto text-[12.5px] font-medium text-ink-subtle"
            >
              Dismiss
            </button>
          </div>
          {/* Capped with its own scroll, like the parcel panel's version. */}
          <div className="max-h-[38vh] overflow-y-auto overscroll-contain divide-y divide-border">
            {unplaced.map((u, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] text-ink truncate">{u.text}</div>
                  {u.quantity > 0 && (
                    <div className={`${mono.className} text-[12px] text-ink-subtle`}>
                      {u.quantity} units
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setMode('type')
                    setQuery(u.text)
                    setOpen(true)
                    setUnplaced((cur) => cur.filter((_, j) => j !== i))
                    requestAnimationFrame(() => searchRef.current?.focus())
                  }}
                  className="h-10 px-3.5 shrink-0 rounded-lg border border-border text-[12.5px] font-medium text-ink active:bg-surface"
                >
                  Find
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* the delivery so far */}
      {lines.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className={`${mono.className} ${LABEL}`}>This delivery</span>
            <span className={`${mono.className} text-[12px] text-ink-subtle`}>
              {lines.length} product{lines.length === 1 ? '' : 's'} · {totalUnits} units
            </span>
          </div>

          <div className={`${CARD} divide-y divide-border overflow-hidden`}>
            {updates.map((u) => {
              const c = u.changes[0]
              return (
                <div
                  key={u.product.id}
                  className={`flex items-center gap-3 pl-4 pr-2 py-3 ${
                    c.shortfall ? 'bg-amber-muted border-l-2 border-l-amber' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] text-ink font-medium truncate">
                      {u.product.name}
                    </div>
                    <div className={`${mono.className} text-[12px] text-ink-subtle mt-0.5`}>
                      {c.before} → {c.after}
                      {c.shortfall && (
                        <span className="text-amber-hover">
                          {' '}· over by {(c.delta ?? 0) - (c.before ?? 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`${mono.className} text-[19px] font-medium shrink-0 ${
                      c.shortfall ? 'text-amber-hover' : 'text-ink'
                    }`}
                  >
                    −{c.delta}
                  </div>

                  <button
                    onClick={() => removeLine(u.product.id)}
                    className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-ink-subtle active:bg-surface"
                    aria-label={`Remove ${u.product.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* empty state — spells out the loop */}
      {lines.length === 0 && !picked && !busy && !loadError && (
        <div className="rounded-xl border border-dashed border-border-strong px-5 py-6">
          <p className="text-[14.5px] text-ink font-medium mb-3">Nothing added yet</p>
          <ol className="flex flex-col gap-2.5">
            {['Type part of a product name', 'Tap the right one', 'Enter how many went out'].map(
              (step, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span
                    className={`${mono.className} w-5 h-5 shrink-0 rounded-md bg-surface border border-border flex items-center justify-center text-[11px] text-ink-muted`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[13.5px] text-ink-muted">{step}</span>
                </li>
              )
            )}
          </ol>
        </div>
      )}

      {/* confirm */}
      {lines.length > 0 && (
        <div
          className="fixed left-0 right-0 bottom-0 px-4 pt-3 bg-surface-raised/95 backdrop-blur border-t border-border lg:pl-[266px]"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {applying && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-border">
              <div
                className="h-full bg-amber transition-[width] duration-300"
                style={{ width: `${(progress / updates.length) * 100}%` }}
              />
            </div>
          )}

          <div className="max-w-xl mx-auto">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              {applying ? (
                <span className="text-[12px] text-ink-muted truncate">
                  {savingName || 'Starting...'}
                </span>
              ) : (
                <span className={`${mono.className} text-[12px] text-ink-muted`}>
                  {totalUnits} units off {branchName}
                </span>
              )}
              {applying ? (
                <span className={`${mono.className} text-[12px] text-ink-subtle shrink-0`}>
                  {progress}/{updates.length}
                </span>
              ) : (
                shortfalls > 0 && (
                  <span className={`${mono.className} text-[12px] text-amber-hover shrink-0`}>
                    {shortfalls} over stock
                  </span>
                )
              )}
            </div>
            <button
              onClick={apply}
              disabled={applying}
              className={`${syne.className} w-full h-13 min-h-12 rounded-xl text-white text-[16px] font-bold flex items-center justify-center gap-2 transition ${
                applying ? 'bg-ink-subtle' : 'bg-amber active:bg-amber-hover'
              }`}
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving {progress} of {updates.length}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Deduct {lines.length} product{lines.length === 1 ? '' : 's'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
