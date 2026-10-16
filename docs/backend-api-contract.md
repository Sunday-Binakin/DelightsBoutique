# Delight's Boutique — Backend API Contract

Status: **draft — no backend exists yet.** Everything described here replaces the
`localStorage`-backed modules in `src/lib/*` (`product-store.ts`, `orders.ts`,
`customers.ts`, `staff.ts`, `admin-auth.ts`, `notifications.ts`, `newsletter.ts`,
`reports.ts`, `audit-log.ts`, `banners.ts`, `flash-sale.ts`, `collection-section.ts`,
`storefront-copy.ts`, `pages-content.ts`, `site-settings.ts`, `owner-profile.ts`,
`image-upload.ts`). Those files stay as the source of truth for current field
shapes and default content; this document is the target API once a real
backend/database is built, and it tightens a few things the client-only version
could get away with (price trust, auth, image storage).

Currency is always Ghanaian Cedi (GHS), amounts are numbers (not strings), and
all timestamps are ISO 8601 UTC strings.

---

## 1. Conventions

- **Base URL:** `/api` (implementable as Next.js Route Handlers under `src/app/api/**`).
- **Format:** JSON request/response bodies. `Content-Type: application/json`,
  except image upload which is `multipart/form-data`.
- **Auth transport:** httpOnly, `Secure`, `SameSite=Lax` session cookie set on
  login (`db_admin_session`). No `Authorization` header / bearer tokens needed
  for the admin panel. CSRF: use a double-submit cookie or `SameSite=Lax` +
  requiring a custom header (`X-Requested-With`) on mutating requests.
- **Errors:** always this shape, with a conventional HTTP status code:

  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "phone is required", "fields": { "phone": "required" } } }
  ```

  Standard codes: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401),
  `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429),
  `INTERNAL_ERROR` (500).

- **Pagination** (all admin list endpoints and any public list that can grow
  unbounded): query params `page` (1-based, default 1) and `limit` (default
  20, max 100). Response envelope:

  ```json
  { "data": [ ... ], "page": 1, "limit": 20, "total": 134 }
  ```

- **Partial updates** use `PATCH` with only the changed fields. Full
  create/replace uses `POST`/`PUT`.
- **Slugs** are the public identifier for products/categories (generated from
  name via the existing `slugify()` in `src/lib/format.ts`); they double as
  the primary key in the current client code, but the backend should also
  keep an internal `id` (UUID) so a product can be renamed without breaking
  references — `slug` remains unique and is what the URL/API path uses.

---

## 2. Data models

### Product
```ts
{
  id: string;                 // UUID, internal
  slug: string;                // unique, URL-facing
  name: string;
  category: string;            // denormalized category name (for display)
  categorySlug: string;        // FK -> Category.slug
  description: string;
  retailPrice: number;
  wholesalePrice?: number;
  wholesaleMoq?: number;        // min qty to qualify for wholesalePrice
  compareAtPrice?: number;      // pre-discount price, for "on sale" strike-through
  rating: number;               // 0–5
  reviewCount: number;
  tone: "rose" | "cream" | "charcoal" | "gold"; // placeholder art theme when no image
  badge?: "New" | "Best Seller";
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  sizes?: string[];
  colors?: string[];
  imageUrls?: string[];         // first = cover image; absolute URLs, not data URLs
  createdAt: string;
  updatedAt: string;
}
```

### Category
```ts
{
  id: string;
  slug: string;                // unique
  name: string;
  tone: "rose" | "cream" | "charcoal" | "gold";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Order / OrderItem
```ts
OrderItem {
  slug: string;        // product slug at time of order
  name: string;         // product name snapshot (survives renames/deletes)
  quantity: number;
  unitPrice: number;    // price ACTUALLY charged (retail or wholesale) — server-computed, never client-supplied
  size?: string;
  color?: string;
}

