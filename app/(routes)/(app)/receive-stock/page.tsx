'use client'

/**
 * The other half of the day: record what came IN to a branch.
 *
 * Same loop as Log Delivery — type part of a name, tap it, say how many — with
 * one addition: a product that is not in the system yet can be created right
 * here, and so can its merchant, because new stock routinely arrives from a
 * merchant nobody has entered before. Stopping to go and create a merchant on
 * another screen is what made that case painful.
 *
 * Existing products are increased on top of whatever the server holds at write
 * time (lib/stock-apply.ts), not on top of what this screen last read.
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
  Sparkles,
  X,
} from 'lucide-react'
import { getStoredUser } from '@/lib/auth'
import { getBranches } from '@/lib/branches'
import { createProduct } from '@/lib/products'
import { createMerchant, getAllMerchants } from '@/lib/merchants'
import {
  applyStockIncrease,
  fetchBranchProducts,
  toSystemProduct,
  verifyUpdate,
  type LoadProgress,
} from '@/lib/stock-apply'
import {
  buildPlan,
  buildProductIndex,
  looksLikeNewProducts,
  looseAmbiguities,
  normalize,
  parseDeliveryMessage,
  parseNewProductsMessage,
  productKey,
  type SystemProduct,
} from '@/lib/stock-plan'

const syne = Syne({ subsets: ['latin'] })
const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'] })

const LABEL = 'text-[11px] uppercase tracking-wider text-ink-subtle'
const CARD =
  'bg-surface-raised border border-border rounded-xl shadow-[0_1px_2px_rgba(17,24,39,0.04)]'

/** Same palette the merchants panel offers, so new merchants look native. */
const MERCHANT_COLORS = [
  '#2563eb', '#d97706', '#059669', '#0891b2', '#4f46e5',
  '#7c3aed', '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
]

type Merchant = { id: string; name: string }

/** A line in the list: either more of something known, or something brand new. */
type Line =
  | { kind: 'existing'; product: SystemProduct; quantity: number }
  | {
      kind: 'new'
      tempId: string
      name: string
      merchant: Merchant | { newName: string }
      quantity: number
    }

type Unplaced = {
  id: string
  text: string
  quantity: number
  note?: string
  /** Merchant named in the message, carried so Create can prefill it. */
  merchant?: string
}

/** Entries are built without ids, then stamped when they go into state. */
type DraftUnplaced = Omit<Unplaced, 'id'>

const withIds = (drafts: DraftUnplaced[]): Unplaced[] =>
  drafts.map((u, i) => ({ ...u, id: `${Date.now()}-${i}` }))

type ApplyResult = {
  name: string
  status: 'verified' | 'unverified' | 'failed'
  detail?: string
}

const stockAt = (p: SystemProduct, branchId: string) =>
  p.stocks.find((s) => s.branchId === branchId)?.quantity ?? 0

const lineName = (l: Line) => (l.kind === 'existing' ? l.product.name : l.name)

const merchantLabel = (m: Merchant | { newName: string }) =>
  'newName' in m ? m.newName : m.name

