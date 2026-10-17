# GameShelf — Rombak UI, Performance & Fitur

Dokumen ini berisi rencana rombak UI dan performance GameShelf, dari Fase 0 sampai Fase 5, plus status tiap fase.

| Fase | Isi | Status |
|---|---|---|
| 0 | Ukur baseline | ✅ Selesai (sebagian, lihat catatan) |
| 1 | Fondasi design system | ✅ Selesai |
| 2 | Performance | ✅ Selesai |
| 3 | Redesign per halaman | ⏳ Belum |
| 4 | Bersih-bersih fitur gak relevan | ⏳ Belum |
| 5 | Fitur baru (dipilih satu-satu) | ⏳ Belum |

Branch kerja: `feat/ui-perf-foundation` (dibuat dari `chore/deps-upgrade`). Perubahan Fase 1–2 **belum di-commit**.

---

## Latar belakang

**Masalah UI**
- Tampilannya generik: semua `zinc-900` + border, dan gradient + badge yang sama di-copy-paste ke tiap halaman.
- Font Geist gak pernah kepake karena `body` di-override `font-family: Arial`.
- Dashboard dan Shelf ngumpet di dropdown icon user.

**Masalah performance**
- Semua halaman dibungkus animasi client `FadeIn` 1 detik. Konten mulai dari `opacity: 0`, jadi baru kelihatan setelah JS hydrate + 1 detik.
- `SessionProvider` fetch `/api/auth/session` tiap kali halaman dibuka, dan navbar sempat nampilin "Loading...".
- Slider GOTY fetch 12 detail game penuh ke RAWG tiap cache kosong.
- Recharts (library berat) dipakai cuma buat 2 chart.
- Gambar hero ambil file original full-size, dan gak ada `loading.tsx` sama sekali.

**Keputusan arah:**
- **Visual:** "Cinematic gamer" — background hampir hitam, cover art jadi elemen utama, satu warna aksen.
- **Navigasi:** top nav dengan link jelas + bottom tab bar di mobile (dikerjain di Fase 3).
- **Urutan:** UI + performance dulu, fitur baru belakangan.

> ⚠️ Next.js di repo ini versi **16.4** dan API-nya beda dari versi lama. Sebelum ngoding, baca guide terkait di `node_modules/next/dist/docs/`, terutama `use-cache.md`, `cacheLife.md`, `migrating-to-cache-components.md`, `adopting-partial-prefetching.md`, dan `image.md`.

---

## Fase 0 — Baseline ✅

Server production (`next start`) diukur pakai script yang login dengan akun test, lalu ngitung total JS per halaman (ukuran mentah, belum gzip).

| Halaman | Sebelum | Sesudah Fase 2 |
|---|---|---|
| `/auth` | 837KB | 828KB |
| `/games` | 748KB | 742KB |
| `/games/[slug]` | 742KB | 734KB |
| `/shelf` | 821KB | 740KB |
| `/shelf/[slug]` | 748KB | 742KB |
| `/dashboard` | **1132KB** | **734KB** |

**Cara baca tabel:**
- Sisa JS-nya kebanyakan dari framework (react-dom + Next ≈ 390KB), plus `zod` di halaman auth.
- Angka di atas ikut ngitung chunk polyfill 112KB yang gak di-download browser modern.
- HTML `/games` cuma ~25KB setelah gzip.

**Catatan:** baseline **Lighthouse/LCP belum diambil**. Peningkatan terbesar dari Fase 2 (hilangnya animasi fade) ada di LCP, bukan di ukuran JS, jadi belum ada angkanya.

**Tips buat `next start` lokal:** set `AUTH_TRUST_HOST=true`, kalau gak login bakal error `UntrustedHost`.

---

## Fase 1 — Fondasi Design System ✅

### Token desain — `src/app/globals.css`
Semua warna sekarang lewat token Tailwind v4 (`@theme`), jadi class-nya jadi `bg-base`, `bg-surface`, `text-muted`, `border-line`, `text-accent`, dan seterusnya.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `base` | `#07070a` | background halaman |
| `surface` / `surface-2` | `#0f0f14` / `#17171f` | card, input |
| `line` / `line-strong` | `#24242e` / `#34343f` | border |
| `fg` / `muted` / `subtle` | `#ededf2` / `#8b8b99` / `#5c5c69` | teks |
| `accent` | `#c6f432` (lime) | tombol utama, highlight, glow |
| `status-*` | planned biru, playing ungu, completed lime, dropped merah | badge & chart |

