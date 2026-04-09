"use client"

import { BranchDetails, ParcelStatus } from "@/types/branch";
import Section from "./Section";
import InfoRow from "./InfoRow";
import Metric from "./Metric";
import { Syne } from "next/font/google";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { updateBranch, deleteBranch } from "@/lib/branches";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import ProductListModal, { ProductListItem } from "@/components/ui/ProductListModal";

interface Props {
  branch: BranchDetails | null;
  onClose: () => void;
  onUpdated?: () => void;
}

const syne = Syne({
    variable:"--font-syne",
    subsets:["latin"]
})

export default function DetailPanel({ branch, onClose, onUpdated }: Props) {
  const router = useRouter();
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  if (!branch) return null;

  const startEdit = () => {
    setEditName(branch.name);
    setEditAddress(branch.address);
    setEditCity(branch.city);
    setEditState(branch.state);
    setEditPhone(branch.phone);
    setEditEmail(branch.email);
    setError("");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateBranch(branch.id, {
        name: editName,
        address: editAddress,
        city: editCity,
        state: editState,
        phone: editPhone,
        email: editEmail,
      });
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteBranch(branch.id);
      setConfirmDelete(false);
      onClose();
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyles = (status: ParcelStatus) => {
    switch (status) {
      case "transit":
        return {
          wrapper: "bg-transit-bg text-[#92400e] border-transit-border",
          dot: "bg-amber",
          label: "In Transit",
        };
      case "received":
        return {
          wrapper: "bg-delivered-bg text-[#14532d] border-delivered-border",
          dot: "bg-delivered",
          label: "Received",
        };
      default:
        return {
          wrapper: "bg-surface text-ink-muted border-border",
          dot: "bg-border-strong",
          label: "Pending",
        };
    }
  };

  return (
    <div className="sm:w-100 h-full w-full bg-surface-raised border-l border-[0.5px] border-border flex flex-col fixed top-0 z-50 right-0">
      {/* HEADER */}
      <div className="p-[14px_18px] border-b border-[0.5px] border-border flex items-center gap-[10px]">
        <button
          onClick={onClose}
          className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-ink-subtle hover:bg-surface transition"
        >
          ✕
        </button>

        <div className="flex-1">
          <div className="text-[9px] font-m text-ink-subtle uppercase tracking-[0.8px]">
            {branch.isHead ? "Head Office" : "Branch"}
          </div>
          <div className={`font-d text-[15px] font-bold text-ink ${syne.className}`}>
            {branch.name}
          </div>
        </div>

        {!editing && (
          <>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-ink-subtle hover:bg-red-50 hover:text-red-500 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={startEdit}
              className="w-7 h-7 rounded-md flex items-center justify-center text-ink-subtle hover:bg-surface transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">

        {/* EDIT FORM */}
        {editing && (
          <div className="px-4 py-4 border-b border-border space-y-3">
            <div className="text-[9px] font-m text-ink-subtle uppercase tracking-wider">Edit Branch</div>
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
            )}
            <Input id="edit-name" label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} size="sm" />
            <Input id="edit-address" label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} size="sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input id="edit-city" label="City" value={editCity} onChange={(e) => setEditCity(e.target.value)} size="sm" />
              <Input id="edit-state" label="State" value={editState} onChange={(e) => setEditState(e.target.value)} size="sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input id="edit-phone" label="Phone (optional)" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} size="sm" />
              <Input id="edit-email" label="Email (optional)" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} size="sm" />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg text-white font-bold ${
                  saving ? "bg-gray-400" : "bg-ink hover:bg-gray-800"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* METRICS */}
        <div className="grid grid-cols-2 border-b border-[0.5px] border-border">
          <Metric label="Holding" value={branch.holding} sub="parcels on-site" />
          <Metric label="In Transit" value={branch.transit} sub="moving now" variant="amber" />
          <Metric label="Received" value={branch.delivered} sub="this month" variant="green" />
        </div>

        {/* INFO */}
        <Section title="Branch Info">
          <InfoRow label="City" value={`${branch.city}, ${branch.state}`} />
          <InfoRow label="Address" value={branch.address} />
          <InfoRow label="Phone" value={branch.phone} mono />
          <InfoRow label="Email" value={branch.email} mono />
          <InfoRow label="Manager" value={branch.manager} />
          <InfoRow label="Type" value={branch.isHead ? "Head Office" : "Branch"} />
        </Section>

        {/* STAFF */}
        <Section title={`Staff (${branch.staff.length})`}>
          {branch.staff.map((s, i) => (
            <div key={i} className="flex items-center gap-[10px] py-[9px] border-b border-[0.5px] border-border last:border-b-0">
              <div
                className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-white font-d text-[11px]"
                style={{ background: s.color }}
              >
                {s.av}
              </div>

              <div>
                <div className="text-[13px] text-ink">{s.name}</div>
                <div className="text-[11px] text-ink-subtle font-m">{s.role}</div>
              </div>

              {/* <span
                className={`ml-auto text-[9px] px-[7px] py-[2px] rounded-[4px] font-m border ${
                  s.online
                    ? "bg-delivered-bg text-delivered border-delivered-border"
                    : "bg-surface text-ink-subtle border-border"
                }`}
              >
                {s.online ? "Online" : "Offline"}
              </span> */}
            </div>
          ))}
        </Section>

        {/* PRODUCTS */}
        <Section title={`Products (${branch.products.length})`}>
          {branch.products.length === 0 ? (
            <div className="text-[13px] text-ink-subtle">
              No products stocked at this branch.
            </div>
          ) : (
            <div className="space-y-2">
              {branch.products.slice(0, 3).map((p) => {
                const isLowStock = p.quantity <= p.lowStockAlert && p.lowStockAlert > 0;

                return (
                  <div
                    key={p.id + p.trackingId}
                    onClick={() => router.push(`/inventory?search=${encodeURIComponent(p.name)}&productId=${p.id}`)}
                    className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-border-strong transition"
                  >
                    <div className="px-3 py-2.5 flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">{p.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.merchantName && (
                            <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: p.merchantColor || "#374151" }}
                              />
                              {p.merchantName}
                            </span>
                          )}
                          {p.description && (
                            <span className="text-[11px] text-ink-subtle truncate">
                              {p.merchantName ? "·" : ""} {p.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-ink-subtle shrink-0">
                        {p.trackingId}
                      </span>
                    </div>

                    <div className="border-t border-border bg-gray-50/50 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono font-medium text-ink">{p.quantity} units</span>
                        {isLowStock && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 font-m">
                            Low stock
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-ink-subtle">
                        Alert: {p.lowStockAlert}
                      </span>
                    </div>
                  </div>
                );
              })}

              {branch.products.length > 3 && (
                <button
                  onClick={() => setShowAllProducts(true)}
                  className="w-full py-2.5 text-xs font-medium text-amber-600 hover:text-amber-700 border border-border rounded-lg hover:bg-surface transition"
                >
                  View all {branch.products.length} products
                </button>
              )}
            </div>
          )}
        </Section>

        <ProductListModal
          isOpen={showAllProducts}
          onClose={() => setShowAllProducts(false)}
          title={branch.name}
          subtitle={`${branch.products.length} products · ${branch.holding} total units`}
          variant="branch"
          products={branch.products.map((p): ProductListItem => ({
            id: p.id,
            trackingId: p.trackingId,
            name: p.name,
            description: p.description,
            quantity: p.quantity,
            lowStockAlert: p.lowStockAlert,
            merchantName: p.merchantName,
            merchantColor: p.merchantColor,
          }))}
        />
      </div>

      {/* DELETE CONFIRMATION */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center p-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 max-w-72 w-full text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">Delete this branch?</div>
            <div className="text-xs text-gray-500 mb-4">
              &quot;{branch.name}&quot; will be permanently removed. This cannot be undone.
            </div>
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmDelete(false); setError(""); }}
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
    </div>
  );
}
