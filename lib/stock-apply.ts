/**
 * The write side of stock planning: reading products in, and applying a plan
 * back. Planning itself is pure and lives in lib/stock-plan.ts.
 *
 * Deliberately avoids GET /branches. That endpoint embeds every branch's full
 * stock, staff and invites (~1.3 MB), takes ~17s to start responding and has its
 * connection dropped often enough that a write flow can't depend on it. Branch
 * names are read off the stock rows products already carry instead.
 */

import {
  getProduct,
  getProducts,
  updateProduct,
  ApiProduct,
  BranchEntry,
} from "./products";
import { ProductUpdate, SystemBranch, SystemProduct } from "./stock-plan";

/** Retries transient failures (dropped connections, 5xx) with backoff. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1)
        await new Promise((r) => setTimeout(r, 800 * 2 ** i));
    }
  }
  throw lastErr;
}

export function toSystemProduct(p: ApiProduct): SystemProduct {
  return {
    id: p.id,
    name: p.name,
    merchantName: p.merchant?.name || "",
    trackingId: p.trackingId,
    stocks: (p.stocks || []).flatMap((s) => {
      const branchId = s.branchId || s.branch?.id;
      return branchId
        ? [
            {
              branchId,
              quantity: s.quantity ?? 0,
              lowStockAlert: s.lowStockAlert ?? 0,
            },
          ]
        : [];
    }),
  };
}

/** Branch names as they appear on the stock rows of the products given. */
export function branchesFromProducts(products: ApiProduct[]): SystemBranch[] {
  const names = new Map<string, string>();
  for (const p of products) {
    for (const s of p.stocks || []) {
      const id = s.branchId || s.branch?.id;
      if (!id) continue;
      if (s.branch?.name) names.set(id, s.branch.name);
      else if (!names.has(id)) names.set(id, "");
    }
  }
  return [...names]
    .map(([id, name]) => ({ id, name: name || `Branch ${id.slice(0, 8)}` }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type LoadProgress = {
  /** Products known so far, after de-duplication. */
  loaded: number;
  /** Page just returned, and how many the server says there are. */
  page: number;
  lastPage: number;
};

/**
 * Every product stocked at one branch. Scoped to the branch on purpose — the
 * unfiltered list runs to thousands of rows, which is not something to pull
 * down over mobile data to match a dozen product names.
 *
 * `onPage` fires after each page with the cumulative list, so a caller can show
 * what has arrived and let people work with it while the rest is still coming.
 */
export async function fetchBranchProducts(
  branchId: string,
  onPage?: (products: ApiProduct[], progress: LoadProgress) => void
): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  let page = 1;
  let last = 1;

  // Hard cap so a malformed `meta` can never spin forever.
  while (page <= last && page <= 100) {
    const current = page;
    const res = await withRetry(() =>
      getProducts({ branchId, page: current, limit: 100 })
    );
    const batch = (res.data || res.products || []) as ApiProduct[];
    all.push(...batch);
    last = res.meta?.lastPage ?? res.totalPages ?? 1;

    // Pages can shift while we read them; never count a product twice.
    const deduped = [...new Map(all.map((p) => [p.id, p])).values()];
    onPage?.(deduped, { loaded: deduped.length, page: current, lastPage: last });

    if (batch.length === 0) break;
    page++;
  }

  return [...new Map(all.map((p) => [p.id, p])).values()];
}

/**
 * Re-reads the product right before writing, so the write is built on current
 * stock rather than whatever the list returned earlier, and sends the COMPLETE
 * branches array — correct whether the backend replaces or merges that field.
 *
 * Returns the quantity expected at each branch it touched, for verification.
 */
export async function applyUpdate(
  u: ProductUpdate
): Promise<Record<string, number>> {
  const fresh = await withRetry(() => getProduct(u.product.id));
  const byBranch = new Map<string, BranchEntry>();

  for (const s of fresh.stocks || []) {
    const bid = s.branchId || s.branch?.id;
    if (!bid) continue;
    byBranch.set(bid, {
      branchId: bid,
      quantity: s.quantity ?? 0,
      lowStockAlert: s.lowStockAlert ?? 0,
    });
  }

  const expected: Record<string, number> = {};

  if (u.deltas) {
    // Delivery note: subtract from what the server holds RIGHT NOW, not from the
    // number shown in the preview, so a sale recorded in between isn't wiped out.
    for (const [bid, delta] of Object.entries(u.deltas)) {
      const cur = byBranch.get(bid);
      if (!cur) continue; // no stock row any more — nothing to deduct
      const next = Math.max(0, cur.quantity - delta);
      byBranch.set(bid, { ...cur, quantity: next });
      expected[bid] = next;
    }
  } else {
    for (const [bid, qty] of Object.entries(u.targets)) {
      byBranch.set(bid, {
        branchId: bid,
        quantity: qty,
        lowStockAlert: byBranch.get(bid)?.lowStockAlert ?? 0,
      });
      expected[bid] = qty;
    }
  }

  if (Object.keys(expected).length > 0) {
    await updateProduct(u.product.id, { branches: [...byBranch.values()] });
  }
  return expected;
}

/**
 * Adds stock to one branch, on top of whatever the server holds right now —
 * not on top of what the screen last read, so a sale recorded in between is
 * kept. A branch with no stock row yet gets one, which is the normal case for
 * a product arriving at a branch for the first time.
 *
 * Returns the quantity expected at that branch, for verification.
 */
export async function applyStockIncrease(
  productId: string,
  branchId: string,
  add: number
): Promise<Record<string, number>> {
  const fresh = await withRetry(() => getProduct(productId));
  const byBranch = new Map<string, BranchEntry>();

  for (const s of fresh.stocks || []) {
    const bid = s.branchId || s.branch?.id;
    if (!bid) continue;
    byBranch.set(bid, {
      branchId: bid,
      quantity: s.quantity ?? 0,
      lowStockAlert: s.lowStockAlert ?? 0,
    });
  }

  const current = byBranch.get(branchId);
  const next = (current?.quantity ?? 0) + add;
  byBranch.set(branchId, {
    branchId,
    quantity: next,
    lowStockAlert: current?.lowStockAlert ?? 0,
  });

  await updateProduct(productId, { branches: [...byBranch.values()] });
  return { [branchId]: next };
}

/** Reads a product back and reports whether the written quantities landed. */
export async function verifyUpdate(
  productId: string,
  expected: Record<string, number>
): Promise<boolean> {
  const fresh = toSystemProduct(await withRetry(() => getProduct(productId)));
  return Object.entries(expected).every(
    ([bid, qty]) =>
      fresh.stocks.find((s) => s.branchId === bid)?.quantity === qty
  );
}
