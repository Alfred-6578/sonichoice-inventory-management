"use client";

/**
 * Send a parcel from this branch to another.
 *
 * Items are added one at a time — type part of a product name, tap the right
 * one, say how many — and collect in a list that can be checked before the
 * parcel is created. That replaces an earlier preview-of-five plus a modal
 * stacked on top of this panel, which on a phone meant two overlapping layers
 * each with its own search.
 *
 * Stock comes from the branch's own productStocks, which GET /branches already
 * embeds, so picking items costs no extra request.
 */

import { FormDataProps } from "@/types/parcelTypes";
import { useEffect, useMemo, useRef, useState } from "react";
import Select from "../ui/Select";
import { DM_Mono, Syne } from "next/font/google";
import { AlertTriangle, Check, Plus, Search, X } from "lucide-react";
import { getBranches, ApiBranch } from "@/lib/branches";
import { createParcel } from "@/lib/parcels";
import { getStoredUser } from "@/lib/auth";
import { buildPlan, looseAmbiguities, normalize, parseDeliveryMessage } from "@/lib/stock-plan";

const dm_mono = DM_Mono({
  variable: "--font-dm_mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });

type BranchProduct = {
  id: string;
  trackingId: string;
  name: string;
  description: string;
  maxQuantity: number;
};

type Item = { product: BranchProduct; quantity: number };

/** A pasted line that could not be turned into an item. */
type Unplaced = { id: string; text: string; quantity: number; note?: string };
type DraftUnplaced = Omit<Unplaced, "id">;

const withIds = (drafts: DraftUnplaced[]): Unplaced[] =>
  drafts.map((u, i) => ({ ...u, id: `${Date.now()}-${i}` }));

const LABEL = "text-[11px] uppercase tracking-wider text-ink-subtle";

/** productStocks -> the pickable products for a branch, in stock only. */
function productsOf(branch: ApiBranch | undefined): BranchProduct[] {
  if (!branch?.productStocks) return [];
  return branch.productStocks
    .filter((s) => s.quantity > 0)
    .map((s) => ({
      id: s.productId,
      trackingId: s.product?.trackingId || s.productId.slice(0, 8),
      name: s.product?.name || "Product",
      description: (s.product?.description as string) ?? "",
      maxQuantity: s.quantity,
    }));
}

export default function ParcelFormPanel({ isOpen, onClose }: FormDataProps) {
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [size, setSize] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"type" | "paste">("type");
  const [pasteText, setPasteText] = useState("");
  const [unplaced, setUnplaced] = useState<Unplaced[]>([]);
  // The entry a Find was started from. It stays listed until an item is
  // actually added, so backing out of the search never loses it.
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  // The count the message gave for that entry, carried into the quantity box
  // so a found product does not have to have its number retyped.
  const [resolvingQty, setResolvingQty] = useState("");
  const [clamped, setClamped] = useState(0);
  const [picked, setPicked] = useState<BranchProduct | null>(null);
  const [qty, setQty] = useState("");
  const [open, setOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [didCreate, setDidCreate] = useState(false);

  const qtyRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mine = getStoredUser()?.branchId || "";
    if (mine) setFromBranchId(mine);

    getBranches()
      .then(setBranches)
      .catch(() => {})
      .finally(() => setBranchesLoading(false));
  }, []);

  const fromBranch = branches.find((b) => b.id === fromBranchId);
  const products = useMemo(() => productsOf(fromBranch), [fromBranch]);

  const destinations = branches
    .filter((b) => b.id !== fromBranchId)
    .map((b) => ({ value: b.id, label: b.name }));

  /* ─────────── picking ─────────── */

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.trackingId.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return as - bs || a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [query, products]);

  /** How much of a product is still free to add, given what is already listed. */
  const remainingFor = (p: BranchProduct) =>
    p.maxQuantity - (items.find((i) => i.product.id === p.id)?.quantity ?? 0);

  const pick = (p: BranchProduct) => {
    setPicked(p);
    setOpen(false);
    setQuery("");
    setQty(resolvingId ? resolvingQty : "");
    // Selected, not just focused: a pre-filled count is replaced on typing.
    requestAnimationFrame(() => {
      qtyRef.current?.focus();
      qtyRef.current?.select();
    });
  };

  const commit = () => {
    const n = parseInt(qty, 10);
    if (!picked || !Number.isFinite(n) || n <= 0) return;

    // Never let a parcel promise more than the branch is holding.
    const capped = Math.min(n, remainingFor(picked));
    if (capped <= 0) return;

    setItems((cur) => {
      const at = cur.findIndex((i) => i.product.id === picked.id);
      if (at === -1) return [...cur, { product: picked, quantity: capped }];
      const next = [...cur];
      next[at] = { ...next[at], quantity: next[at].quantity + capped };
      return next;
    });

    if (resolvingId) {
      setUnplaced((cur) => cur.filter((u) => u.id !== resolvingId));
      setResolvingId(null);
      setResolvingQty("");
    }
    setPicked(null);
    setQty("");
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const removeItem = (id: string) =>
    setItems((cur) => cur.filter((i) => i.product.id !== id));

  /**
   * Reads a pasted delivery message and turns its lines into parcel items.
   * The branch's stock is the ceiling, so a line asking for more than is free
   * is added at what is available and counted as reduced; a line that matches
   * nothing, or whose product is already fully committed, is handed back.
   *
   * Matching runs through buildPlan so it is the same logic the delivery screen
   * uses. Merchant suffixes like "(Yusmine)" cannot disambiguate here, because
   * productStocks carries merchantId but not the merchant's name — two products
   * sharing a name come back as ambiguous and are listed for a manual pick.
   */
  const absorbPaste = () => {
    if (!pasteText.trim() || !fromBranchId) return;

    const label = fromBranch?.name || "branch";
    const parse = parseDeliveryMessage(pasteText);
    const asSystem = products.map((p) => ({
      id: p.id,
      name: p.name,
      merchantName: "",
      trackingId: p.trackingId,
      stocks: [
        { branchId: fromBranchId, quantity: p.maxQuantity, lowStockAlert: 0 },
      ],
    }));

    const plan = buildPlan(
      parse.rows.map((r) => ({ ...r, branch: label })),
      { [normalize(label)]: fromBranchId },
      asSystem,
      "deduct"
    );

    // A line like "Omega 3" may be 3 of "Omega" or a product called "Omega 3"
    // with no count. Never guess: hand those back to be added by hand.
    const unsure = new Map(
      looseAmbiguities(parse, asSystem).map((a) => [a.row.row, a.product.name])
    );

    const byId = new Map(products.map((p) => [p.id, p]));
    const next = [...items];
    const notPlaced: DraftUnplaced[] = [];
    let reduced = 0;

    for (const o of plan.outcomes) {
      const want = Number(o.row.rawQuantity);
      const product = o.productId ? byId.get(o.productId) : undefined;
      const other = unsure.get(o.row.row);

      if (other) {
        notPlaced.push({
          text: `${o.row.name} ${o.row.rawQuantity}`,
          quantity: 0,
          note: `could be ${want} × "${o.row.name}" or the product "${other}"`,
        });
        continue;
      }

      if (o.status !== "update" || !product || !Number.isFinite(want) || want <= 0) {
        notPlaced.push({ text: o.row.name, quantity: Number.isFinite(want) ? want : 0 });
        continue;
      }

      const at = next.findIndex((i) => i.product.id === product.id);
      const already = at === -1 ? 0 : next[at].quantity;
      const free = product.maxQuantity - already;

      if (free <= 0) {
        notPlaced.push({
          text: o.row.name,
          quantity: want,
          note: "all of this product is already in the parcel",
        });
        continue;
      }

      const add = Math.min(want, free);
      if (add < want) reduced++;
      if (at === -1) next.push({ product, quantity: add });
      else next[at] = { ...next[at], quantity: already + add };
    }

    for (const u of parse.unparsed) notPlaced.push({ text: u.text, quantity: 0 });

    setItems(next);
    setUnplaced(withIds(notPlaced));
    setResolvingId(null);
    setClamped(reduced);
    setPasteText("");
    setMode("type");
  };

  /* ─────────── submit ─────────── */

  const handleTransfer = async () => {
    if (!fromBranchId || !toBranchId) {
      setError("Choose where the parcel is going.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item to the parcel.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // No merchantId: the API derives it from the items, so a parcel may carry
      // products from several merchants.
      const result = await createParcel({
        fromBranchId,
        toBranchId,
        size: (size as "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE") || undefined,
        additionalInfo: additionalInfo || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      });

      setSuccess(`Parcel ${result.trackingNumber} created`);
      setDidCreate(true);
      setItems([]);
      setUnplaced([]);
      setClamped(0);
      setToBranchId("");
      setSize("");
      setAdditionalInfo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create parcel");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    onClose(didCreate);
    setItems([]);
    setUnplaced([]);
    setResolvingId(null);
    setResolvingQty("");
    setClamped(0);
    setPasteText("");
    setToBranchId("");
    setSize("");
    setAdditionalInfo("");
    setPicked(null);
    setQuery("");
    setQty("");
    setError("");
    setSuccess("");
    setDidCreate(false);
  };

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const canSend = !!toBranchId && items.length > 0 && !submitting;

  return (
    <div
      className={`fixed top-0 right-0 bottom-0 z-[60] w-full sm:max-w-[460px]
        bg-surface-raised border-l border-border flex flex-col
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* HEADER */}
      <div className="px-4 py-3.5 border-b border-border flex items-center gap-3 shrink-0">
        <div>
          <div className={`${dm_mono.className} ${LABEL} mb-0.5`}>Parcels</div>
          <div className={`${syne.className} text-[19px] font-bold text-ink leading-tight`}>
            Send a parcel
          </div>
        </div>
        <button
          onClick={resetAndClose}
          className="ml-auto w-10 h-10 -mr-2 flex items-center justify-center rounded-lg text-ink-subtle active:bg-surface"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {success && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-delivered-bg border border-delivered-border">
            <Check className="w-4 h-4 text-delivered shrink-0 mt-0.5" />
            <span className="text-[14px] text-ink">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-cancelled-bg border border-cancelled-border">
            <AlertTriangle className="w-4 h-4 text-cancelled shrink-0 mt-0.5" />
            <span className="text-[14px] text-ink">{error}</span>
          </div>
        )}

        {/* ROUTE */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <div className={`${dm_mono.className} ${LABEL} mb-1.5`}>From</div>
            <div className="h-12 px-3.5 flex items-center bg-surface border border-border rounded-xl text-[15px] text-ink-muted truncate">
              {branchesLoading ? "Loading..." : fromBranch?.name || "Your branch"}
            </div>
          </div>
          <div className="h-12 flex items-center text-ink-subtle">→</div>
          <div>
            <div className={`${dm_mono.className} ${LABEL} mb-1.5`}>To</div>
            <Select
              id="transfer-to"
              size="sm"
              value={toBranchId}
              onChange={(e) => setToBranchId(e.target.value)}
              options={destinations}
              placeholder={branchesLoading ? "Loading..." : "Choose"}
            />
          </div>
        </div>

        {/* ADD AN ITEM */}
        {!picked ? (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`${dm_mono.className} ${LABEL}`}>Add item</span>
              <button
                onClick={() => setMode(mode === "type" ? "paste" : "type")}
                className="text-[12.5px] font-medium text-amber-hover"
              >
                {mode === "type" ? "Paste a message" : "Type items"}
              </button>
            </div>

            {mode === "paste" ? (
              <div className="border border-border rounded-xl overflow-hidden">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={7}
                  disabled={products.length === 0}
                  // 16px keeps iOS Safari from zooming the page on focus.
                  className={`${dm_mono.className} w-full px-4 py-3.5 bg-transparent outline-none text-base text-ink placeholder:text-ink-subtle leading-relaxed resize-y`}
                  placeholder={"4 Kreain gel\n7 Moadop eye care tea\n1 Pressure washer"}
                />
                <button
                  onClick={absorbPaste}
                  disabled={!pasteText.trim() || products.length === 0}
                  className="w-full h-12 border-t border-border text-[15px] font-semibold text-ink disabled:text-ink-subtle active:bg-surface"
                >
                  Add these to the parcel
                </button>
              </div>
            ) : (
            <div className="relative">
              <Search className="w-4.5 h-4.5 text-ink-subtle absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                disabled={products.length === 0}
                // 16px keeps iOS Safari from zooming the page on focus.
                className="w-full h-14 pl-11 pr-11 bg-surface-raised border border-border rounded-xl text-base text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border placeholder:text-ink-subtle disabled:opacity-60"
                placeholder={
                  products.length > 0
                    ? "Type a product name"
                    : branchesLoading
                      ? "Loading stock..."
                      : "Nothing in stock at this branch"
                }
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-ink-subtle active:bg-surface"
                  aria-label="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* picker: full width, so it can never run off a phone screen */}
              {open && query.trim() !== "" && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 bg-surface-raised border border-border rounded-xl shadow-[0_12px_28px_-8px_rgba(17,24,39,0.18)] overflow-hidden">
                  {matches.length === 0 ? (
                    <div className="px-4 py-5 text-center">
                      <p className="text-[14px] text-ink">No match in stock here</p>
                      <p className="text-[12.5px] text-ink-subtle mt-0.5">
                        Nothing available is called &ldquo;{query.trim()}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[45vh] overflow-y-auto overscroll-contain divide-y divide-border">
                      {matches.map((p) => {
                        const left = remainingFor(p);
                        return (
                          <button
                            key={p.id}
                            onClick={() => left > 0 && pick(p)}
                            disabled={left <= 0}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-surface disabled:opacity-50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-[15px] text-ink font-medium truncate">
                                {p.name}
                              </div>
                              <div className={`${dm_mono.className} text-[12px] text-ink-subtle truncate`}>
                                {p.trackingId}
                              </div>
                            </div>
                            <span
                              className={`${dm_mono.className} shrink-0 px-2 py-1 rounded-md border text-[12px] ${
                                left <= 0
                                  ? "bg-cancelled-bg text-cancelled border-cancelled-border"
                                  : "bg-surface text-ink-muted border-border"
                              }`}
                            >
                              {left <= 0 ? "all added" : `${left} free`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        ) : (
          /* quantity step */
          <div>
            <div className={`${dm_mono.className} ${LABEL} mb-2`}>How many?</div>
            <div className="rounded-xl bg-amber-muted border border-amber-border overflow-hidden">
              <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[16.5px] text-ink font-semibold leading-snug">
                    {picked.name}
                  </div>
                  <div className={`${dm_mono.className} text-[12px] text-ink-muted mt-0.5`}>
                    {picked.trackingId} · {remainingFor(picked)} free
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPicked(null);
                    setQty("");
                    setResolvingId(null);
                    setResolvingQty("");
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
                  onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && commit()}
                  type="text"
                  inputMode="numeric"
                  className={`${dm_mono.className} w-24 h-12 px-3 bg-surface-raised border border-border-strong rounded-xl text-center text-[22px] font-medium text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border`}
                  placeholder="0"
                />
                <button
                  onClick={commit}
                  disabled={!qty || parseInt(qty, 10) <= 0}
                  className={`${syne.className} flex-1 h-12 rounded-xl bg-ink text-white text-[15px] font-bold flex items-center justify-center gap-1.5 disabled:bg-border-strong disabled:text-ink-subtle active:opacity-90`}
                >
                  <Plus className="w-4 h-4" />
                  Add to parcel
                </button>
              </div>

              {qty && parseInt(qty, 10) > remainingFor(picked) && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-raised border-t border-amber-border">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-hover shrink-0" />
                  <span className="text-[12.5px] text-ink">
                    Only{" "}
                    <span className={dm_mono.className}>{remainingFor(picked)}</span> free —
                    that is what will be added
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LINES THE PASTE COULD NOT PLACE */}
        {unplaced.length > 0 && (
          <div className="border border-amber-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-muted border-b border-amber-border">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-hover shrink-0" />
              <span className="text-[12.5px] font-medium text-ink">
                Not added
                <span className={`${dm_mono.className} text-ink-muted`}>
                  {" "}· {unplaced.length}
                </span>
              </span>
              <button
                onClick={() => setUnplaced([])}
                className="ml-auto text-[12.5px] font-medium text-ink-subtle"
              >
                Dismiss
              </button>
            </div>
            {/* Capped with its own scroll: this is secondary to the item list,
                so a long one must not push the parcel out of reach. */}
            <div className="max-h-[38vh] overflow-y-auto overscroll-contain divide-y divide-border">
              {unplaced.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    resolvingId === u.id ? "bg-amber-muted" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] text-ink truncate">{u.text}</div>
                    <div className="text-[12px] truncate">
                      {u.quantity > 0 && (
                        <span className={`${dm_mono.className} text-ink`}>
                          {u.quantity} units
                        </span>
                      )}
                      {u.quantity > 0 && u.note && <span className="text-ink-subtle"> · </span>}
                      {u.note && <span className="text-amber-hover">{u.note}</span>}
                      {u.quantity === 0 && !u.note && (
                        <span className="text-ink-subtle">could not be read</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setResolvingId(u.id);
                      setResolvingQty(u.quantity > 0 ? String(u.quantity) : "");
                      setMode("type");
                      setQuery(u.text);
                      setOpen(true);
                      requestAnimationFrame(() => searchRef.current?.focus());
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

        {/* ITEMS */}
        {items.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`${dm_mono.className} ${LABEL}`}>In this parcel</span>
              <span className={`${dm_mono.className} text-[12px] text-ink-subtle`}>
                {items.length} product{items.length === 1 ? "" : "s"} · {totalUnits} units
              </span>
            </div>
            <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
              {items.map((i) => (
                <div key={i.product.id} className="flex items-center gap-3 pl-4 pr-2 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] text-ink font-medium truncate">
                      {i.product.name}
                    </div>
                    <div className={`${dm_mono.className} text-[12px] text-ink-subtle`}>
                      {i.product.trackingId} · {i.product.maxQuantity} in stock
                    </div>
                  </div>
                  <div className={`${dm_mono.className} text-[19px] font-medium text-ink shrink-0`}>
                    ×{i.quantity}
                  </div>
                  <button
                    onClick={() => removeItem(i.product.id)}
                    className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-ink-subtle active:bg-surface"
                    aria-label={`Remove ${i.product.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {clamped > 0 && (
              <p className="text-[12.5px] text-amber-hover mt-2">
                {clamped} line{clamped === 1 ? "" : "s"} reduced to the stock available here.
              </p>
            )}
          </div>
        )}

        {items.length === 0 && !picked && (
          <div className="rounded-xl border border-dashed border-border-strong px-5 py-6 text-center">
            <p className="text-[14.5px] text-ink font-medium">No items yet</p>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Search a product above, then say how many are going.
            </p>
          </div>
        )}

        {/* OPTIONAL DETAIL */}
        <div className="flex flex-col gap-3 pt-1">
          <div>
            <div className={`${dm_mono.className} ${LABEL} mb-1.5`}>Size (optional)</div>
            <Select
              id="parcel-size"
              size="sm"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              options={[
                { value: "SMALL", label: "Small" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LARGE", label: "Large" },
                { value: "EXTRA_LARGE", label: "Extra Large" },
              ]}
              placeholder="— Select —"
            />
          </div>

          {/* Note is reference detail: desktop only, like the product fields. */}
          <div className="hidden sm:block">
            <div className={`${dm_mono.className} ${LABEL} mb-1.5`}>Note (optional)</div>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-xl text-[14px] text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber-border resize-none placeholder:text-ink-subtle"
              placeholder="Anything the receiving branch should know"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="px-4 pt-3 border-t border-border shrink-0 bg-surface-raised"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {items.length > 0 && (
          <div className="flex items-baseline justify-between mb-2">
            <span className={`${dm_mono.className} text-[12px] text-ink-muted truncate`}>
              {totalUnits} units → {branches.find((b) => b.id === toBranchId)?.name || "?"}
            </span>
          </div>
        )}
        <button
          onClick={handleTransfer}
          disabled={!canSend}
          className={`${syne.className} w-full h-12 rounded-xl text-white text-[16px] font-bold flex items-center justify-center gap-2 transition ${
            canSend ? "bg-amber active:bg-amber-hover" : "bg-border-strong text-ink-subtle"
          }`}
        >
          {submitting ? "Sending..." : "Send parcel"}
        </button>
      </div>
    </div>
  );
}