export default function ReceiveStockPage() {
  /* branch */
  const [branchId, setBranchId] = useState('')
  const [branches, setBranches] = useState<Merchant[]>([])
  const [branchesLoading, setBranchesLoading] = useState(true)

  /* catalogue */
  const [products, setProducts] = useState<SystemProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [loaded, setLoaded] = useState<LoadProgress | null>(null)
  const [loadError, setLoadError] = useState('')
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [merchantsLoading, setMerchantsLoading] = useState(true)

  /* the receipt being built */
  const [lines, setLines] = useState<Line[]>([])
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<SystemProduct | null>(null)
  const [qty, setQty] = useState('')
  const [open, setOpen] = useState(false)

  /* creating a product that is not in the system */
  const [creating, setCreating] = useState<{ name: string; quantity: string } | null>(null)
  const [merchantQuery, setMerchantQuery] = useState('')
  const [merchantPick, setMerchantPick] = useState<Merchant | { newName: string } | null>(null)
  const [merchantOpen, setMerchantOpen] = useState(false)

  /* paste */
  const [mode, setMode] = useState<'type' | 'paste'>('type')
  const [pasteText, setPasteText] = useState('')
  const [unplaced, setUnplaced] = useState<Unplaced[]>([])
  // The entry a Find or Create was started from. It stays in the list until a
  // line is actually added, so backing out of the search never loses it.
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  // The count the message gave for that entry, carried into the quantity box
  // so a found product does not have to have its number retyped.
  const [resolvingQty, setResolvingQty] = useState('')

  /* writing */
  const [applying, setApplying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [savingName, setSavingName] = useState('')
  const [results, setResults] = useState<ApplyResult[] | null>(null)

  const qtyRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const newQtyRef = useRef<HTMLInputElement>(null)

  /* ─────────── loading ─────────── */

  const loadMerchants = useCallback(() => {
    setMerchantsLoading(true)
    return getAllMerchants()
      .then((ms) => setMerchants(ms.map((m) => ({ id: m.id, name: m.name }))))
      .catch(() => {})
      .finally(() => setMerchantsLoading(false))
  }, [])

  useEffect(() => {
    const mine = getStoredUser()?.branchId || ''
    if (mine) setBranchId(mine)

    getBranches()
      .then((bs) => setBranches(bs.map((b) => ({ id: b.id, name: b.name }))))
      .catch(() => {})
      .finally(() => setBranchesLoading(false))

    loadMerchants()
  }, [loadMerchants])

  const loadProducts = useCallback(async (bid: string) => {
    setProductsLoading(true)
    setLoadError('')
    setProducts([])
    setLoaded(null)
    try {
      await fetchBranchProducts(bid, (list, p) => {
        setProducts(list.map(toSystemProduct))
        setLoaded(p)
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

  const branchName = branches.find((b) => b.id === branchId)?.name || ''

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
        const as = normalize(a.name).startsWith(q) ? 0 : 1
        const bs = normalize(b.name).startsWith(q) ? 0 : 1
        return as - bs || a.name.localeCompare(b.name)
      })
      .slice(0, 8)
  }, [query, products])

  const merchantMatches = useMemo(() => {
    const q = normalize(merchantQuery)
    if (!q) return merchants.slice(0, 8)
    return merchants.filter((m) => normalize(m.name).includes(q)).slice(0, 8)
  }, [merchantQuery, merchants])

  /** An exact merchant name already on file — so we never create a duplicate. */
  const merchantExactMatch = useMemo(
    () => merchants.find((m) => normalize(m.name) === normalize(merchantQuery)),
    [merchantQuery, merchants]
  )

  /* ─────────── building the list ─────────── */

  const addExisting = (product: SystemProduct, quantity: number) =>
    setLines((cur) => {
      const at = cur.findIndex((l) => l.kind === 'existing' && l.product.id === product.id)
      if (at === -1) return [...cur, { kind: 'existing', product, quantity }]
      const next = [...cur]
      const prev = next[at] as Extract<Line, { kind: 'existing' }>
      next[at] = { ...prev, quantity: prev.quantity + quantity }
      return next
    })

  const pick = (p: SystemProduct) => {
    setPicked(p)
    setOpen(false)
    setQuery('')
    setQty(resolvingId ? resolvingQty : '')
    // Selected, not just focused: the number is pre-filled, so typing should
    // replace it rather than append to it.
    requestAnimationFrame(() => {
      qtyRef.current?.focus()
      qtyRef.current?.select()
    })
  }

  /** Drops the entry a Find/Create came from, now that it has been dealt with. */
  const clearResolved = () => {
    if (!resolvingId) return
    setUnplaced((cur) => cur.filter((u) => u.id !== resolvingId))
    setResolvingId(null)
    setResolvingQty('')
  }

  const commit = () => {
    const n = parseInt(qty, 10)
    if (!picked || !Number.isFinite(n) || n <= 0) return
    addExisting(picked, n)
    clearResolved()
    setPicked(null)
    setQty('')
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const startCreate = (name: string, quantity = '', merchantName?: string) => {
    setCreating({ name, quantity })
    setOpen(false)
    setQuery('')
    setMerchantQuery('')
    setMerchantOpen(false)
    // A merchant named in the message is matched to one on file, or offered as
    // a new one — either way it is pre-filled rather than retyped.
    if (merchantName) {
      const known = merchants.find((m) => normalize(m.name) === normalize(merchantName))
      setMerchantPick(known ?? { newName: merchantName })
    } else {
      setMerchantPick(null)
    }
    requestAnimationFrame(() => newQtyRef.current?.focus())
  }

  const commitNew = () => {
    if (!creating) return
    const n = parseInt(creating.quantity, 10)
    if (!creating.name.trim() || !merchantPick || !Number.isFinite(n) || n <= 0) return

    setLines((cur) => [
      ...cur,
      {
        kind: 'new',
        tempId: `${Date.now()}-${cur.length}`,
        name: creating.name.trim(),
        merchant: merchantPick,
        quantity: n,
      },
    ])
    clearResolved()
    setCreating(null)
    setMerchantPick(null)
    setMerchantQuery('')
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const removeLine = (key: string) =>
    setLines((cur) =>
      cur.filter((l) => (l.kind === 'existing' ? l.product.id : l.tempId) !== key)
    )

  /* ─────────── paste ─────────── */

  /**
   * An intake list: products grouped under the merchant that supplied them.
   * Anything already on file is treated as more stock arriving; the rest are
   * queued as new products, with their merchant matched by name or created.
   */
  const absorbIntake = () => {
    const parse = parseNewProductsMessage(pasteText)
    const index = buildProductIndex(products)
    const stillOpen: DraftUnplaced[] = []

    for (const r of parse.rows) {
      const hit = index.get(productKey(r.name)) || []

      if (hit.length === 1) {
        addExisting(hit[0], r.quantity)
        continue
      }

      // Everything else is handed back rather than created. A message saying
      // "new product" is not proof that it is one — names are often misspelt,
      // and creating on that basis quietly duplicates an existing product.
      stillOpen.push({
        text: r.name,
        quantity: r.quantity,
        merchant: r.merchant,
        note:
          hit.length > 1
            ? `${hit.length} products share this name`
            : `not on file · ${r.merchant}`,
      })
    }

    for (const u of parse.unparsed) stillOpen.push({ text: u.text, quantity: 0 })

    setUnplaced(withIds(stillOpen))
    setResolvingId(null)
    setPasteText('')
    setMode('type')
  }

  const absorbPaste = () => {
    if (!pasteText.trim() || !branchId) return
    if (looksLikeNewProducts(pasteText)) {
      absorbIntake()
      return
    }
    const label = branchName || 'branch'
    const parse = parseDeliveryMessage(pasteText)
    const plan = buildPlan(
      parse.rows.map((r) => ({ ...r, branch: label })),
      { [normalize(label)]: branchId },
      products,
      'deduct'
    )

    const byId = new Map(products.map((p) => [p.id, p]))
    const stillOpen: DraftUnplaced[] = []

    // A line like "Omega 3" may be 3 of "Omega" or a product called "Omega 3"
    // with no count. Never guess: hand those back to be added by hand.
    const unsure = new Map(
      looseAmbiguities(parse, products).map((a) => [a.row.row, a.product.name])
    )

    for (const o of plan.outcomes) {
      const n = Number(o.row.rawQuantity)
      const product = o.productId ? byId.get(o.productId) : undefined
      const other = unsure.get(o.row.row)

      if (other) {
        stillOpen.push({
          text: `${o.row.name} ${o.row.rawQuantity}`,
          quantity: 0,
          note: `could be ${n} × "${o.row.name}" or the product "${other}"`,
        })
      } else if (o.status === 'update' && product && Number.isFinite(n) && n > 0) {
        addExisting(product, n)
      } else {
        stillOpen.push({ text: o.row.name, quantity: Number.isFinite(n) ? n : 0 })
      }
    }
    for (const u of parse.unparsed) stillOpen.push({ text: u.text, quantity: 0 })

    setUnplaced(withIds(stillOpen))
    setResolvingId(null)
    setPasteText('')
    setMode('type')
  }

  /* ─────────── write ─────────── */

  const apply = async () => {
    if (lines.length === 0) return
    setApplying(true)
    setProgress(0)
    const out: ApplyResult[] = []

    // Merchants created during this run, so two new products from the same new
    // merchant share one record instead of creating it twice.
    const createdMerchants = new Map<string, string>()

    for (const l of lines) {
      setSavingName(lineName(l))
      try {
        if (l.kind === 'existing') {
          const expected = await applyStockIncrease(l.product.id, branchId, l.quantity)
          const ok = await verifyUpdate(l.product.id, expected)
          out.push({
            name: l.product.name,
            status: ok ? 'verified' : 'unverified',
            detail: ok ? undefined : 'Written, but the value read back did not match',
          })
        } else {
          let merchantId: string
          if ('newName' in l.merchant) {
            const key = normalize(l.merchant.newName)
            const already = createdMerchants.get(key)
            if (already) {
              merchantId = already
            } else {
              const made = await createMerchant({
                name: l.merchant.newName,
                color: MERCHANT_COLORS[createdMerchants.size % MERCHANT_COLORS.length],
                status: 'ACTIVE',
              })
              merchantId = made.id
              createdMerchants.set(key, made.id)
            }
          } else {
            merchantId = l.merchant.id
          }

          const made = await createProduct({
            name: l.name,
            merchantId,
            branches: [{ branchId, quantity: l.quantity, lowStockAlert: 0 }],
          })
          const ok = await verifyUpdate(made.id, { [branchId]: l.quantity })
          out.push({
            name: l.name,
            status: ok ? 'verified' : 'unverified',
            detail: ok ? undefined : 'Created, but the stock read back did not match',
          })
        }
      } catch (err) {
        out.push({
          name: lineName(l),
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
    if (createdMerchants.size > 0) loadMerchants()
  }

  const reset = () => {
    setLines([])
    setUnplaced([])
    setPicked(null)
    setCreating(null)
    setResolvingId(null)
    setResolvingQty('')
    setMerchantPick(null)
    setMerchantQuery('')
    setQuery('')
    setQty('')
    setResults(null)
    setProgress(0)
  }

  const totalUnits = lines.reduce((s, l) => s + l.quantity, 0)
  const newCount = lines.filter((l) => l.kind === 'new').length
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
              {bad.length === 0 ? 'Stock received' : 'Received with problems'}
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
              <span className="text-[12.5px] font-medium text-ink">Added and read back</span>
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
          Receive more stock
        </button>
      </div>
    )
  }

  /* ─────────── compose ─────────── */

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 pb-32">
      <div>
        <h1 className={`${syne.className} text-[26px] leading-tight font-bold text-ink`}>
          Receive Stock
        </h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">What arrived at the branch</p>
      </div>

      {/* branch */}
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
                  <div className="h-full w-1/3 bg-amber/60 rounded-full animate-pulse" />
                )}
              </div>
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

      {/* ─── add ─── */}
      {creating ? (
        <NewProductCard
          creating={creating}
          setCreating={setCreating}
          merchantQuery={merchantQuery}
          setMerchantQuery={setMerchantQuery}
          merchantPick={merchantPick}
          setMerchantPick={setMerchantPick}
          merchantOpen={merchantOpen}
          setMerchantOpen={setMerchantOpen}
          merchantMatches={merchantMatches}
          merchantExactMatch={merchantExactMatch}
          merchantsLoading={merchantsLoading}
          onCancel={() => {
            setCreating(null)
            setMerchantPick(null)
            setResolvingId(null)
            setResolvingQty('')
          }}
          onAdd={commitNew}
          qtyRef={newQtyRef}
        />
      ) : picked ? (
        <div>
          <div className={`${mono.className} ${LABEL} mb-2`}>How many arrived?</div>
          <div className="rounded-xl bg-amber-muted border border-amber-border overflow-hidden">
            <div className="flex items-start gap-3 px-4 pt-4 pb-3">
              <div className="flex-1 min-w-0">
                <div className="text-[16.5px] text-ink font-semibold leading-snug">
                  {picked.name}
                </div>
                <div className="text-[12.5px] text-ink-muted mt-0.5">
                  {picked.merchantName || 'No merchant'} ·{' '}
                  <span className={mono.className}>{stockAt(picked, branchId)}</span> here now
                </div>
              </div>
              <button
                onClick={() => {
                  setPicked(null)
                  setQty('')
                  setResolvingId(null)
                  setResolvingQty('')
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
                className={`${mono.className} w-24 h-12 px-3 bg-surface-raised border border-border-strong rounded-xl text-center text-[22px] font-medium text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border`}
                placeholder="0"
              />
              <button
                onClick={commit}
                disabled={!qty || parseInt(qty, 10) <= 0}
                className={`${syne.className} flex-1 h-12 rounded-xl bg-ink text-white text-[15px] font-bold flex items-center justify-center gap-1.5 disabled:bg-border-strong disabled:text-ink-subtle active:opacity-90`}
              >
                <Plus className="w-4 h-4" />
                Add to list
              </button>
            </div>
          </div>
        </div>
      ) : (
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
                placeholder={
                  'A delivery list:\n4 Kreain gel\n7 Moadop eye care tea\n\nOr new products:\n*PSF*\n20 HAND GRIP BALL'
                }
              />
              <button
                onClick={absorbPaste}
                disabled={!pasteText.trim() || busy || merchantsLoading}
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
                className="w-full h-14 pl-11 pr-11 bg-surface-raised border border-border rounded-xl text-base text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border placeholder:text-ink-subtle shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
                placeholder={productsLoading ? 'Loading products...' : 'Type a product name'}
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

              {open && query.trim() !== '' && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 bg-surface-raised border border-border rounded-xl shadow-[0_12px_28px_-8px_rgba(17,24,39,0.18)] overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto overscroll-contain divide-y divide-border">
                    {matches.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => pick(p)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-surface"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[15px] text-ink font-medium truncate">{p.name}</div>
                          <div className="text-[12.5px] text-ink-subtle truncate">
                            {p.merchantName || 'No merchant'}
                          </div>
                        </div>
                        <span
                          className={`${mono.className} shrink-0 px-2 py-1 rounded-md border border-border bg-surface text-[12px] text-ink-muted`}
                        >
                          {stockAt(p, branchId)} here
                        </span>
                      </button>
                    ))}

                    {/* Always offered, never automatic: a near-match is often a
                        different product, and only the person knows which. */}
                    <button
                      onClick={() => startCreate(query.trim())}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 bg-amber-muted active:bg-amber-border/30"
                    >
                      <Sparkles className="w-4 h-4 text-amber-hover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] text-ink font-medium truncate">
                          New product: {query.trim()}
                        </div>
                        <div className="text-[12.5px] text-ink-muted">
                          {matches.length === 0
                            ? 'Nothing here matches — add it to the system'
                            : 'Not one of these? Create it instead'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* not matched from a paste */}
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
          <div className="max-h-[38vh] overflow-y-auto overscroll-contain divide-y divide-border">
            {unplaced.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-2 px-4 py-3 ${
                  resolvingId === u.id ? 'bg-amber-muted' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] text-ink truncate">{u.text}</div>
                  <div className="text-[12px] truncate">
                    {u.quantity > 0 && (
                      <span className={`${mono.className} text-ink`}>{u.quantity} units</span>
                    )}
                    {u.quantity > 0 && u.note && <span className="text-ink-subtle"> · </span>}
                    {u.note && <span className="text-amber-hover">{u.note}</span>}
                  </div>
                  {resolvingId === u.id && (
                    <div className="text-[11.5px] text-ink-subtle mt-0.5">
                      Still here until you add it
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setResolvingId(u.id)
                    startCreate(
                      u.text,
                      u.quantity > 0 ? String(u.quantity) : '',
                      u.merchant
                    )
                  }}
                  className="h-10 px-3 shrink-0 rounded-lg bg-amber-muted border border-amber-border text-[12.5px] font-medium text-amber-hover active:bg-amber-border/30"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setResolvingId(u.id)
                    setResolvingQty(u.quantity > 0 ? String(u.quantity) : '')
                    setMode('type')
                    setQuery(u.text)
                    setOpen(true)
                    requestAnimationFrame(() => searchRef.current?.focus())
                  }}
                  className="h-10 px-3 shrink-0 rounded-lg border border-border text-[12.5px] font-medium text-ink active:bg-surface"
                >
                  Find
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* the receipt */}
      {lines.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className={`${mono.className} ${LABEL}`}>Arriving</span>
            <span className={`${mono.className} text-[12px] text-ink-subtle`}>
              {lines.length} product{lines.length === 1 ? '' : 's'} · {totalUnits} units
            </span>
          </div>

          <div className={`${CARD} divide-y divide-border overflow-hidden`}>
            {lines.map((l) => {
              const key = l.kind === 'existing' ? l.product.id : l.tempId
              const before = l.kind === 'existing' ? stockAt(l.product, branchId) : 0
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 pl-4 pr-2 py-3 ${
                    l.kind === 'new' ? 'bg-amber-muted border-l-2 border-l-amber' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] text-ink font-medium truncate">{lineName(l)}</div>
                    <div className="text-[12px] text-ink-subtle mt-0.5 truncate">
                      {l.kind === 'existing' ? (
                        <>
                          {l.product.merchantName || 'No merchant'}
                          <span className={mono.className}>
                            {' · '}
                            {before} → {before + l.quantity}
                          </span>
                        </>
                      ) : (
                        <span className={`${mono.className} text-amber-hover`}>
                          NEW · {merchantLabel(l.merchant)}
                          {'newName' in l.merchant ? ' (new merchant)' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`${mono.className} text-[19px] font-medium text-ink shrink-0`}>
                    +{l.quantity}
                  </div>
                  <button
                    onClick={() => removeLine(key)}
                    className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-ink-subtle active:bg-surface"
                    aria-label={`Remove ${lineName(l)}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* empty */}
      {lines.length === 0 && !picked && !creating && !busy && !loadError && (
        <div className="rounded-xl border border-dashed border-border-strong px-5 py-6">
          <p className="text-[14.5px] text-ink font-medium mb-3">Nothing added yet</p>
          <ol className="flex flex-col gap-2.5">
            {[
              'Type part of a product name',
              'Tap it, or create it if it is new',
              'Enter how many arrived',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span
                  className={`${mono.className} w-5 h-5 shrink-0 rounded-md bg-surface border border-border flex items-center justify-center text-[11px] text-ink-muted`}
                >
                  {i + 1}
                </span>
                <span className="text-[13.5px] text-ink-muted">{step}</span>
              </li>
            ))}
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
                style={{ width: `${(progress / lines.length) * 100}%` }}
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
                <span className={`${mono.className} text-[12px] text-ink-muted truncate`}>
                  {totalUnits} units into {branchName || 'this branch'}
                </span>
              )}
              {applying ? (
                <span className={`${mono.className} text-[12px] text-ink-subtle shrink-0`}>
                  {progress}/{lines.length}
                </span>
              ) : (
                newCount > 0 && (
                  <span className={`${mono.className} text-[12px] text-amber-hover shrink-0`}>
                    {newCount} new
                  </span>
                )
              )}
            </div>
            <button
              onClick={apply}
              disabled={applying}
              className={`${syne.className} w-full h-12 rounded-xl text-white text-[16px] font-bold flex items-center justify-center gap-2 transition ${
                applying ? 'bg-ink-subtle' : 'bg-amber active:bg-amber-hover'
              }`}
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving {progress} of {lines.length}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Receive {lines.length} product{lines.length === 1 ? '' : 's'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Creating a product that is not in the system, without leaving the flow.
 * The merchant box doubles as a picker and a creator: typing a name that is not
 * on file offers to add it, which is the case that used to dead-end here.
 */
function NewProductCard({
  creating,
  setCreating,
  merchantQuery,
  setMerchantQuery,
  merchantPick,
  setMerchantPick,
  merchantOpen,
  setMerchantOpen,
  merchantMatches,
  merchantExactMatch,
  merchantsLoading,
  onCancel,
  onAdd,
  qtyRef,
}: {
  creating: { name: string; quantity: string }
  setCreating: (c: { name: string; quantity: string }) => void
  merchantQuery: string
  setMerchantQuery: (s: string) => void
  merchantPick: Merchant | { newName: string } | null
  setMerchantPick: (m: Merchant | { newName: string } | null) => void
  merchantOpen: boolean
  setMerchantOpen: (b: boolean) => void
  merchantMatches: Merchant[]
  merchantExactMatch: Merchant | undefined
  merchantsLoading: boolean
  onCancel: () => void
  onAdd: () => void
  qtyRef: React.RefObject<HTMLInputElement | null>
}) {
  const ready =
    creating.name.trim() !== '' &&
    merchantPick !== null &&
    parseInt(creating.quantity, 10) > 0

  return (
    <div>
      <div className={`${mono.className} ${LABEL} mb-2`}>New product</div>
      <div className="rounded-xl bg-amber-muted border border-amber-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
          <Sparkles className="w-4 h-4 text-amber-hover shrink-0" />
          <span className="text-[12.5px] font-medium text-ink">
            Not in the system yet — it will be created
          </span>
          <button
            onClick={onCancel}
            className="ml-auto w-10 h-10 -mr-2 shrink-0 rounded-lg flex items-center justify-center text-ink-subtle active:bg-amber-border/30"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-4 pt-2 flex flex-col gap-3">
          {/* name */}
          <div>
            <label className={`${mono.className} ${LABEL} block mb-1.5`}>Name</label>
            <input
              value={creating.name}
              onChange={(e) => setCreating({ ...creating, name: e.target.value })}
              className="w-full h-12 px-3.5 bg-surface-raised border border-border rounded-xl text-base text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border"
              placeholder="Product name"
            />
          </div>

          {/* merchant: pick one, or name a new one */}
          <div className="relative">
            <label className={`${mono.className} ${LABEL} block mb-1.5`}>Merchant</label>
            {merchantPick ? (
              <div className="h-12 px-3.5 flex items-center gap-2 bg-surface-raised border border-border rounded-xl">
                <span className="flex-1 min-w-0 text-[15px] text-ink truncate">
                  {merchantLabel(merchantPick)}
                </span>
                {'newName' in merchantPick && (
                  <span
                    className={`${mono.className} shrink-0 px-2 py-0.5 rounded-md bg-amber-muted border border-amber-border text-[11px] text-amber-hover`}
                  >
                    NEW
                  </span>
                )}
                <button
                  onClick={() => {
                    setMerchantPick(null)
                    setMerchantQuery('')
                    setMerchantOpen(true)
                  }}
                  className="shrink-0 w-9 h-9 -mr-1.5 rounded-lg flex items-center justify-center text-ink-subtle active:bg-surface"
                  aria-label="Change merchant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <input
                  value={merchantQuery}
                  onChange={(e) => {
                    setMerchantQuery(e.target.value)
                    setMerchantOpen(true)
                  }}
                  onFocus={() => setMerchantOpen(true)}
                  className="w-full h-12 px-3.5 bg-surface-raised border border-border rounded-xl text-base text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border placeholder:text-ink-subtle"
                  placeholder={merchantsLoading ? 'Loading merchants...' : 'Search or type a new one'}
                />
                {merchantOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-surface-raised border border-border rounded-xl shadow-[0_12px_28px_-8px_rgba(17,24,39,0.18)] overflow-hidden">
                    <div className="max-h-[40vh] overflow-y-auto overscroll-contain divide-y divide-border">
                      {merchantMatches.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setMerchantPick(m)
                            setMerchantOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-[15px] text-ink truncate active:bg-surface"
                        >
                          {m.name}
                        </button>
                      ))}

                      {/* Offered only when nothing on file carries that exact
                          name, so a typo cannot create a second record. */}
                      {merchantQuery.trim() !== '' && !merchantExactMatch && (
                        <button
                          onClick={() => {
                            setMerchantPick({ newName: merchantQuery.trim() })
                            setMerchantOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 bg-amber-muted active:bg-amber-border/30"
                        >
                          <Plus className="w-4 h-4 text-amber-hover shrink-0" />
                          <span className="text-[15px] text-ink font-medium truncate">
                            New merchant: {merchantQuery.trim()}
                          </span>
                        </button>
                      )}

                      {merchantMatches.length === 0 && merchantQuery.trim() === '' && (
                        <div className="px-4 py-4 text-[13px] text-ink-subtle">
                          {merchantsLoading ? 'Loading merchants...' : 'No merchants on file yet'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* quantity + add */}
          <div className="flex items-stretch gap-2">
            <input
              ref={qtyRef}
              value={creating.quantity}
              onChange={(e) =>
                setCreating({ ...creating, quantity: e.target.value.replace(/[^0-9]/g, '') })
              }
              onKeyDown={(e) => e.key === 'Enter' && ready && onAdd()}
              type="text"
              inputMode="numeric"
              className={`${mono.className} w-24 h-12 px-3 bg-surface-raised border border-border-strong rounded-xl text-center text-[22px] font-medium text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border`}
              placeholder="0"
            />
            <button
              onClick={onAdd}
              disabled={!ready}
              className={`${syne.className} flex-1 h-12 rounded-xl bg-ink text-white text-[15px] font-bold flex items-center justify-center gap-1.5 disabled:bg-border-strong disabled:text-ink-subtle active:opacity-90`}
            >
              <Plus className="w-4 h-4" />
              Add to list
            </button>
          </div>

          {!merchantPick && creating.name.trim() !== '' && (
            <p className="text-[12.5px] text-ink-muted">Choose a merchant to continue.</p>
          )}
        </div>
      </div>
    </div>
  )
}