**Isi lainnya di `globals.css`:**
- `shadow-glow` buat efek hover aksen.
- Animasi `animate-fade-up` / `animate-fade-in` versi CSS, yang otomatis mati kalau user pilih `prefers-reduced-motion`.
- Token font ada di blok **`@theme inline`**. Ini wajib: variabel `next/font` nempel di `<body>`, jadi kalau ditaruh di `@theme` biasa nilainya invalid dan browser jatuh ke font sistem.

**Ganti warna aksen** cukup dengan ubah `--color-accent` dan `--color-accent-strong`.

### Font — `src/app/layout.tsx`
- **Chakra Petch** (`font-display`) buat heading.
- **Geist** (`font-sans`) buat body, dan **Geist Mono** (`font-mono`) buat angka/statistik.
- Override `font-family: Arial` udah dihapus.

### Satu sumber status — `src/constants/status.ts`
- `SHELF_STATUSES`, `STATUS_META` (label, warna, class badge), dan `isShelfStatus()`.
- Gantiin `utils/statusStyle.ts` (dihapus) dan konstanta warna di chart.
- `constants/filtersshelf.ts` sekarang di-generate dari sini.

### Komponen UI — `src/components/ui/`

| File | Isi |
|---|---|
| `Button.tsx` | `Button` + `buttonClass()` (buat `<Link>` yang tampil kayak tombol). Varian: `primary`, `secondary`, `ghost`, `danger`. |
| `Badge.tsx` | `Badge`, `StatusBadge`, `MetacriticBadge` (sebelumnya logic warna Metacritic diduplikat 3x) |
| `Card.tsx` | `Card`, `SectionHeading`, `Skeleton` |
| `ConfirmDialog.tsx` | Dialog konfirmasi pakai `<dialog>` native. Gantiin `sweetalert2`. |
| `StarRating.tsx` | Rating bintang, bisa read-only. Klik bintang yang sama buat hapus rating. |

**Catatan:** layout halaman belum diubah. Yang berubah baru warna dan komponennya; perombakan layout masuk Fase 3.

---

## Fase 2 — Performance ✅

### 1. Animasi `FadeIn` halaman dibuang
- `src/components/AnimatedSection.tsx` dihapus dan dependency `motion` di-uninstall.
- Gantinya class CSS `animate-fade-up` (0.35 detik, tanpa JS).
- `<main>` dobel di tiap halaman (layout + page) sekarang jadi `<div>`, dan gradient background ditaruh sekali di `layout.tsx`.

### 2. `SessionProvider` dihapus
- `src/app/Provider.tsx` dihapus.
- `Navbar.tsx` sekarang server component: session dibaca di server lewat `<Suspense>` dengan fallback skeleton.
- Dropdown user dipisah ke `src/components/UserMenu.tsx` (client).
- Efeknya: gak ada lagi request `/api/auth/session` dan gak ada flicker "Loading...".

### 3. Cache Components + Partial Prefetching
**`next.config.ts`:**
- `cacheComponents: true`
- `partialPrefetching: true`

**`src/lib/rawg.ts`:**
- Semua fetch pakai `"use cache"` + `cacheLife` + `cacheTag`.
- Durasi cache: list/search `hours`, detail game `days`.
- `unstable_cache` (deprecated) udah gak dipakai.

**`getSession()` di `src/auth.ts`:**
- Kenapa perlu: `auth()` dari next-auth manggil `crypto`/`new Date()` sebelum baca cookie, dan Cache Components nolak itu waktu prerender.
- Aturannya: **pakai `getSession()` di Server Component**. Route handler dan server action boleh tetap pakai `auth()`.

**Footer:** tahun dirender di scope `"use cache"`, karena `new Date()` juga dilarang di shell prerender.

**Hasil build:** semua halaman sekarang `◐ Partial Prerender` (shell statis + bagian dinamis di-stream).

### 4. Skeleton loading
- File `loading.tsx` ada di `/games`, `/games/[slug]`, `/shelf`, `/shelf/[slug]`, dan `/dashboard` (ikut ke-pakai buat `/dashboard/share/[id]`).
- Skeleton yang dipakai bareng ada di `src/components/Skeletons.tsx`.

### 5. GOTY jadi data statis
- `src/constants/gotywinner.ts` sekarang berisi snapshot data RAWG + `awardYear`. Pemenang GOTY gak bakal berubah, jadi gak perlu fetch.
- Slider nampilin badge **GOTY 2025**, dan seterusnya.
- `getGOTYGames()` dihapus dari `rawg.ts`.
- **Kalau ada pemenang GOTY baru:** tambah entry di `gotywinner.ts`.