Order {
  id: string;                  // e.g. "DB-7Q3K9X2A" — opaque, non-sequential
  createdAt: string;
  status: "Pending Confirmation" | "Confirmed" | "Processing"
        | "Out for Delivery" | "Ready for Pickup" | "Completed" | "Cancelled";
  items: OrderItem[];
  subtotal: number;            // server-computed sum(items.quantity * items.unitPrice)
  customerName: string;
  phone: string;                // raw as entered; normalize on read, see §5
  fulfillment: "Delivery" | "Pickup";
  address?: string;             // required if fulfillment = Delivery
  paymentMethod: "Bank Transfer" | "Mobile Money" | "Cash on Delivery/Pickup";
  notes?: string;                // customer-submitted, shown to admin
  internalNotes?: string;        // admin-only, never returned on public endpoints
}
```
`Out for Delivery` is only a valid status transition for `fulfillment: "Delivery"`
orders; `Ready for Pickup` only for `"Pickup"` orders (see `getStatusOptions()`
in `src/lib/orders.ts`) — the backend should reject the mismatched transition
with `VALIDATION_ERROR` rather than trusting the admin UI to only offer valid
options.

### Customer (derived, not its own table unless you add real accounts)
```ts
{
  phone: string;        // normalized, acts as the identity key — see §5
  name: string;          // name on most recent order
  orderCount: number;
  totalSpent: number;    // sum of subtotal across non-cancelled orders — confirm with product before finalizing (current client code sums ALL orders incl. cancelled; flagged in §7)
  lastOrderAt: string;
  wholesale: boolean;     // manually flagged by admin
}
```

### StaffMember
```ts
{
  id: string;
  name: string;
  email: string;           // unique, case-insensitive
  phone?: string;
  permissions: Array<"Manage Products" | "Manage Orders" | "Manage Customers" | "Manage Content">;
  active: boolean;
  passwordHash: string;     // never returned by any endpoint
  createdAt: string;
  updatedAt: string;
}
```

### OwnerProfile
```ts
{ name: string; email: string; phone?: string; passwordHash: string }
```
Singleton — one row (or env-seeded admin table entry with `role = owner`).

### OrderNotification
```ts
{ id: string; orderId: string; customerName: string; subtotal: number; createdAt: string; read: boolean }
```
Auto-created server-side whenever an order is created — not client-writable
except for the `read` flag.

### NewsletterSubscriber
```ts
{ email: string; subscribedAt: string }
```

### AuditEntry
```ts
{ id: string; timestamp: string; actor: string; action: string }
```
Written server-side on every admin mutation (product/category save or
delete, order status/notes change, staff create/update/password-reset,
content save, settings save, wholesale flag toggle). Never client-writable
directly.

### Content / settings singletons
These are each a single editable JSON row (or one table with a `key` column),
not per-user:

- **SiteSettings** — `tagline, whatsappNumber, whatsappMessage, phoneDisplay,
  address, hours, announcement, bankTransferInstructions,
  mobileMoneyInstructions, cashInstructions, facebookUrl, instagramUrl,
  tiktokUrl, notifyByEmail, notificationEmail, notifyByWhatsapp`.
  **`notifyByEmail`, `notificationEmail`, `notifyByWhatsapp` are admin-only —
  never serve them on the public read endpoint.**
- **BannerSet** — `heroMain, heroSide1, heroSide2, fullWidth`, each a
  `PromoBannerContent`: `{ eyebrow, title, ctaLabel, href, tone,
  artCategorySlug, imageUrl?, textColor? }`.
- **FlashSaleContent** — `{ eyebrow, title, endsAt, productSlugs[] }`.
- **CollectionSectionContent** — `{ eyebrow, title, newArrivalsLabel,
  bestSellersLabel, wholesalePicksLabel, newArrivalsSlugs[],
  bestSellersSlugs[], wholesalePicksSlugs[] }`.
- **StorefrontCopy** — the full shape in `src/lib/storefront-copy.ts`
  (trust badges, contact/wholesale/newsletter/cart/checkout copy, etc.).
- **PagesContent** — `about, shipping, returns, terms, privacy` (each
  `{ title, body }`) plus `faqs: FaqItem[]` (`{ id, question, answer }`).

---

## 3. Auth & permissions

Two roles:
- **Owner** — exactly one account, full access to everything, the only role
  that can manage staff and see the audit log.
- **Staff** — scoped to whichever of the four permissions they're granted:
  `Manage Products`, `Manage Orders`, `Manage Customers`, `Manage Content`.

Route → required permission (mirrors `getRequiredPermission()` in
`src/lib/admin-auth.ts`):

| Area | Required |
|---|---|
| `/api/admin/staff/**` | Owner only |
| `/api/admin/audit-log` | Owner only |
| `/api/admin/products/**`, `/api/admin/categories/**` | `Manage Products` |
| `/api/admin/orders/**`, `/api/admin/notifications/**` | `Manage Orders` |
| `/api/admin/customers/**` | `Manage Customers` |
| `/api/admin/content/**` | `Manage Content` |
| `/api/admin/reports/**` | Any authenticated admin (owner or any staff role) — recommend adding a dedicated `View Reports` permission before launch; see §7 |
| `/api/admin/account/**` | Any authenticated admin (self only) |
| `/api/admin/uploads` | Whichever permission owns the calling form (`Manage Products` or `Manage Content`) |

**Unlike the current placeholder (`admin-auth.ts` accepts any password), the
real backend must verify a hashed password** (bcrypt/argon2) for both the
owner and staff logins, and rate-limit login attempts per email/IP.

---

## 4. Endpoints

### 4.1 Auth

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/login` | none | `{ email, password }` | `200 { role, staffId?, email, name }` + sets session cookie. `401` on bad credentials, `403 { code: "STAFF_DEACTIVATED" }` if the staff account is inactive. |
| POST | `/api/auth/logout` | session | — | `204`, clears cookie |
| GET | `/api/auth/session` | session | — | `200 AdminSession` or `401` |

### 4.2 Storefront catalog (public, read-only)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | Query: `category` (slug), `search`, `badge`, `sort` (`newest|price-asc|price-desc|rating`), `page`, `limit`. Paginated. |
| GET | `/api/products/:slug` | `404` if missing. |
| GET | `/api/categories` | Full list, not paginated (small, fixed set). |
| GET | `/api/categories/:slug` | `404` if missing. |

### 4.3 Orders & checkout (public)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/orders` | Create an order from checkout. Body: `{ items: [{ slug, quantity, size?, color? }], customerName, phone, fulfillment, address?, paymentMethod, notes? }`. **Server computes `unitPrice`/`subtotal`** — see §5. `201` with the full `Order` (minus `internalNotes`, which doesn't exist yet at creation anyway). `400` if any item is out of stock, quantity ≤ 0, address missing for `Delivery`, or `slug` doesn't resolve to a product. Rate-limit by IP to prevent spam. |
| GET | `/api/orders/track?phone=` | "Track My Order." Returns every order for that (normalized) phone, newest first, `internalNotes` stripped. `200 { data: Order[] }`, empty array if none — never error on no-match, to avoid confirming/denying whether a phone number has ordered. Rate-limit by IP. |
| GET | `/api/orders/:id` | Used by the order-confirmation page right after checkout. Public by design (the ID is an opaque token the customer already has), `internalNotes` stripped. `404` if not found. |

### 4.4 Newsletter (public)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/newsletter/subscribe` | Body `{ email }`. `201` on new subscriber, `200 { duplicate: true }` if already subscribed (not an error — matches current `addSubscriber` behavior). Validate email format server-side. |

### 4.5 Public content (read-only; feeds the storefront)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/content/site-settings` | Public-safe subset only — **excludes** `notifyByEmail`, `notificationEmail`, `notifyByWhatsapp`. |
| GET | `/api/content/banners` | `BannerSet` |
| GET | `/api/content/flash-sale` | `FlashSaleContent`, plus resolve `productSlugs` server-side into full `Product[]` (mirrors `pickFlashSaleProducts`) so the client doesn't need a second round trip. |
| GET | `/api/content/collection-section` | `CollectionSectionContent`, with each tab's slugs resolved to `Product[]` (mirrors `pickCollectionTabProducts`). |
| GET | `/api/content/storefront-copy` | `StorefrontCopy` |
| GET | `/api/content/pages/:key` | `key` ∈ `about\|shipping\|returns\|terms\|privacy` → `StaticPage`. `404` on unknown key. |
| GET | `/api/content/faqs` | `FaqItem[]` |

### 4.6 Admin: Products & Categories (`Manage Products`)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/admin/products` | Create. Server generates `slug` from `name` if not supplied, `409` if it collides. |
| PATCH | `/api/admin/products/:slug` | Partial update. |
| DELETE | `/api/admin/products/:slug` | Hard delete. (Order line items keep their own `name`/`unitPrice` snapshot, so this is safe even for referenced products.) |
| POST | `/api/admin/categories` | Create. |
| PATCH | `/api/admin/categories/:slug` | Partial update. |
| DELETE | `/api/admin/categories/:slug` | `409` if products still reference it — require reassigning them first (current client code allows orphaning products; tighten this in the real backend). |

### 4.7 Admin: Orders (`Manage Orders`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/orders` | Query: `status`, `fulfillment`, `paymentMethod`, `categorySlug`, `from`, `to` (ISO dates, inclusive), `search` (matches name/phone), `page`, `limit`. Paginated, newest first. Includes `internalNotes`. |
| GET | `/api/admin/orders/:id` | Full order incl. `internalNotes`. |
| PATCH | `/api/admin/orders/:id` | Body: `{ status?, internalNotes? }`. Validate `status` is a legal transition for the order's `fulfillment` (§2). Writes an `AuditEntry`. |

### 4.8 Admin: Customers (`Manage Customers`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/customers` | Aggregated `CustomerSummary[]`, paginated, sorted by `lastOrderAt` desc. Query: `search` (name/phone), `wholesaleOnly`. |
| GET | `/api/admin/customers/:phone/orders` | All orders for that normalized phone. |
| PATCH | `/api/admin/customers/:phone` | Body `{ wholesale: boolean }`. Writes an `AuditEntry`. |

### 4.9 Admin: Staff (Owner only)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/staff` | All staff. Never includes password/hash. |
| POST | `/api/admin/staff` | Body `{ name, email, phone?, permissions }`. Server generates a one-time password, hashes it for storage, and **returns the plaintext password exactly once** in the response (`{ member, password }`) — same as `createStaff()` today — since there's no email delivery yet. |
| PATCH | `/api/admin/staff/:id` | Update `name`, `email`, `phone`, `permissions`, `active`. |
| POST | `/api/admin/staff/:id/reset-password` | Generates + hashes a new password, returns plaintext once: `{ password }`. |

No staff-delete endpoint — deactivation (`active: false`) is the only removal
path, matching current behavior (preserves attribution on past audit entries
and order edits).

### 4.10 Admin: Notifications (`Manage Orders`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/notifications` | Most recent first, capped server-side (e.g. last 50, or paginate if you want full history). |
| GET | `/api/admin/notifications/unread-count` | `{ count: number }` — for the sidebar bell. |
| PATCH | `/api/admin/notifications/:id/read` | Marks one read. |
| POST | `/api/admin/notifications/mark-all-read` | Marks all read. |

### 4.11 Admin: Content management (`Manage Content`)

| Method | Path | Notes |
|---|---|---|
| PUT | `/api/admin/content/site-settings` | Full `SiteSettings` (or partial via `PATCH` — your call; `PATCH` is more consistent with the rest). |
| PUT | `/api/admin/content/banners/:key` | `key` ∈ `heroMain\|heroSide1\|heroSide2\|fullWidth`. Body: `PromoBannerContent`. |
| PATCH | `/api/admin/content/flash-sale` | Partial `FlashSaleContent`. |
| PATCH | `/api/admin/content/collection-section` | Partial `CollectionSectionContent`. |
| PATCH | `/api/admin/content/storefront-copy` | Partial `StorefrontCopy`. |
| PUT | `/api/admin/content/pages/:key` | `key` ∈ `about\|shipping\|returns\|terms\|privacy`. Body: `StaticPage`. |
| POST | `/api/admin/content/faqs` | Create one FAQ: `{ question, answer }` → server assigns `id`. |
| PATCH | `/api/admin/content/faqs/:id` | Edit one. |
| DELETE | `/api/admin/content/faqs/:id` | Remove one. |
| PUT | `/api/admin/content/faqs/reorder` | Body `{ order: string[] }` (ids in display order) — only if the admin UI supports drag-reordering; otherwise omit. |

Every write here logs an `AuditEntry` (e.g. `"Updated homepage hero banner"`).

### 4.12 Admin: Reports

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/reports` | Query: `from`, `to`, `fulfillment`, `paymentMethod`, `categorySlug` (all optional, same semantics as `ReportFilters`). Returns one composite payload so the Reports page needs a single request: `{ summary: SalesSummary, topProducts: ProductSales[], statusBreakdown: BreakdownRow[], paymentBreakdown: BreakdownRow[] }`, computed server-side with the same logic as `src/lib/reports.ts` (`getSalesSummary`, `getTopProducts`, `getStatusBreakdown`, `getPaymentMethodBreakdown`). |

### 4.13 Admin: Account (self-service, any authenticated admin)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/account/profile` | Owner → `OwnerProfile` (minus password); staff → their own `StaffMember` (minus password). |
| PATCH | `/api/admin/account/profile` | Update `name`, `email`, `phone`. Re-syncs the session's cached name/email. |
| POST | `/api/admin/account/change-password` | Body `{ currentPassword, newPassword }`. Verify `currentPassword` against the stored hash before accepting — this is new relative to today's placeholder, which never checks it. |

### 4.14 Admin: Audit log (Owner only)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/audit-log` | Paginated, newest first. Query: `search` (actor/action text). |

### 4.15 Uploads

| Method | Path | Notes |
|---|---|---|
| POST | `/api/admin/uploads` | `multipart/form-data`, field `file`. Validates it's an image, resizes server-side (mirrors the client-side cap in `image-upload.ts`: max 1000px on the long edge, JPEG q≈0.82), stores it in object storage (S3/Cloudinary/Supabase Storage/etc.), returns `{ url }` — an absolute HTTPS URL, **not** a data URL. Required permission matches whatever form is uploading (`Manage Products` for product/category photos, `Manage Content` for banner photos). Reject >5MB uploads with `413`. |

### 4.16 Health

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `200 { ok: true }` — for uptime checks / deploy smoke tests. No auth. |

---

## 5. Server-side business rules (things the client-only version couldn't enforce)

1. **Never trust client-submitted prices.** `POST /api/orders` must receive
   only `slug` + `quantity` (+ `size`/`color`) per line; the server looks up
   the current `Product`, picks `wholesalePrice` if the order's phone number
   is flagged `wholesale: true` **and** `quantity >= wholesaleMoq` for that
   line, else `retailPrice`, and computes `subtotal` itself. The client-only
   version trusted whatever `unitPrice` the browser sent — fine for a demo,
   not for a real store.
2. **Stock enforcement.** Reject (`400`) any order containing a line where
   the product's `stockStatus === "Out of Stock"`. (No quantity-level
   inventory tracking exists yet — `stockStatus` is a manually-set enum, not
   a count — so this is a presence check, not a decrement.)
3. **Phone normalization.** Apply the same digit-only + `233…` → `0…`
   normalization as `normalizePhone()` in `src/lib/orders.ts` everywhere a
   phone is used as a lookup key (`/api/orders/track`, customer aggregation,
   wholesale flag), so `+233241234567`, `233241234567`, and `0241234567` are
   always treated as the same customer.
4. **Order status transitions** must respect `fulfillment` (Delivery ⇒
   `Out for Delivery`, Pickup ⇒ `Ready for Pickup`) as described in §2.
5. **Order IDs** should stay short and shareable like today's
   (`DB-<base36 timestamp>`) but should not be purely sequential/guessable if
   you're relying on "knows the ID" as the access control for
   `GET /api/orders/:id` — consider appending a short random suffix.
6. **Every admin mutation writes an `AuditEntry`** (`actor` = the signed-in
   admin's name, `action` = a human-readable description) — currently done
   client-side via `logAction()` calls scattered through the admin forms;
   move this into the API layer so it can't be skipped or forged.
7. **Audit log and reports should never be reachable by an unauthenticated
   request**, even though in the current client-only app that's only
   enforced by not linking to the page.

---

## 6. Known gaps to resolve before building (ask the owner / product decision, not purely technical)

- **`CustomerSummary.totalSpent`** — current client code (`customers.ts`)
  sums *all* orders including cancelled ones. Decide whether the backend
  should exclude `Cancelled` orders from this total (it already does for
  `SalesSummary.confirmedRevenue` in reports) — recommend excluding them for
  consistency.
- **Reports access** — not currently gated by `getRequiredPermission()`, so
  any signed-in staff member can see full sales data today. Decide whether
  that's intentional or whether to add a `View Reports` permission.
- **No real inventory/stock counts** — `stockStatus` is admin-set, not
  decremented by orders. Out of scope here unless you want real inventory
  tracking added as a v2.
- **No customer accounts** — "customers" are derived from phone numbers on
  orders, and `/api/orders/track` is unauthenticated (anyone who knows a
  phone number used at checkout can see those orders). This matches the
  current product behavior intentionally (no login friction for a
  WhatsApp/offline-payment store) but is worth flagging explicitly as an
  accepted tradeoff, not an oversight.
- **Email/WhatsApp order-alert delivery** (`SiteSettings.notifyByEmail` /
  `notifyByWhatsapp`) is currently just stored preference with no sender
  wired up. Needs an email provider (e.g. Resend/SendGrid) and/or WhatsApp
  Business API integration if you want those to actually fire.

---

## 7. Migration map (localStorage key → backend resource)

| localStorage key | Backend resource |
|---|---|
| `delight-boutique-products` | `products` table |
| `delight-boutique-categories` | `categories` table |
| `delight-boutique-orders` | `orders` + `order_items` tables |
| `delight-boutique-wholesale-flags` | `customers.wholesale` (or a `customer_flags` table keyed by normalized phone) |
| `delight-boutique-staff` | `staff` table (with `password` → `password_hash`) |
| `delight-boutique-owner-profile` | `owner_profile` singleton row |
| `delight-boutique-admin-session` | server-side session (cookie + session store, not localStorage) |
| `delight-boutique-notifications` | `order_notifications` table |
| `delight-boutique-newsletter-subscribers` | `newsletter_subscribers` table |
| `delight-boutique-audit-log` | `audit_log` table |
| `delight-boutique-banners` | `site_content` row, key `banners` |
| `delight-boutique-flash-sale` | `site_content` row, key `flash_sale` |
| `delight-boutique-collection-section` | `site_content` row, key `collection_section` |
| `delight-boutique-storefront-copy` | `site_content` row, key `storefront_copy` |
| `delight-boutique-pages-content` | `site_content` row, key `pages_content` |
| `delight-boutique-site-settings` | `site_content` row, key `site_settings` |
| `delight-boutique-cart` | **stays client-side** (localStorage via `cart-context.tsx`) — no server cart needed since checkout is a single-shot submit, not a persistent account cart. |
| `delight-boutique-wishlist` | **stays client-side** (localStorage via `wishlist-context.tsx`) — same reasoning; revisit only if customer accounts are added later. |
