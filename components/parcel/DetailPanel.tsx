"use client";

import { DetailPanelProps } from "@/types/parcelTypes";
import Row from "./Row";
import Section from "./Section";
import Tag from "../ui/Tag";
import { Syne } from "next/font/google";
import { useEffect, useState } from "react";
import { updateParcelStatus, deleteParcel, updateParcel, ParcelStatusValue } from "@/lib/parcels";
import { getBranches } from "@/lib/branches";
import { getStoredUser } from "@/lib/auth";
import { Trash2, Pencil, X } from "lucide-react";
import Select from "../ui/Select";


const syne = Syne({
    variable: "--font-syne",
    subsets:["latin"]
})


export default function DetailPanel({ parcel, onClose, onUpdated }: DetailPanelProps & { onUpdated?: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusError, setStatusError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editSize, setEditSize] = useState("");
  const [editInfo, setEditInfo] = useState("");
  const [editItems, setEditItems] = useState<Map<string, { name: string; quantity: number; maxQuantity: number }>>(new Map());
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [branchProducts, setBranchProducts] = useState<{ id: string; name: string; trackingId: string; maxQuantity: number; merchantName: string; merchantColor: string }[]>([]);
  const [loadingBranchProducts, setLoadingBranchProducts] = useState(false);
  const [itemSearch, setItemSearch] = useState("");

  // Reset edit state when switching parcels
  useEffect(() => {
    setEditing(false);
    setShowItemsModal(false);
    setConfirmDelete(false);
    setStatusError("");
  }, [parcel?.apiId]);

  const isOpen = !!parcel;

  // User context for permissions
  const user = getStoredUser();
  const userBranchId = user?.branchId || "";
  const userRole = (user?.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";
  const isFromBranch = !!(userBranchId && parcel?.fromBranchId === userBranchId);
  const isToBranch = !!(userBranchId && parcel?.toBranchId === userBranchId);
  const isInvolvedBranch = isFromBranch || isToBranch;

  if (!parcel) {
    return (
      <div className={`w-0 overflow-hidden transition-all`} />
    );
  }

  // Determine which status actions are available based on current status and user's branch
  const getStatusActions = (): { label: string; status: ParcelStatusValue; variant: string }[] => {

    if (!isInvolvedBranch) return [];

    const actions: { label: string; status: ParcelStatusValue; variant: string }[] = [];

    switch (parcel.status) {
      case "pending":
        // Only from-branch can dispatch or cancel
        if (isFromBranch) {
          actions.push({ label: "Mark In Transit", status: "IN_TRANSIT", variant: "bg-amber text-white" });
          actions.push({ label: "Cancel", status: "CANCELLED", variant: "bg-red-600 text-white" });
        }
        break;
      case "transit":
        // To-branch can receive or return
        if (isToBranch) {
          actions.push({ label: "Mark Received", status: "RECEIVED", variant: "bg-delivered text-white" });
          actions.push({ label: "Return", status: "RETURNED", variant: "border border-border text-ink-muted" });
        }
        // From-branch can cancel
        if (isFromBranch) {
          actions.push({ label: "Cancel", status: "CANCELLED", variant: "bg-red-600 text-white" });
        }
        break;
      // received, cancelled, returned — no actions (final states)
    }

    return actions;
  };

  const handleStatusUpdate = async (status: ParcelStatusValue) => {
    if (!parcel.apiId) return;
    setUpdating(status);
    setStatusError("");
    try {
      await updateParcelStatus(parcel.apiId, status);
      onUpdated?.();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const startEdit = async () => {
    setEditSize(parcel.size || "");
    setEditInfo(parcel.notes || "");
    setStatusError("");

    // Populate editItems from current parcel items
    const items = new Map<string, { name: string; quantity: number; maxQuantity: number }>();
    (parcel.items || []).forEach((i) => {
      items.set(i.productId, { name: i.productName, quantity: i.quantity, maxQuantity: 999 });
    });
    setEditItems(items);
    setEditing(true);

    // Fetch products from the from branch for the items modal
    if (parcel.fromBranchId) {
      setLoadingBranchProducts(true);
      try {
        const branches = await getBranches();
        const branch = branches.find((b) => b.id === parcel.fromBranchId);
        if (branch?.productStocks) {
          setBranchProducts(
            branch.productStocks
              .filter((s) => s.quantity > 0)
              .map((s) => {
                const merchant = (s.product as any)?.merchant;
                return {
                  id: s.productId,
                  name: s.product?.name || "Product",
                  trackingId: (s.product?.trackingId as string) || s.productId.slice(0, 8),
                  maxQuantity: s.quantity,
                  merchantName: merchant?.name || "",
                  merchantColor: merchant?.color || "#374151",
                };
              })
          );
        }
      } catch { }
      finally { setLoadingBranchProducts(false); }
    }
  };

  const toggleEditItem = (id: string, name: string, maxQty: number) => {
    setEditItems((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, { name, quantity: maxQty, maxQuantity: maxQty });
      return next;
    });
  };

  const setEditItemQty = (id: string, qty: number) => {
    setEditItems((prev) => {
      const next = new Map(prev);
      const item = next.get(id);
      if (item) next.set(id, { ...item, quantity: qty });
      return next;
    });
  };

  const handleSave = async () => {
    if (!parcel.apiId) return;
    if (editItems.size === 0) {
      setStatusError("At least one item is required.");
      return;
    }

    setSaving(true);
    setStatusError("");
    try {
      const items = Array.from(editItems.entries()).map(([productId, item]) => ({
        productId,
        quantity: item.quantity,
      }));

      const payload: Record<string, unknown> = {
        items,
        size: editSize || parcel.size || "MEDIUM",
      };
      if (editInfo) payload.additionalInfo = editInfo;

      await updateParcel(parcel.apiId, payload);
      setEditing(false);
      setShowItemsModal(false);
      onUpdated?.();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!parcel.apiId) return;
    setDeleting(true);
    setStatusError("");
    try {
      await deleteParcel(parcel.apiId);
      setConfirmDelete(false);
      onClose();
      onUpdated?.();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const statusActions = getStatusActions();

  // progress
  const pct =
    parcel.status === "received" || parcel.status === "cancelled" || parcel.status === "returned"
      ? 100
      : parcel.status === "transit"
      ? 60
      : 20;

  const fillClass =
    parcel.status === "received" ? "bg-delivered"
    : parcel.status === "cancelled" ? "bg-red-500"
    : parcel.status === "returned" ? "bg-orange-500"
    : "bg-amber";

  return (
    <div
      className={`bg-surface-raised h-screen fixed right-0 top-0 z-50 shadow-2xl border-l border-border flex flex-col transition-all
        ${isOpen ? "sm:w-[380px] w-full" : "w-0 overflow-hidden"}
      `}
    >
      {/* HEADER */}
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-ink-subtle hover:bg-surface"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <span className="font-mono text-xs bg-surface px-2 py-1 rounded border border-border text-ink-subtle">
          {parcel.id}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {!editing && (
            <>
              {isInvolvedBranch && parcel.status !== "received" && parcel.status !== "returned" && parcel.status !== "cancelled" && (
                <button
                  onClick={startEdit}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-ink-subtle hover:bg-surface transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-ink-subtle hover:bg-red-50 hover:text-red-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* STATUS ACTIONS */}
      {statusActions.length > 0 && (
        <div className="px-4 py-3 border-b border-border space-y-2">
          {statusError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{statusError}</div>
          )}
          <div className="flex flex-wrap gap-2">
            {statusActions.map((action) => (
              <button
                key={action.status}
                onClick={() => handleStatusUpdate(action.status)}
                disabled={updating !== null}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity ${action.variant} ${
                  updating === action.status ? "opacity-60" : "hover:opacity-90"
                }`}
              >
                {updating === action.status ? "Updating..." : action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EDIT FORM */}
      {editing && (
        <div className="px-4 py-3 border-b border-border space-y-3">
          <div className="text-[9px] font-mono text-ink-subtle uppercase tracking-wider">Edit Parcel</div>
          {statusError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{statusError}</div>
          )}
          <div>
            <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">Size</label>
            <Select
              id="edit-size"
              size="sm"
              value={editSize}
              onChange={(e) => setEditSize(e.target.value)}
              options={[
                { value: "SMALL", label: "Small" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LARGE", label: "Large" },
                { value: "EXTRA_LARGE", label: "Extra Large" },
              ]}
              placeholder="— Select size —"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">Additional Info</label>
            <textarea
              value={editInfo}
              onChange={(e) => setEditInfo(e.target.value)}
              rows={2}
              placeholder="e.g. Handle with care..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-ink outline-none focus:border-ink resize-none"
            />
          </div>

          {/* EDIT ITEMS PREVIEW */}
          <div>
            <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1.5">
              Items ({editItems.size})
            </label>
            <div className="space-y-1.5">
              {Array.from(editItems.entries()).slice(0, 3).map(([id, item]) => (
                <div key={id} className="flex items-center justify-between px-2.5 py-1.5 border border-border rounded-lg bg-surface text-xs">
                  <span className="text-ink truncate flex-1">{item.name}</span>
                  <span className="font-mono text-ink-muted ml-2">x{item.quantity}</span>
                </div>
              ))}
              {editItems.size > 3 && (
                <div className="text-[10px] text-ink-subtle px-1">+{editItems.size - 3} more</div>
              )}
            </div>
            <button
              onClick={() => setShowItemsModal(true)}
              className="w-full mt-2 py-2 text-xs font-medium text-amber-600 hover:text-amber-700 border border-border rounded-lg hover:bg-surface transition"
            >
              {editItems.size > 0 ? "Edit Items" : "Add Items"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setShowItemsModal(false); }}
              className="px-3 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || editItems.size === 0}
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg text-white font-bold ${
                saving || editItems.size === 0 ? "bg-gray-400" : "bg-ink hover:bg-gray-800"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TITLE */}
        <div>
          <div className={`text-lg font-bold text-ink mb-1 line-clamp-2 ${syne.className}`}>
            {parcel.desc}
          </div>

          {/* <span className="text-xs font-mono capitalize px-2 py-1 rounded border border-ink-subtle text-ink-subtle">
            {parcel.status}
            
          </span> */}
          <StatusBadge status={parcel.status}/>
        </div>

        {/* PROGRESS */}
        <div>
          <div className="flex justify-between text-xs font-mono text-ink-subtle mb-1">
            <span>{parcel.from}</span>
            <span>{parcel.to}</span>
          </div>

          <div className="h-[4px] bg-border rounded overflow-hidden">
            <div
              className={`h-full ${fillClass}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* ITEMS GROUPED BY MERCHANT */}
        {parcel.items && parcel.items.length > 0 && (
          <MerchantItemsSection items={parcel.items} />
        )}

        {/* DETAILS */}
        <Section title="Parcel Details">
          <Row label="Size" value={`${parcel.size}${parcel.weight ? ` · ${parcel.weight}` : ""}`} />
          <Row label="Date sent" value={parcel.dateSent || "—"} mono />
          {parcel.dateReceived && <Row label="Date received" value={parcel.dateReceived} mono />}
          <Row label="Current location" value={parcel.current} />

          {parcel.notes && (
            <Row label="Notes" value={parcel.notes} highlight />
          )}
        </Section>


        {/* TIMELINE */}
        <Section title="Movement History">
          <div className="space-y-4">
            {parcel.history?.map((h, i) => {
              const previousDone = i > 0 ? parcel.history?.[i - 1]?.done : false;
              const isActive = !h.done && (i === 0 || previousDone);

              const dotClass = h.done
                ? "bg-delivered"
                : isActive
                ? "bg-amber"
                : "bg-border-strong";

              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full border ${dotClass}`}
                    />
                    {i !== (parcel.history?.length ?? 0) - 1 && (
                      <div className="w-[1px] flex-1 bg-border mt-1" />
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-ink">{h.action}</div>
                    <div className="text-xs text-ink-subtle font-mono">
                      {h.branch} · {h.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* DELETE CONFIRMATION */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center p-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 max-w-72 w-full text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">Delete this parcel?</div>
            <div className="text-xs text-gray-500 mb-4">
              &quot;{parcel.id}&quot; will be permanently removed. This cannot be undone.
            </div>
            {statusError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{statusError}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmDelete(false); setStatusError(""); }}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`flex-1 px-3 py-2 text-xs rounded-lg text-white font-bold ${
                  deleting ? "bg-red-300" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ITEMS MODAL */}
      {showItemsModal && (
        <>
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[70]" onClick={() => setShowItemsModal(false)} />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl border border-border shadow-2xl flex flex-col w-full max-w-[90%] xl:max-w-[70%] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex max-sm:flex-col sm:items-center gap-3 shrink-0">
                <div className="flex-1">
                  <div className="text-lg font-bold text-ink">Edit Parcel Items</div>
                  <div className="text-xs text-ink-subtle mt-0.5">
                    {editItems.size} item{editItems.size !== 1 ? "s" : ""} selected · {Array.from(editItems.values()).reduce((s, i) => s + i.quantity, 0)} total units
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center w-full gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg focus-within:border-border-strong">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-ink-subtle shrink-0">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="bg-transparent outline-none w-full text-xs text-ink placeholder:text-ink-subtle"
                    />
                  </div>

                  <button
                    onClick={() => setShowItemsModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingBranchProducts ? (
                  <div className="text-center py-10 text-ink-subtle text-sm">Loading products...</div>
                ) : branchProducts.length === 0 ? (
                  <div className="text-center py-10 text-ink-subtle text-sm">No products found at the source branch</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {branchProducts
                      .filter((p) => !itemSearch || p.name.toLowerCase().includes(itemSearch.toLowerCase()) || p.trackingId.toLowerCase().includes(itemSearch.toLowerCase()) || p.merchantName.toLowerCase().includes(itemSearch.toLowerCase()))
                      .map((p) => {
                        const isSelected = editItems.has(p.id);
                        const currentQty = editItems.get(p.id)?.quantity ?? p.maxQuantity;

                        return (
                          <div
                            key={p.id}
                            className={`border rounded-lg overflow-hidden transition ${isSelected ? "border-amber bg-amber/5" : "border-border hover:border-border-strong"}`}
                          >
                            <label className="flex items-start gap-2.5 px-3.5 py-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleEditItem(p.id, p.name, p.maxQuantity)}
                                className="mt-1 accent-amber-600 w-4 h-4 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-ink truncate">{p.name}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {p.merchantName && (
                                    <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                                      <span
                                        className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                                        style={{ backgroundColor: p.merchantColor }}
                                      />
                                      {p.merchantName}
                                    </span>
                                  )}
                                  <span className="font-mono text-[9px] text-ink-subtle">{p.trackingId}</span>
                                </div>
                              </div>
                            </label>

                            <div className="border-t border-border bg-gray-50/50 px-3.5 py-2 flex items-center justify-between">
                              <span className="text-[11px] text-ink-muted">
                                Available: <span className="font-mono font-medium">{p.maxQuantity}</span>
                              </span>
                              {isSelected && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-ink-muted">Qty:</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={p.maxQuantity}
                                    value={currentQty}
                                    onChange={(e) => {
                                      const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), p.maxQuantity);
                                      setEditItemQty(p.id, val);
                                    }}
                                    className="w-14 px-2 py-1 border border-border rounded text-xs font-mono text-ink text-center outline-none focus:border-amber"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0">
                <span className="text-xs text-ink-subtle">
                  {editItems.size} selected · {Array.from(editItems.values()).reduce((s, i) => s + i.quantity, 0)} units
                </span>
                <button
                  onClick={() => setShowItemsModal(false)}
                  className="px-4 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { ParcelProductItem } from "@/types/parcelTypes";
import StatusBadge from "../ui/StatusBadge";

const MERCHANT_ITEMS_PREVIEW = 3;

function MerchantItemsSection({ items }: { items: ParcelProductItem[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!items || items.length === 0) return null;

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  // Group items by merchant
  const grouped = items.reduce<Record<string, { name: string; color: string; items: ParcelProductItem[] }>>((acc, item) => {
    const key = item.merchantId || "unknown";
    if (!acc[key]) {
      acc[key] = {
        name: item.merchantName || "Unknown Merchant",
        color: item.merchantColor || "#374151",
        items: [],
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const merchantEntries = Object.entries(grouped);
  const totalItems = items.length;
  const hasMore = totalItems > MERCHANT_ITEMS_PREVIEW;

  // For preview, flatten and take first N items but keep merchant context
  let previewCount = 0;

  return (
    <Section title={`Items (${totalItems}) · ${totalQty} units`}>
      <div className="space-y-3">
        {merchantEntries.map(([merchantId, merchant]) => {
          const merchantItems = showAll
            ? merchant.items
            : merchant.items.filter(() => {
                if (previewCount >= MERCHANT_ITEMS_PREVIEW) return false;
                previewCount++;
                return true;
              });

          if (merchantItems.length === 0) return null;

          const initials = merchant.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

          return (
            <div key={merchantId}>
              {/* Merchant header */}
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                  style={{ background: merchant.color }}
                >
                  {initials}
                </div>
                <span className="text-[11px] font-medium text-ink">{merchant.name}</span>
                <span className="text-[10px] text-ink-subtle">({merchant.items.length})</span>
              </div>

              {/* Products */}
              <div className="space-y-1.5 ">
                {merchantItems.map((item, i) => (
                  <div
                    key={item.productId + i}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-surface"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-ink truncate">{item.productName}</div>
                      {item.description && (
                        <div className="text-[10px] text-ink-subtle truncate">{item.description}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono font-bold text-ink">x{item.quantity}</div>
                      <Tag label={item.trackingId} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 py-2 text-xs font-medium text-amber-600 hover:text-amber-700 border border-border rounded-lg hover:bg-surface transition"
        >
          {showAll ? "Show less" : `View all ${totalItems} items`}
        </button>
      )}
    </Section>
  );
}
