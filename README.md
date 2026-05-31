# Sonichoice Delivery Management System

A full-stack delivery operations platform for managing parcel logistics, inventory, merchants, and staff across multiple branches. Built with Next.js 16, React 19, TypeScript 5, and Tailwind CSS 4.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Authentication & Access Control](#authentication--access-control)
- [Pages & Features](#pages--features)
  - [Dashboard](#dashboard)
  - [Parcels](#parcels)
  - [Inventory](#inventory)
  - [Merchants](#merchants)
  - [Branches](#branches)
  - [Staff Management](#staff-management)
  - [Activity Logs](#activity-logs)
  - [Profile](#profile)
  - [Auth Pages](#auth-pages)
  - [Landing Page](#landing-page)
- [Export System](#export-system)
- [Reusable UI Components](#reusable-ui-components)
- [Architecture & Patterns](#architecture--patterns)
- [API Integration](#api-integration)

---

## Overview

Sonichoice is a delivery management platform designed for companies that move parcels between branches, track stock levels per location, coordinate merchants, and need a full audit trail of operations. It supports multiple user roles, branch-aware actions, searchable filters, debounced inputs, and client-side PDF/Excel exports.

**Base API:** `https://sonichoice-inventory-api.onrender.com/api/v1`

---

## Tech Stack

**Core**
- Next.js 16.1.6 (App Router, Turbopack)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4

**Libraries**
- `jspdf` + `jspdf-autotable` — PDF generation with styled tables
- `exceljs` + `file-saver` — Excel workbook generation
- `lucide-react` + `react-icons` — iconography
- `next/font` — Syne (headings), DM Mono (codes/IDs)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Environment variable required:
```
NEXT_PUBLIC_API_URL=https://sonichoice-inventory-api.onrender.com/api/v1
```

Build for production:
```bash
npm run build
npm start
```

---

## Authentication & Access Control

### Login Flow
- Email + password login via `POST /auth/login`
- Server returns `accessToken`, `refreshToken`, and `user` object
- Access token stored in `localStorage` AND cookie (7-day max-age) — cookie is read by Next.js middleware for route protection
- User object stored in `localStorage` for quick role/branch lookups

### Token Refresh
- Centralized `api()` wrapper in `lib/api.ts` handles all requests
- **Pre-flight check:** if the access token's JWT `exp` is past, attempt a refresh before the request
- **On 401 (non-auth endpoints):** call `POST /auth/refresh` with the stored refresh token, retry the original request with the new access token
- **Concurrent refresh protection:** a single in-flight refresh promise is shared across parallel requests to avoid duplicate calls
- **Failure fallback:** clears all tokens, redirects to `/login`

### Route Protection
- `middleware.ts` checks the `token` cookie on every request
- Unauthenticated users hitting protected pages → redirected to `/login`
- Authenticated users hitting auth pages (`/login`, `/forgot-password`, etc.) → redirected to `/dashboard`
- Public pages: `/`, `/login`, `/forgot-password`, `/reset-password`, `/accept-invite`

### Role-Based Access
- **ADMIN** — full access, can delete parcels, manage staff, view all activity logs, register users
- **USER (Staff)** — branch-scoped actions only
- Staff Management page redirects non-admins to `/dashboard`
- Parcel status actions are scoped: from-branch can dispatch/cancel, to-branch can receive/return
- Delete actions on parcels restricted to admins

### Error Handling in `api()`
- 10-second request timeout via `AbortController` → "Request timed out" message
- `TypeError: Failed to fetch` → "Network error. Please check your connection."
- Empty DELETE responses handled via `res.text()` then conditional `JSON.parse`

---

## Pages & Features

### Dashboard
**Route:** `/dashboard`

Real-time overview pulling from `GET /dashboard` and `GET /activity-logs` in parallel.

**Sections:**
- **Greeting header** — time-of-day greeting with user's first name from JWT
- **Metrics Grid** — In Transit, Received (this month), Pending. Monthly growth % with up/down trend arrows computed from `parcelStats.thisMonth` vs `parcelStats.lastMonth`
- **Quick Stats** — parcels this month, active merchants (from `overview`), total branches
- **Top Merchants** — shows top 2 with "+X more" row linking to `/merchants`. Each card: colored avatar, name, product count, parcel count. Click-through to merchants page
- **Parcel Movement (Incoming/Outgoing)** — tabs split by direction based on the user's branchId. Incoming = `toBranchId === userBranchId`, Outgoing = `fromBranchId === userBranchId`. Empty state per tab. Each row clickable → navigates to `/parcels?parcelId=X` to auto-open detail panel
- **Branch Holdings** — from `branchHoldings`. Each row clickable → `/branches?branchId=X`
- **Activity Feed** — last 5 activity logs. Action text, user · branch, relative time ("5s", "2h", "3d"). "See more" link → `/activity`

**Quick Actions in header:**
- "My Profile" → `/profile`
- "Log Parcel" → `/parcels`

---

### Parcels
**Route:** `/parcels`

Complete parcel lifecycle management.

**Features:**
- **Status pills with counts** — powered by `statusCounts` from the API (not client-side filtering). Categories: All, In Transit, Pending, Received, Cancelled, Returned
- **Filters:**
  - Debounced search (400ms)
  - Branch filter (from-branch)
  - Merchant filter
- **Sortable table columns:** Parcel ID, Merchant(s), Route (from → to), Current Location, Size, Status, Date In
- **Multi-merchant display** — up to 2 merchant avatars stacked, "+X more" for additional
- **Server-side pagination** with meta response
- **Auto-open detail panel** via `?parcelId=X` query param (used by dashboard click-throughs)
- **Export** (Download button) — opens a preview modal, generates branded PDF or Excel client-side

**Detail Panel:**
- Parcel tracking number, status badge, progress bar (pending 20% → transit 60% → received 100%)
- **Status action buttons** — context-aware based on user's branch:
  - Pending + from-branch: "Mark In Transit", "Cancel"
  - Transit + to-branch: "Mark Received", "Return"
  - Transit + from-branch: "Cancel"
  - Neither branch → no actions shown
- **Edit mode** — size, additional info, items (with full modal for re-selecting products)
  - Only available to users in the from or to branch
  - Not available on received/returned/cancelled parcels
  - Resets when switching between parcels
- **Delete** — admin only, with confirmation dialog
- **Items section grouped by merchant** — merchant header with initials + color, then product list with tracking IDs and quantities
- **Movement History** — fetched from `GET /activity-logs?resourceType=parcel&resourceId=<id>`. Timeline with dots, action text, user · branch, formatted date/time

**Log Parcel Form (side panel):**
- **From branch** — auto-set to user's branch and locked
- **To branch** — dropdown (excludes from-branch)
- **Size** (optional) — Small/Medium/Large/XL
- **Additional info** — textarea
- **Products** — derived from the user's branch `productStocks` (no extra API call). Preview of 5 products, "View all X products" opens a full modal with search, checkbox selection, quantity inputs (capped at stock)
- **Merchant derivation** — `merchantId` is derived from the first selected product, so mixing merchants is not supported
- **Success feedback** — shows created tracking number
- **Smart close** — only re-fetches the parcel list if a parcel was actually created

---

### Inventory
**Route:** `/inventory`

Product and stock management across branches.

**Table columns:** SKU (tracking ID), Item, Merchant, Stored At (badges per branch), Total Stock, Date In, Updated

**Features:**
- Debounced search (400ms)
- Branch filter (fetched from `/branches`, deduplicated)
- Merchant filter
- Sortable columns: Name, Total Stock, Date In, Updated
- **Race condition protection** on detail panel — uses `latestSelectId` ref so clicking product A then product B doesn't display A's data
- **URL query param support** — `/inventory?search=X&productId=Y` auto-filters and opens the product
- Server-side pagination
- Loading skeleton, disabled filters during loading
- Export preview modal (PDF/Excel)

**Add Product Form:**
- Searchable merchant input (with colored avatar preview, outside-click to close, clear button)
- Product name, description, notes, date received (optional)
- **Branches section** — one row per selectable branch with quantity + low stock alert inputs

**Detail Panel:**
- Product metadata, merchant info, per-branch stock breakdown
- Edit mode — name, description, notes, and inline stock adjustments per branch
- Delete with confirmation
- **Movement History** — fetched from `GET /activity-logs?resourceType=product&resourceId=<id>`

---

### Merchants
**Route:** `/merchants`

Merchant directory with full CRUD.

**Features:**
- Grid of merchant cards with color-coded initials avatar
- Empty state when no merchants match filters
- Debounced search (400ms)
- Status filter (Active/Inactive/Suspended)
- Export preview modal (PDF/Excel)

**Create/Edit Forms:**
- Name (required)
- Email (optional)
- Phone (optional)
- Brand color (color picker)
- Status

**Detail Panel:**
- Merchant info + status badge
- Contact info (phone, email)
- Inline edit mode
- Delete with confirmation
- **Products section** — clean list of all products with stock breakdown per branch. Shows up to 3, "View all" button opens a wider modal accommodating 100+ products with search, 3-column grid, pagination (30/page)
- Each product clickable → `/inventory?search=<name>&productId=<id>`

---

### Branches
**Route:** `/branches`

Branch network management.

**Features:**
- Summary strip: Total Branches, Total Holding, In Transit, Received (all aggregated)
- Grid of branch cards with holding, transit, received metrics
- **Query param support** — `/branches?branchId=X` auto-opens the branch detail (used by dashboard click-throughs)

**Create/Edit Forms:**
- Name, address, city, state (required)
- ZIP, country, phone, email (optional)

**Detail Panel:**
- Branch address, manager, contact info
- Metrics (holding, transit, received)
- **Staff list** — derived from branch's `users` array
- **Products section** — from `productStocks`, with merchant labels per product. 3-product preview + "View all" modal
- Inline edit mode
- Delete with confirmation

---

### Staff Management
**Route:** `/staff` — **admin-only** (non-admins redirected to `/dashboard`)

User management powered by `GET /users`.

**Features:**
- Debounced search
- Role filter (Admin/Staff)
- Branch filter
- Server-side pagination
- "Register User" button → `/register`
- Table columns: Name (with avatar + phone), Email, Role (styled badge), Branch, Joined

**Detail Panel:**
- Account details — email, phone, branch, role, join date
- **Inline edit mode** — name, phone, role (Staff/Admin), branch
- Saves via `PATCH /users/:id`
- Edit state resets when switching users

### Register User (`/register`)
- Admin-only page (requires Bearer token)
- Fields: name, email, branch, role, password, confirm password
- Password validation (min 8 chars, match confirmation)
- Success state with "Register Another" and "Back to Dashboard" options
- Calls `POST /auth/private/register`

---

### Activity Logs
**Route:** `/activity`

System-wide audit trail.

**Features:**
- **Scope toggle (admin only):** "All Activity" vs "My Activity" (uses different endpoints)
- **Keyword pills with counts** — All, Parcel, Product, Stock, Merchant, Branch, User, Login, Logout, Other. Counts come from `keywordCounts` in the API response regardless of active filter. Sent to backend as uppercase (e.g. `PARCEL`)
- **Filters:**
  - Debounced search (3 seconds — longer delay to avoid spamming)
  - Branch filter (admin + "All" scope only)
- **Server-side pagination**
- **Feed display** — each entry has a colored keyword icon, action text, user name · email · branch, relative time ago
- **Error state card** — full-width card with contextual icon (WifiOff for network, AlertTriangle for other), friendly headline, raw error message (for network issues), "Try again" button that refetches with current filters
- **Empty state** when no results
- Supports filtering by `resourceId` and `resourceType` (used by detail panel movement history)

---

### Profile
**Route:** `/profile`

User account page.

**Account Details Card:**
- Initials avatar, name, role
- Email, phone, branch (read directly from stored user object — `user.branch.name`)
- Role badge
- Member since date

**Update Password Card:**
- Current password, new password, confirm password
- Validation: all required, min 8 chars, new ≠ current, new === confirm
- Calls `POST /auth/password-update` (no email passed — uses auth token)
- Success banner, fields reset

---

### Auth Pages

| Route | Purpose |
|-------|---------|
| `/login` | Email/password login. Redirects to dashboard on success |
| `/forgot-password` | Request password reset (UI only — backend flow not wired) |
| `/reset-password/[id]` | Token-based password reset |
| `/accept-invite/[id]` | Multi-step account setup from invitation |

---

### Landing Page
**Route:** `/`

Marketing homepage with:
- Navbar with CTA
- Hero section
- Statistics band
- Features showcase
- Workflow visualization (drop-off → transit → received)
- Dashboard preview
- Footer

---

## Export System

All exports are generated **client-side** — no backend dependency.

### PDF Exports
- Landscape orientation
- Dark header bar with SONICHOICE branding + document title
- Generated-on date
- Formatted tables via `jspdf-autotable` with alternating row colors
- Footer with page numbers and document type
- Custom column mapping per resource type

### Excel Exports
- Workbook with one sheet per resource
- Styled title + subtitle rows
- Generated date
- Colored header row with white text
- Alternating row background colors
- Auto-sized columns with proper widths
- Footer row with record count

### Export Preview Modal
- Used across Parcels, Inventory, and Merchants
- Shows data preview before download
- Format toggle (PDF / Excel)
- Clean cancel/download actions

---

## Reusable UI Components

### Core
- **Button** — variants (primary/secondary/danger), sizes (sm/md/lg), loading state
- **Input** — icon support, validation styling, size variants
- **Select** — dropdown with placeholder, size variants
- **Table** — composable (`Table.Head`, `Table.Row`, `Table.Cell`, `Table.Body`), supports `onRowClick` prop
- **StatusBadge** — color-coded pills for parcel/merchant/user statuses
- **StatusPillsContainer** — tab-like filter pills with counts and disabled state
- **Tag** — compact badge for IDs, sizes, tracking numbers

### Layout
- **PageHeader** — title, header text, sub text, up to 2 action buttons, `loading` prop for skeleton state
- **Sidebar** — role-aware navigation (hides Staff Management for non-admins), active state highlight, user info + logout button with confirmation popup
- **FilterBar** — composable with search + multiple dropdown filters, `disabled` prop, reset support

### Modals / Panels
- **Overlay** — backdrop for side panels
- **ProductListModal** — reusable large product list viewer (search, pagination 30/page, 3-col grid XL, variants for "merchant" and "branch" contexts)
- **ExportPreviewModal** — preview + format selection before export

---

## Architecture & Patterns

### State Management
- React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`)
- No external state library
- `localStorage` for tokens + user object
- URL query params for deep-linking (product IDs, parcel IDs, branch IDs, search)

### Performance Patterns
- **Debounced search** (`useDebounce` hook) — 400ms default, 3s for activity logs
- **Ref-based dependency management** — `allBranchesRef`, `allMerchantsRef` in parcels page to avoid re-fetching when dropdown data loads
- **Race condition protection** — `latestSelectId` ref in detail panels so stale responses don't overwrite the latest click
- **Parallel fetches** — dashboard uses `Promise.all` for dashboard data + activity logs
- **Concurrent refresh protection** — single in-flight refresh promise shared across parallel requests

### UX Patterns
- **Skeleton loaders** everywhere — including PageHeader (opt-in via `loading` prop)
- **Empty states** — every list has a friendly empty state with icon and hint
- **Error cards** — full-width, icon-based, with retry button
- **Disabled filters during loading** — search bars, dropdowns, status pills
- **Logout confirmation popup** — full-screen overlay
- **Delete confirmation dialogs** — inside detail panels
- **URL cleanup** — query params are stripped after being applied (`router.replace`)

### File Structure
```
app/(routes)/
├── (app)/              # authenticated pages
│   ├── dashboard/
│   ├── parcels/
│   ├── inventory/
│   ├── merchants/
│   ├── branches/
│   ├── staff/
│   ├── register/
│   ├── profile/
│   ├── activity/
│   └── layout.tsx      # app shell with Sidebar
└── (auth)/             # public auth pages
    ├── login/
    ├── forgot-password/
    ├── reset-password/[id]/
    └── accept-invite/[id]/

components/
├── ui/                 # reusable primitives
├── parcel/
├── inventory/
├── merchants/
├── branches/
├── staff/
├── dashboard/
├── login/ forgot-password/ reset-password/ accept-invite/
└── home-page/          # landing page sections

lib/
├── api.ts              # fetch wrapper + token refresh
├── auth.ts             # login, logout, register, refresh
├── parcels.ts / products.ts / merchants.ts / branches.ts / users.ts
├── dashboard.ts
├── activityLogs.ts
└── export.ts           # PDF/Excel generators

hooks/
└── useDebounce.ts

types/                  # all TypeScript interfaces
middleware.ts           # route protection
```

---

## API Integration

### Parcels
- `GET /parcels` — list with filters (page, search, status, merchantId, fromBranchId, toBranchId), returns `meta` + `statusCounts`
- `POST /parcels` — create with items array
- `GET /parcels/:id`
- `PATCH /parcels/:id` — update size, toBranchId, additionalInfo, items
- `PATCH /parcels/:id/status` — status transition
- `DELETE /parcels/:id`

### Products
- `GET /products?page=&search=`
- `POST /products` — includes `branches` array with stock per branch
- `GET /products/:id`
- `PATCH /products/:id` — optional `branches` field
- `DELETE /products/:id`

### Merchants
- `GET /merchant?search=&status=`
- `POST /merchant`, `PATCH /merchant/:id`, `DELETE /merchant/:id`

### Branches
- `GET /branches` — returns `productStocks`, `users`, counts
- `POST /branches`, `PATCH /branches/:id`, `DELETE /branches/:id`

### Users
- `GET /users?page=&search=&role=&branchId=`
- `PATCH /users/:id` — name, phone, role, branchId

### Auth
- `POST /auth/login` — returns `user`, `accessToken`, `refreshToken`
- `POST /auth/logout`
- `POST /auth/refresh` — returns fresh tokens
- `POST /auth/password-update` — currentPassword + newPassword
- `POST /auth/private/register` — admin-only user registration

### Dashboard
- `GET /dashboard` — returns `parcelStats`, `overview`, `recentParcels`, `branchHoldings`, `topMerchants`, `recentActivity`

### Activity Logs
- `GET /activity-logs` — supports `page`, `search`, `actionKeyword`, `userId`, `branchId`, `resourceId`, `resourceType`
- `GET /activity-logs/me` — current user's logs
- `GET /activity-logs/user/:userId`
- `GET /activity-logs/branch/:branchId`

All responses include `data`, `meta`, and `keywordCounts`.

---

## Deployment

The app is designed to be deployed on Vercel, Netlify, or any Node.js-compatible host. Static assets are handled by Next.js, API calls go to the external backend.
