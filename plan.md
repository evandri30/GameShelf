# GameShelf — Roadmap Fitur

Ide fitur berikutnya untuk GameShelf, diurutkan dari yang paling simple sampai advanced.

## Yang sudah ada

- **Discover**: search, filter (genre, platform, tahun, urutan), dan slider GOTY.
- **Shelf**: status (Planned / Playing / Completed / Dropped), rating, caption, playtime, dan timeline otomatis (`startedAt`, `completedAt`).
- **Backlog**: urutannya bisa di-drag.
- **Custom lists**.
- **Profil publik** `/u/[username]`, termasuk OG image.
- **Dashboard**: statistik, chart completion, year review, dan share card.

Data model saat ini: `User`, `Shelf`, `ShelfList`, `ShelfListItem` (lihat `prisma/schema.prisma`).

---

## 🟢 Simple (≤ 1 hari, tanpa ubah schema)

### 1. Search + sort di halaman Shelf
- **Kenapa:** kalau shelf sudah puluhan game, susah cari satu judul.
- **Cara:** input search dan dropdown sort (judul, rating, terakhir di-update) di `ShelfFilter`. Filter dilakukan client-side di `ShelfGrind`, karena datanya sudah ter-load semua dari `getUserShelf`.
- **File:** `src/components/shelf/ShelfFilter.tsx`, `src/components/shelf/ShelfGrind.tsx`

### 2. "Main apa ya?": random pick dari backlog
- **Kenapa:** membantu user yang bingung mau main apa dari backlog yang panjang. Fitur kecil, tapi seru.
- **Cara:** tombol di `/shelf/backlog` yang memilih acak satu game `PLANNED`, ditampilkan dengan animasi singkat dan tombol "Mulai main" yang mengubah status ke `PLAYING` lewat `updateShelf`.
- **File:** `src/app/shelf/backlog/page.tsx`, komponen baru `src/components/shelf/RandomPick.tsx`

### 3. Export shelf (CSV / JSON)
- **Kenapa:** user merasa datanya aman dan bisa dibawa ke mana saja.
- **Cara:** route handler `GET /api/export?format=csv|json` yang memakai `getUserShelf` lalu mengembalikan file download.
- **File:** `src/app/api/export/route.ts`, tombol di dashboard

### 4. Keyboard shortcut + polish kecil
- **Cara:** `/` untuk fokus ke search di Discover, `Esc` untuk clear. Cek juga lagi empty state di semua halaman.
- **File:** `src/components/games/SearchBar.tsx`

---

## 🟡 Medium (1–3 hari, ada migration kecil)

### 5. Tags pribadi
- **Kenapa:** status saja kurang ekspresif. Tag seperti "co-op", "comfort game", atau "main bareng adik" bikin shelf lebih personal.
- **Cara:** model `Tag { id, userId, name }` dengan relasi many-to-many ke `Shelf`. Tag dipilih di `ShelfDetail`, lalu bisa difilter di halaman shelf dan profil publik.
- **File:** `prisma/schema.prisma`, `src/app/shelf/actions.ts`, `src/components/shelf/ShelfDetail.tsx`

### 6. Jurnal sesi main
- **Kenapa:** sekarang playtime cuma satu angka manual. Dengan jurnal, user mencatat tiap sesi, playtime terhitung otomatis, dan year review jadi jauh lebih kaya.
- **Cara:** model `PlaySession { id, shelfId, date, minutes, note }`. Form "Log sesi" di detail shelf. `playtime` dihitung dari total sesi, dan dashboard dapat chart "jam main per bulan".
- **File:** `prisma/schema.prisma`, `src/app/shelf/actions.ts`, `src/components/shelf/ShelfDetail.tsx`, `src/components/dashboard/*`

### 7. Target tahunan
- **Kenapa:** memberi motivasi, misalnya "Selesaikan 24 game di 2026".
- **Cara:** field `yearlyGoal Int?` di `User`. Progress bar di dashboard dan year review memakai jumlah `COMPLETED` dengan `completedAt` di tahun berjalan (index `[userId, completedAt]` sudah ada).
- **File:** `prisma/schema.prisma`, `src/app/dashboard/actions.ts`, `src/components/dashboard/DashboardStats.tsx`

