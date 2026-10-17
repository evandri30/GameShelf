# GameShelf — Rombak UI, Performance & Fitur

Dokumen ini berisi rencana rombak UI dan performance GameShelf, dari Fase 0 sampai Fase 5, plus status tiap fase.

| Fase | Isi | Status |
|---|---|---|
| 0 | Ukur baseline | ✅ Selesai (sebagian, lihat catatan) |
| 1 | Fondasi design system | ✅ Selesai |
| 2 | Performance | ✅ Selesai |
| 3 | Redesign per halaman | ✅ Selesai |
| 4 | Bersih-bersih fitur gak relevan | ✅ Selesai |
| 5 | Fitur baru (dipilih satu-satu) | ⏳ Belum |

Branch kerja: `feat/ui-perf-foundation` (dibuat dari `chore/deps-upgrade`). Fase 1–2 sudah di-commit (`f2f3ea6`), Fase 3 (`3afd92c`). Fase 4 **belum di-commit**.

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

## Fase 3 — Redesign per Halaman ✅

### Komponen bersama baru

| File | Isi |
|---|---|
| `components/ui/Menu.tsx` | Dropdown yang nutup kalau klik di luar, tekan Escape, atau item dipilih. Dipakai di menu user dan menu titik-tiga di card shelf. |
| `components/nav/NavLinks.tsx` | `NavLinks` (link desktop + active state) dan `MobileTabBar` (tab bar bawah di mobile). Pakai `usePathname`. |
| `components/CoverCollage.tsx` | Dinding cover art GOTY yang dimiringkan, dipakai di hero landing dan halaman auth. |
| `components/Backdrop.tsx` | Backdrop blur full-bleed dari art game, dipakai di detail game dan shelf detail. |
| `components/games/QuickAddButton.tsx` | Tombol tambah 1-tap dari card Discover. Game masuk sebagai PLANNED, dan kalau udah ada di shelf tombolnya berubah jadi tanda ✓. |
| `components/games/ExpandableHtml.tsx` | Deskripsi panjang dipotong + tombol "Read more". Tombolnya cuma muncul kalau teksnya memang kepanjangan. |
| `components/auth/AuthForm.tsx` | Form login/register dipisah dari halaman. Logic-nya sama persis. |

### Per halaman

**Navbar** (`components/Navbar.tsx`)
- Link **Discover · My Shelf · Stats** dengan garis aksen di link yang aktif.
- Search global pakai `next/form`, submit ke `/games?search=` (muncul di layar ≥ `lg`).
- Avatar membuka menu (Stats, My Shelf, Logout).
- **Tab bar bawah di mobile** dirender lewat `MobileNavSlot` setelah footer. Harus di luar `<nav>`, karena `backdrop-filter` bikin `position: fixed` ikut "terkurung" di dalam navbar.
- `getSession()` sekarang dibungkus React `cache()`, jadi navbar, tab bar, dan halaman cuma baca session sekali per request.

**Landing** (`/`)
- Hero setinggi layar dengan kolase cover art di belakang (nyelip di bawah navbar transparan).
- Headline baru *"Every game you play. One shelf."*
- CTA "See how it works" menuju `#features`, gantiin tombol "Learn More" yang dulu link mati ke `/`.
- FAQ pakai `<details>` native (tanpa JS). Copy feature diperbarui.

**Discover** (`/games`)
- Search bar sticky di bawah navbar + jumlah game/hasil.
- Slider GOTY: satu banner + rail thumbnail berisi tahun. Panah dan titik dibuang, ada progress bar auto-advance yang berhenti saat di-hover/fokus, dan `GOTYSelect.tsx` dihapus.
- Card 16:9 dengan cover art: judul di atas gambar, platform muncul saat hover, quick-add di pojok.
- Link card nutup seluruh card (stretched link), jadi tombol quick-add gak nested di dalam `<a>`.
- Pagination baru dengan URL yang **di-encode benar** (`URLSearchParams`); dulu query search gak di-encode.
- State kosong "No games found".
- `components/games/PageHeader.tsx` dihapus.

