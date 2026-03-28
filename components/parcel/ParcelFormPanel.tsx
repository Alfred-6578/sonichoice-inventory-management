"use client";

import { FormDataProps } from "@/types/parcelTypes";
import { useEffect, useState } from "react";
import Select from "../ui/Select";
import { DM_Mono, Syne } from "next/font/google";
import Tag from "../ui/Tag";
import { X } from "lucide-react";
import { getBranches, ApiBranch } from "@/lib/branches";
import { createParcel } from "@/lib/parcels";

const dm_mono = DM_Mono({
    variable:"--font-dm_mono",
    subsets:["latin"],
    weight: ["300","400","500"]
})

const syne = Syne({
    variable: "--font-syne",
    subsets:["latin"]
})

type BranchProduct = {
  id: string;
  trackingId: string;
  name: string;
  description: string;
  maxQuantity: number;
  merchantId: string;
};

const PREVIEW_LIMIT = 5;

export default function ParcelFormPanel({
  isOpen,
  onClose,
  onBulkTransfer,
}: FormDataProps) {
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [size, setSize] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [products, setProducts] = useState<BranchProduct[]>([]);
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [showFullModal, setShowFullModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch branches on mount
  useEffect(() => {
    if (branches.length === 0) {
      getBranches().then(setBranches).catch(() => {});
    }
  }, []);

  // Derive products from branch's productStocks when from branch changes
  useEffect(() => {
    if (!fromBranchId) {
      setProducts([]);
      return;
    }

    setSelected(new Map());

    const branch = branches.find((b) => b.id === fromBranchId);
    if (!branch || !branch.productStocks) {
      setProducts([]);
      return;
    }

    const mapped = branch.productStocks
      .filter((s) => s.quantity > 0)
      .map((s) => ({
        id: s.productId,
        trackingId: s.product?.trackingId || s.productId.slice(0, 8),
        name: s.product?.name || "Product",
        description: (s.product?.description as string) ?? "",
        maxQuantity: s.quantity,
        merchantId: (s.product?.merchantId as string) || "",
      }));

    setProducts(mapped);
  }, [fromBranchId, branches]);

  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));
  const destinationOptions = branchOptions.filter((b) => b.value !== fromBranchId);

  const toggleProduct = (id: string, maxQty: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, maxQty);
      return next;
    });
  };

  const setQuantity = (id: string, qty: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(id, qty);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Map());
    } else {
      const next = new Map<string, number>();
      products.forEach((p) => next.set(p.id, selected.get(p.id) ?? p.maxQuantity));
      setSelected(next);
    }
  };

  // Derive merchantId from the first selected product
  const derivedMerchantId = (() => {
    const firstSelectedId = selected.keys().next().value;
    if (!firstSelectedId) return "";
    return products.find((p) => p.id === firstSelectedId)?.merchantId || "";
  })();

  const handleTransfer = async () => {
    if (selected.size === 0 || !toBranchId || !fromBranchId) {
      setError("Please select branches and at least one product.");
      return;
    }
    if (!derivedMerchantId) {
      setError("Could not determine merchant from selected products.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const items = Array.from(selected.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const payload = {
        merchantId: derivedMerchantId,
        fromBranchId,
        toBranchId,
        size: (size as "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE") || undefined,
        additionalInfo: additionalInfo || undefined,
        items,
      };
      console.log("Create parcel payload:", payload);
      const result = await createParcel(payload);

      setSuccess(`Parcel ${result.trackingNumber} created successfully!`);
      setSelected(new Map());
      setProducts([]);
      setFromBranchId("");
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
    onClose();
    setSelected(new Map());
    setFromBranchId("");
    setToBranchId("");
    setSize("");
    setAdditionalInfo("");
    setProducts([]);
    setShowFullModal(false);
    setModalSearch("");
    setError("");
    setSuccess("");
  };

  const selectedCount = selected.size;
  const totalTransferQty = Array.from(selected.values()).reduce((s, q) => s + q, 0);

  // Filtered products for modal search
  const modalProducts = modalSearch
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
          p.trackingId.toLowerCase().includes(modalSearch.toLowerCase())
      )
    : products;

  return (
    <>
      <div
        className={`fixed top-0 right-0 bottom-0 z-[60] w-full sm:max-w-[460px]
        bg-surface-raised border-l border-border flex flex-col
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div>
            <div className={`text-[11px] font-mono text-ink-subtle uppercase tracking-wider mb-1 ${dm_mono.className}`}>
              Parcels
            </div>
            <div className={`text-lg font-bold text-ink ${syne.className}`}>
              Log Parcels
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-ink-subtle hover:bg-surface"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {success && (
            <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* BRANCHES */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="From Branch">
              <Select
                id="transfer-from"
                size="sm"
                value={fromBranchId}
                onChange={(e) => { setFromBranchId(e.target.value); setSelected(new Map()); }}
                options={branchOptions}
                placeholder="— Select —"
              />
            </Field>

            <Field label="To Branch">
              <Select
                id="transfer-to"
                size="sm"
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                options={destinationOptions}
                placeholder="— Select —"
              />
            </Field>
          </div>

          {/* SIZE + ADDITIONAL INFO */}
          <div className="grid grid-cols-1 gap-3">
            <Field label="Size (optional)">
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
            </Field>
          </div>

          <Field label="Additional Info (optional)">
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Handle with care..."
              rows={2}
              className="input text-ink text-sm placeholder:text-ink-muted/70 placeholder:text-sm px-4 py-2 border border-border w-full rounded-lg outline-amber resize-none"
            />
          </Field>

          <Divider label="Products at branch" />

          {/* PRODUCT SELECTION LIST (LIMITED) */}
          {!fromBranchId ? (
            <div className="text-center py-8 text-ink-muted text-sm">
              Select a source branch to see available products
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-ink-muted text-sm">
              No products at this branch
            </div>
          ) : (
            <div className="space-y-2">
              {products.slice(0, PREVIEW_LIMIT).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isSelected={selected.has(p.id)}
                  quantity={selected.get(p.id) ?? p.maxQuantity}
                  onToggle={() => toggleProduct(p.id, p.maxQuantity)}
                  onQuantityChange={(qty) => setQuantity(p.id, qty)}
                />
              ))}

              {products.length > PREVIEW_LIMIT && (
                <button
                  onClick={() => setShowFullModal(true)}
                  className="w-full py-2.5 text-xs font-medium text-amber-600 hover:text-amber-700 border border-border rounded-lg hover:bg-surface transition"
                >
                  View all {products.length} products
                </button>
              )}
            </div>
          )}

          {/* Selected summary */}
          {selectedCount > 0 && (
            <div className="bg-amber/5 border border-amber rounded-lg px-3 py-2 text-xs">
              <span className="font-bold text-amber-700">{selectedCount} product{selectedCount > 1 ? "s" : ""}</span>
              <span className="text-ink-muted"> selected · {totalTransferQty} total units</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={resetAndClose}
            className="px-4 py-2 border border-border rounded-lg text-ink-muted hover:bg-surface"
          >
            Cancel
          </button>

          <button
            onClick={handleTransfer}
            disabled={selectedCount === 0 || !toBranchId || submitting}
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
              selectedCount > 0 && toBranchId && !submitting
                ? "bg-ink text-white"
                : "bg-ink/30 text-white/60 cursor-not-allowed"
            }`}
          >
            {submitting ? "Creating parcel..." : `Transfer ${selectedCount > 0 ? `${selectedCount} product${selectedCount > 1 ? "s" : ""}` : "products"}`}
          </button>
        </div>
      </div>

      {/* ═══════════ FULL PRODUCT MODAL ═══════════ */}
      {showFullModal && (
        <>
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[70]" onClick={() => setShowFullModal(false)} />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl border border-border shadow-2xl flex flex-col w-full sm:max-w-[90%] xl:max-w-[80%] sm:max-h-[90vh] max-h-[95vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex max-sm:flex-col sm:items-center gap-3 shrink-0">
                <div className="flex-1">
                  <div className={`text-lg font-bold text-ink ${syne.className}`}>
                    Select Products to Transfer
                  </div>
                  <div className="text-xs text-ink-subtle mt-0.5">
                    {products.length} products at {branches.find(b => b.id === fromBranchId)?.name}
                    {selectedCount > 0 && ` · ${selectedCount} selected · ${totalTransferQty} units`}
                  </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg w-56  max-sm:w-full focus-within:border-border-strong">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-ink-subtle shrink-0">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="bg-transparent outline-none w-full text-xs text-ink placeholder:text-ink-subtle"
                  />
                </div>

                <div className="flex gap-4">
                {/* Select all */}
                <button
                  onClick={toggleAll}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors w-full ${
                    selected.size === products.length
                      ? "bg-amber/10 border-amber text-amber-700"
                      : "border-border text-ink-muted hover:bg-surface"
                  }`}
                >
                  {selected.size === products.length ? "Deselect all" : "Select all"}
                </button>

                <button
                  onClick={() => setShowFullModal(false)}
                  className="w-8 h-8 border rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition shrink-0"
                >
                  <X size={18} /> 
                  {/* <p className="sm:hidden">Close</p> */}
                </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {modalProducts.length === 0 ? (
                  <div className="text-center py-10 text-ink-subtle text-sm">
                    {modalSearch ? "No products match your search" : "No products found"}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {modalProducts.map((p) => (
                      <div
                        key={p.id}
                        className={`border rounded-lg overflow-hidden transition ${
                          selected.has(p.id) ? "border-amber bg-amber/5" : "border-border hover:border-border-strong"
                        }`}
                      >
                        {/* Top: checkbox + info */}
                        <label className="flex items-start gap-2.5 px-3.5 py-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected.has(p.id)}
                            onChange={() => toggleProduct(p.id, p.maxQuantity)}
                            className="mt-1 accent-amber-600 w-4 h-4 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-ink truncate">{p.name}</div>
                            {p.description && (
                              <div className="text-[11px] text-ink-subtle truncate mt-0.5">{p.description}</div>
                            )}
                            <span className="font-mono text-[9px] text-ink-subtle">{p.trackingId}</span>
                          </div>
                        </label>

                        {/* Bottom: quantity control */}
                        <div className="border-t border-border bg-gray-50/50 px-3.5 py-2 flex items-center justify-between">
                          <span className="text-[11px] text-ink-muted">
                            Available: <span className="font-mono font-medium">{p.maxQuantity}</span>
                          </span>

                          {selected.has(p.id) && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-ink-muted">Qty:</span>
                              <input
                                type="number"
                                min={1}
                                max={p.maxQuantity}
                                value={selected.get(p.id) ?? p.maxQuantity}
                                onChange={(e) => {
                                  const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), p.maxQuantity);
                                  setQuantity(p.id, val);
                                }}
                                className="w-14 px-2 py-1 border border-border rounded text-xs font-mono text-ink text-center outline-none focus:border-amber"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0">
                <span className="text-xs text-ink-subtle">
                  {selectedCount} of {products.length} selected · {totalTransferQty} units
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFullModal(false)}
                    className="px-4 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ── Product Card (for preview list) ── */
function ProductCard({
  product,
  isSelected,
  quantity,
  onToggle,
  onQuantityChange,
}: {
  product: BranchProduct;
  isSelected: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantityChange: (qty: number) => void;
}) {
  return (
    <div className={`rounded-lg border overflow-hidden transition ${isSelected ? "border-amber bg-amber/5" : "border-border hover:bg-surface"}`}>
      <label className="flex items-start gap-3 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1 accent-amber-600 w-4 h-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Tag label={product.trackingId} />
          </div>
          <div className="text-sm font-medium text-ink truncate">{product.name}</div>
          {product.description && (
            <div className="text-xs text-ink-muted mt-0.5 truncate">{product.description}</div>
          )}
          <div className="text-xs text-ink-subtle mt-0.5 font-mono">
            {product.maxQuantity} units available
          </div>
        </div>
      </label>

      {isSelected && (
        <div className="border-t border-border bg-gray-50/50 px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-ink-muted">Transfer quantity</span>
          <input
            type="number"
            min={1}
            max={product.maxQuantity}
            value={quantity}
            onChange={(e) => {
              const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), product.maxQuantity);
              onQuantityChange(val);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-16 px-2 py-1 border border-border rounded text-xs font-mono text-ink text-center outline-none focus:border-amber"
          />
        </div>
      )}
    </div>
  );
}

/* REUSABLE FIELD */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={`block text-[11px] font-mono text-ink-muted uppercase mb-1 ${dm_mono.className}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* DIVIDER */
function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-4">
      <div className="h-px bg-border" />
      <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-subtle bg-surface-raised uppercase pr-2 ${dm_mono.className}`}>
        {label}
      </span>
    </div>
  );
}