### 8. Achievement / badge
- **Kenapa:** gamification untuk app tentang game.
- **Cara:** dihitung dari data yang sudah ada, tanpa tabel baru. Contoh: "First Clear" (1 completed), "Completionist" (10 completed), "Marathon" (100+ jam), "Critic" (25 game diberi rating), "Backlog Slayer" (5 game dari backlog selesai dalam sebulan). Ditampilkan di dashboard dan profil publik.
- **File:** helper baru `src/services/achievement.service.ts`, `src/app/u/[username]/page.tsx`

---

## 🔴 Advanced (≥ 1 minggu)

### 9. Follow + feed aktivitas
- **Kenapa:** mengubah GameShelf dari tool pribadi jadi sosial, sehingga orang punya alasan untuk balik lagi.
- **Cara:**
  - Model `Follow { followerId, followingId }` dan `Activity { userId, type, shelfId, createdAt }`. Activity ditulis dari `addToShelf` / `updateShelf` (ganti status, kasih rating).
  - Tombol Follow di profil publik dan halaman feed di dashboard.
  - Hanya user dengan `isPublic = true` yang muncul.
- **File:** `prisma/schema.prisma`, `src/app/shelf/actions.ts`, halaman baru `src/app/feed/page.tsx`

### 10. Rekomendasi personal
- **Kenapa:** Discover sekarang generik. Rekomendasi bikin user nemu game yang cocok.
- **Cara:**
  - Ambil game dengan rating ≥ 4. Genre-nya diambil dari `getGameBySlug` (sudah di-cache), karena tabel `Shelf` belum menyimpan genre. Alternatifnya, simpan `genres` di `Shelf` saat `addToShelf`.
  - Hitung genre favorit, lalu panggil `listGames({ genre, ordering: '-rating' })`.
  - Buang game yang sudah ada di shelf memakai `getUserShelfIndex`, lalu tampilkan rail "Karena kamu suka …".
- **File:** `src/lib/rawg.ts`, `src/services/shelf.service.ts`, `src/app/games/page.tsx` atau `src/app/dashboard/page.tsx`

### 11. Import dari Steam
- **Kenapa:** onboarding instan, karena shelf langsung terisi tanpa input satu per satu.
- **Cara:**
  - Input SteamID. Steam Web API `GetOwnedGames` butuh API key dan profil Steam yang publik.
  - Tiap judul dicocokkan ke RAWG lewat search. Layar review menampilkan hasil yang cocok sebelum disimpan.
  - Bulk insert ke `Shelf` dengan `playtime` dari Steam.
  - Perlu rate-limit ke RAWG dan proses bertahap (batch).
- **File:** `src/lib/steam.ts`, halaman baru `src/app/shelf/import/page.tsx`, `src/app/shelf/actions.ts`

### 12. Compare dengan teman
- **Cara:** halaman `/u/[a]/vs/[b]` yang menampilkan game yang sama-sama dimiliki, beda rating terbesar, dan "game yang dia suka tapi belum kamu punya". Hanya untuk profil publik.
- **File:** halaman baru `src/app/u/[username]/vs/[other]/page.tsx`

### 13. PWA + shelf offline
- **Cara:** `app/manifest.ts`, service worker yang meng-cache halaman shelf dan gambar cover, serta ikon install. Shelf bisa dibuka di HP tanpa koneksi.
- **File:** `src/app/manifest.ts`, `public/sw.js`

---

## Urutan yang disarankan

| # | Fitur | Effort | Dampak |
|---|-------|--------|--------|
| 1 | Search + sort shelf | Rendah | Tinggi |
| 2 | Random pick backlog | Rendah | Sedang |
| 7 | Target tahunan | Rendah | Sedang |
| 6 | Jurnal sesi main | Sedang | Tinggi |
| 10 | Rekomendasi personal | Sedang–Tinggi | Tinggi |
| 9 | Follow + feed | Tinggi | Tinggi (kalau user sudah banyak) |

Nomor 1, 2, dan 7 cepat dan langsung terasa. Nomor 6 dan 10 jadi alasan user balik lagi. Fitur sosial (9, 12) baru masuk akal setelah user-nya cukup banyak.

## Checklist tiap fitur
- [ ] `npx tsc --noEmit` dan `npm run lint` lolos
- [ ] `npx prisma migrate dev` kalau schema berubah
- [ ] Dicoba manual di `npm run dev`, termasuk halaman profil publik kalau terdampak