**Detail game** (`/games/[slug]`)
- Backdrop blur, key art di kiri, judul/badge/rating/studio di kanan.
- Panel aksi: **pilih status + Add to shelf**. Setelah berhasil, tampil "In your shelf" + link "Open in shelf" dan halaman gak pindah.
- `addToShelf` sekarang menerima `status` opsional (schema + service ikut diupdate).
- Deskripsi bisa di-collapse.
- Card "Game info" sekarang berisi rilis, rata-rata playtime, developer, publisher, dan website. Card "Links" lama digabung ke sini.
- Platform, genre, dan tag tampil sebagai chip.

**My Shelf** (`/shelf`)
- Tab status **dengan jumlah game** per tab.
- Search lokal + sort (Recently added / Highest rated / Title A–Z).
- Card menampilkan rating + jam main.
- Menu titik-tiga berisi "Move to …" dan "Remove from shelf". Hapus tetap lewat `ConfirmDialog`, yang sekarang cuma dirender saat dibuka.
- Empty state baru dengan tombol ke Discover.
- `constants/filtersshelf.ts` dihapus.

**Shelf detail** (`/shelf/[slug]`)
- Backdrop + key art, info "On your shelf since …", rating bintang, dan link ke halaman game.
- **Status pakai segmented control** (4 tombol), badge status dobel dihapus.
- **Jam main** tersimpan saat keluar dari field atau tekan Enter.
- **Catatan autosave** 0,9 detik setelah berhenti ngetik dan saat blur. Ada indikator "Saving…/Saved", jadi gak ada toast tiap simpan.
- Hapus rating sekarang nyimpan `null` (bukan `0`), jadi gak ikut nurunin rata-rata.

**Stats** (`/dashboard` + `/dashboard/share/[id]`)
- **KPI strip:** jumlah game, completed + persentase completion, total jam, dan rata-rata rating (+ jumlah game yang dirating).
- Donut status + daftar per status (jumlah & jam).
- **Top 5 jadi daftar ranking** dengan thumbnail.
- Bar chart "Playtime by status" dihapus (jatah Fase 4, ikut sekalian).
- `getDashboardData` sekarang juga menghitung `totalHours`, `averageRating`, dan `ratedGames`.
- **Bug fix:** top games dulu urut `rating DESC`, dan Postgres naruh `NULL` duluan, jadi game yang belum dirating malah muncul paling atas. Sekarang pakai `nulls: 'last'`.
- `DashboardCharts.tsx` di-rename jadi `StatusBreakdown.tsx`.

**Auth** (`/auth`)
- Split layout: form di kiri, kolase cover art + tagline di kanan (desktop).
- Label `htmlFor`, `autoComplete`, `aria-invalid`/`aria-describedby` buat error, dan tombol show/hide password punya label.

**Loading skeleton:** semua `loading.tsx` disesuaikan dengan layout baru (`DetailHeaderSkeleton` dan `CardGridSkeleton` di `components/Skeletons.tsx`).

**Footer:** tetap seperti Fase 1, udah ramping.

### Performa & detail teknis
- Gambar yang posisinya above the fold sekarang `loading="eager"`, berdasarkan warning LCP dari Next di dev:
  - card baris pertama (shelf, dan Discover kalau gak ada banner GOTY)
  - thumbnail rail GOTY dan top games
  - backdrop blur
  - kolase (`fetchPriority="low"`)
- `images.qualities: [40, 75]` di `next.config.ts`. Next 16 cuma nerima quality yang terdaftar, dan `40` dipakai buat backdrop blur.
- Token `animate-progress` buat progress bar slider.
- **Hati-hati:** `text-base` di Tailwind itu **ukuran font**, bukan warna token `base`. Buat teks hitam di atas warna aksen pakai `text-accent-fg`.

### Diverifikasi di browser
Login/logout, quick-add, add dengan status, pindah status lewat menu (jumlah di tab ikut berubah), hapus, rating/status/jam main/catatan (autosave), Stats, landing, auth, dan tampilan mobile 390px (tab bar bawah, gak ada scroll horizontal).

---

## Fase 4 — Yang Dihapus / Dirapikan ✅