### 6. Gambar
`src/utils/image.ts`:
- Thumbnail pakai `media/crop/600/400/...`.
- Ukuran lain pakai `media/resize/<w>/-/...`.
- RAWG **cuma terima lebar 80 / 200 / 420 / 640 / 1280 / 1920**; lebar lain di-redirect ke file original. Function-nya otomatis milih lebar valid terkecil yang cukup. Contoh: hero 1280px turun dari ~764KB jadi ~400KB.

Komponen:
- Hero detail game dan shelf detail pakai `preload`. `priority` sudah deprecated di Next 16.
- Slide GOTY pakai `loading="eager"` + `fetchPriority="high"`.
- Thumbnail GOTY dan top games dashboard dikasih `sizes` yang benar, jadi gak download versi 100vw lagi.

### 7. Recharts diganti chart CSS
- `src/components/dashboard/DashboardCharts.tsx` sekarang server component.
- Donut pakai `conic-gradient`, bar pakai `div`.
- Dependency `recharts` di-uninstall. Halaman dashboard **−400KB JS**.

### 8. Mutasi shelf → Server Actions + optimistic UI
`src/app/shelf/actions.ts` berisi `addToShelf`, `updateShelf`, `removeFromShelf`:
- Validasi pakai zod schema yang lama, lalu manggil `shelf.service.ts`.
- Setelah berhasil manggil `revalidatePath` buat `/shelf` dan `/dashboard`.
- Return-nya `{ ok, error }`, jadi error 409 (game sudah ada) dan 404 tampil sebagai toast.

Komponen yang pindah ke server actions:
- **`AddToShelfButton`** pakai `useTransition`.
- **`ShelfCard`** pakai `useOptimistic`, jadi status dan hapus langsung kelihatan dan otomatis rollback kalau gagal. Hapus pakai `ConfirmDialog`.
- **`ShelfDetail`** cuma ngirim field yang berubah. Sebelumnya tiap save ngirim semua field, jadi request lambat bisa nimpa data lain. Validasi jam main sekarang angka bulat ≥ 0.
- `router.refresh()` udah gak dipakai.

### 9. Query DB
`src/services/shelf.service.ts`:
- `getUserShelf` sekarang cuma `select` field yang dirender.
- `getDashboardData` dibungkus React `cache()`, karena dipanggil 2x di `/dashboard/share/[id]`.

Prisma:
- Index `@@index([userId])` diganti `@@index([userId, status])`. Lookup per `userId` udah tercakup index unique.
- Migration `prisma/migrations/20261017022207_shelf_user_status_index/` sudah di-apply ke DB lokal.

### Dependency yang dihapus
`motion`, `recharts`, `sweetalert2`

### Perubahan kecil yang ikut masuk
- Link "Top Games" di dashboard sekarang pakai slug, sebelumnya `rawgId`.
- `SearchBar` gak pakai `useSearchParams` lagi; search selalu reset ke page 1.
- Link "Back to Search Results" di detail game sekarang URL-nya di-encode.
- Teks "Showing 0 game" diperbaiki jadi "0 games".
- Label `htmlFor`/`aria-label` ditambah di select, input, dan tombol ikon.

---

## Fase 3 — Redesign per Halaman ⏳

| Halaman | Rencana |
|---|---|
| **Navbar** | Link **Discover · My Shelf · Stats** dengan active state, search global (submit ke `/games?search=`), avatar menu (logout). Mobile: **bottom tab bar** fixed. Komponen yang pakai `usePathname` dibungkus `<Suspense>` (aturan Cache Components). |
| **Landing** `/` | Hero dengan kolase cover art (dari `gotyWinners`), headline + 1 CTA, 3 feature, CTA penutup. Tombol "Learn More" yang sekarang link ke `/` (dead link) diarahkan ke section features atau dihapus. |
| **Discover** `/games` | Banner GOTY tunggal + rail thumbnail. Grid **poster card**: cover besar, info muncul saat hover, tombol quick-add. Search bar sticky. **Fix:** `searchQuery` belum di-`encodeURIComponent` di `Pagination.tsx` & `GameCard.tsx`. |
| **Game detail** | Backdrop full-bleed blur + poster, panel aksi (add + pilih status langsung), deskripsi collapse "read more", platform/genre jadi chip, card "Links" (isinya cuma 1 link) digabung ke Game Info. |
| **My Shelf** | Tab status **dengan jumlah**, sort (terbaru/rating/judul), search lokal. Card: menu titik-tiga (ubah status, hapus). |
| **Shelf detail** | Hero sinematik, status segmented control, playtime & notes inline-edit + autosave. Badge status dobel dihapus. |
| **Stats** `/dashboard` | KPI strip (total, completed, total jam, rata-rata rating), donut status, Top 5, tombol share. |
| **Auth** | Split layout: form di kiri, kolase cover art di kanan (desktop). Label `htmlFor`. |
| **Footer** | Dirampingkan. |