| Item | Hasil |
|---|---|
| Section "How It Works" | ✅ Dihapus: `components/landing/HowItsWork.tsx`, `constants/howitswork.ts`, dan tipe `HowItsWorkProps`. Tombol hero diganti jadi "See what you get" (menuju `#features`). |
| FAQ | ✅ Dipangkas jadi 3 pertanyaan (*What is GameShelf? / Is it free? / Can I share my shelf?*). Jawaban soal share sekarang akurat: yang bisa di-share itu **halaman Stats**. |
| Navigasi GOTY dobel tiga | ✅ Selesai di Fase 3 |
| Bar chart "Playtime by status" | ✅ Selesai di Fase 3 (diganti KPI total jam) |
| Tombol "Learn More" link mati | ✅ Selesai di Fase 3 |
| API route gak terpakai | ✅ Dihapus: `/api/shelf`, `/api/shelf/[id]`, dan `/api/shelf/detail/[slug]`, sekarang 404. Semua mutasi lewat server action di `src/app/shelf/actions.ts`. API yang tersisa cuma `/api/auth/[...nextauth]` dan `/api/auth/register`. |
| Kolom `User.provider` | ✅ Di-drop lewat migration `20261017025317_drop_user_provider`. `User.image` tetap ada (dipakai avatar di halaman share, buat fitur avatar nanti). |
| Data gak terpakai | ✅ `getUserBySlug` gak lagi `include: { user }`, dan field `user` dihapus dari `ShelfFDetailProps`. |
| `react-toastify` → `sonner` | ⏭️ **Di-skip.** `react-toastify` cuma ~12,7KB gzip (JS 9,8KB + CSS 3KB), sedangkan `sonner` sekitar ~10KB. Hemat 2–3KB gak sepadan sama ngubah ~8 file. |

**⚠️ Setelah pull / migration ini:**
- Jalanin `npx prisma migrate dev` (atau `migrate deploy` di server).
- Jalanin **`npx prisma generate`**. Prisma 7 gak lagi otomatis generate client setelah migrate.
- **Restart `next dev`**. Dev server nyimpen instance Prisma client di `globalThis`, jadi sebelum di-restart dia masih nyari kolom `provider` dan register/login bakal error.

**Ukuran JS setelah Fase 3–4** (mentah, belum gzip): `/auth` 848KB, `/games` 751KB, `/games/[slug]` 744KB, `/shelf` 751KB, `/shelf/[slug]` 749KB, `/dashboard` 740KB. Naik ~10KB dari Fase 2 karena ada fitur client baru (menu, quick-add, tab bar).

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
- [x] Tampilan mobile 390px: tab bar bawah, gak ada scroll horizontal (Fase 3)
- [ ] Lighthouse / LCP sebelum vs sesudah

## Aturan penting buat ngoding selanjutnya

- **Server Component butuh session?** Pakai `getSession()`, bukan `auth()`.
- **`new Date()`, `Math.random()`, `crypto` di server component** harus ada di dalam scope `"use cache"`, setelah `await connection()`, atau dipindah ke client component.
- **`useSearchParams` / `usePathname`** di layout harus dibungkus `<Suspense>`.
- **Mutasi data** lewat server action di `src/app/shelf/actions.ts`. Route `/api/shelf*` sudah dihapus.
- **Habis migration Prisma:** `npx prisma generate`, lalu restart `next dev`.
- **Warna** pakai token (`bg-surface`, `text-muted`, `text-accent`, …), jangan `zinc-*` atau hex langsung.
- **Status shelf** (label/warna) selalu ambil dari `src/constants/status.ts`.
- **Gambar RAWG** lewat `getCroppedImageUrl(url, width)`, dan selalu isi prop `sizes`. Gambar yang posisinya above the fold pakai `loading="eager"`.
- **Session di Server Component** pakai `getSession()` (sudah di-cache per request), jadi aman dipanggil berkali-kali.
- **Dropdown** pakai `components/ui/Menu.tsx`. Kalau parent-nya `overflow-hidden`, menu bakal kepotong; taruh clipping di wrapper gambar aja.
- **Jangan pakai `text-base` buat warna.** Itu ukuran font; pakai `text-accent-fg` / `text-fg`.