---

## Fase 4 — Yang Dihapus / Dirapikan ⏳

- **Section "How It Works"** di landing: isinya dobel sama feature card. Hapus `components/landing/HowItsWork.tsx`, `constants/howitswork.ts`, dan tipe `HowItsWorkProps`.
- **FAQ** dipangkas jadi 3 pertanyaan atau dihapus. Jawaban "share your collection" gak akurat, karena yang bisa di-share cuma dashboard.
- **Navigasi GOTY yang dobel tiga** (panah + titik + thumbnail strip) disisain satu aja.
- **Bar chart "Playtime by status"** diganti angka KPI total jam.
- **API route yang udah gak dipakai:** `/api/shelf`, `/api/shelf/[id]`, dan `/api/shelf/detail/[slug]`.
- **Opsional:** ganti `react-toastify` dengan `sonner` yang lebih ringan.
- **Sisa OAuth:** kolom `User.provider` di-drop lewat migration. `User.image` dipertahankan kalau mau fitur avatar nanti.

---

## Fase 5 — Ide Fitur Baru ⏳ (urut prioritas, pilih yang mau)

1. **Indikator "In shelf" + quick-add dengan status** di game card & detail. Ambil set `rawgId` milik user sekali. *Effort kecil, dampak besar*: sekarang user baru tahu game udah ada setelah kena error.
2. **Filter Discover:** genre, platform, urutan (popular/rating/terbaru), dan tahun rilis. Semuanya didukung parameter API RAWG.
3. **Profil publik `/u/[username]`** gantiin `/dashboard/share/[cuid]`. Isinya shelf + stats, dengan toggle privat/publik. Butuh kolom `username` + `isPublic`, plus **OG image dinamis** (`opengraph-image.tsx`) buat preview link di WA/Twitter.
4. **Timeline & Year in Review:** kolom `startedAt`/`completedAt` otomatis terisi saat status berubah, lalu dipakai buat chart "completed per bulan".
5. **Backlog queue:** urutan prioritas buat game PLANNED ("Up next"), dengan drag-to-reorder.
6. **Detail game lebih kaya:** galeri screenshot, store links, dan "game dalam seri yang sama" (endpoint RAWG `/screenshots`, `/stores`, `/game-series`).
7. **Custom lists / collections**, misalnya "Couch co-op" atau "Comfort games".
8. *(Besar, nanti)* Import library dari Steam.

---

## Cara verifikasi

```bash
npm run lint
npm run build          # build juga memvalidasi aturan Cache Components
npm run dev            # cek dev overlay / .next/dev/logs/next-development.log
```

**Production lokal:**

```bash
npm run build
AUTH_TRUST_HOST=true npx next start -p 3100
```

**Checklist manual** (sudah dicek untuk Fase 1–2):
- [x] Login → diarahkan ke `/games`, navbar langsung nampilin avatar tanpa "Loading..."
- [x] Discover: slider GOTY, grid, search, pagination
- [x] Detail game → Add to shelf → pindah ke `/shelf`
- [x] Shelf: ubah status langsung berubah dan tersimpan; hapus pakai dialog dan jumlah game ikut ke-update
- [x] Shelf detail: rating, jam main, catatan tersimpan dan gak saling menimpa (dicek langsung ke DB)
- [x] Dashboard: KPI, donut CSS, top games
- [ ] Tampilan mobile (dicek lagi setelah Fase 3, karena bottom tab bar baru ada di sana)
- [ ] Lighthouse / LCP sebelum vs sesudah

## Aturan penting buat ngoding selanjutnya

- **Server Component butuh session?** Pakai `getSession()`, bukan `auth()`.
- **`new Date()`, `Math.random()`, `crypto` di server component** harus ada di dalam scope `"use cache"`, setelah `await connection()`, atau dipindah ke client component.
- **`useSearchParams` / `usePathname`** di layout harus dibungkus `<Suspense>`.
- **Mutasi data** lewat server action di `src/app/shelf/actions.ts`, bukan `fetch` ke `/api`.
- **Warna** pakai token (`bg-surface`, `text-muted`, `text-accent`, …), jangan `zinc-*` atau hex langsung.
- **Status shelf** (label/warna) selalu ambil dari `src/constants/status.ts`.
- **Gambar RAWG** lewat `getCroppedImageUrl(url, width)`, dan selalu isi prop `sizes`.
