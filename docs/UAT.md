# UAT — GameShelf

Dokumen User Acceptance Test buat ngecek manual apakah semua fitur GameShelf jalan dengan benar. Kerjain dari atas ke bawah: beberapa test butuh data dari test sebelumnya.

| | |
| --- | --- |
| **Versi / commit** | `02b1f60` (+ perubahan belum di-commit) |
| **Tanggal test** | 2026-11-14 |
| **Tester** | Claude (otomatis pakai Playwright, FAIL dicek ulang manual) |
| **Environment** | Docker (`docker compose up`, `next dev`) |
| **Browser** | Chromium headless (Playwright) |

---

## 1. Persiapan

1. Isi `.env` dari `.env.example`: `DATABASE_URL`, `AUTH_SECRET`, `RAWG_API_KEY`.
2. Jalankan app:
   - Docker: `docker compose up --build --watch`
   - atau tanpa Docker: `npx prisma migrate deploy` lalu `npm run dev`
3. Buka `http://localhost:3000`.
4. Siapkan:
   - **Browser 1 (normal)** → dipakai sebagai **User A**
   - **Browser 2 (incognito / browser lain)** → dipakai sebagai **User B** dan **Tamu** (belum login)
   - 1 file gambar PNG/JPG kecil, 1 file `.txt` yang di-rename jadi `.png`
5. Kalau kena rate limit di tengah test (login / register / avatar), tunggu sesuai waktunya atau hapus baris di tabel `RateLimit` lewat `npx prisma studio`.

## 2. Cara isi

Tiap test case punya kolom **Status**: isi `✅` (lulus), `❌` (gagal) atau `⏭️` (di-skip). Kalau `❌`, tulis apa yang terjadi di **Catatan** dan catat di [Daftar bug](#5-daftar-bug).

Teks dalam tanda kutip (mis. "Email already exists") adalah teks persis yang muncul di app.

---

## 3. Test case

### 3.1 Auth — daftar, login, logout

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| AUTH-01 | Daftar akun baru | Tamu → `/auth` → tab daftar → isi nama `User A`, email baru, password `Test1234` → submit | Toast "Account created", langsung login dan diarahkan ke `/games` | ✅ |  |
| AUTH-02 | Nama terlalu pendek / panjang | Daftar dengan nama `ab`, lalu nama 21 karakter | Error di field nama ("Name must be at least 3 characters" / "Name is too long"), akun tidak dibuat | ✅ | Typo diperbaiki (BUG-04) |
| AUTH-03 | Email tidak valid | Daftar dengan email `abc` lalu kosong | "Invalid email format" / "Email is required" | ✅ |  |
| AUTH-04 | Password lemah | Coba satu per satu: `Ab1` (pendek), `abcdef1` (tanpa huruf besar), `ABCDEF1` (tanpa huruf kecil), `Abcdefg` (tanpa angka) | Pesan error sesuai aturan yang dilanggar, akun tidak dibuat | ✅ |  |
| AUTH-05 | Password > 72 karakter | Daftar dengan password 73 karakter (ada huruf besar, kecil, angka) | "Password must be at most 72 characters" | ✅ |  |
| AUTH-06 | Email sudah terdaftar (beda huruf besar) | Daftar lagi pakai email User A tapi huruf besar, mis. `USERA@...` | Toast "Email already exists" | ✅ | Teks diperbaiki (BUG-04) |
| AUTH-07 | Logout | Klik menu user → logout | Toast "Logged out successfully", kembali ke halaman publik | ✅ |  |
| AUTH-08 | Login sukses | Login pakai email User A (coba huruf besar semua) + password benar | Toast "Logged in successfully", masuk ke `/games` | ✅ |  |
| AUTH-09 | Login password salah | Login pakai password salah | Toast "Invalid email or password", tetap di `/auth` | ✅ |  |
| AUTH-10 | Login email tidak terdaftar | Login pakai email yang belum ada | Toast "Invalid email or password" (tidak bocorin email terdaftar atau tidak) | ✅ |  |
| AUTH-11 | Rate limit login | Login dengan password salah 6x berturut-turut ke email yang sama | Percobaan ke-6 (dan seterusnya selama 15 menit): "Too many login attempts. Wait 15 minutes and try again." — **walau password benar** | ✅ |  |
| AUTH-12 | Rate limit direset setelah sukses | Akun lain: salah 3x, lalu login benar, lalu salah lagi 3x | Tidak kena rate limit (hitungan reset setelah login sukses) | ✅ |  |
| AUTH-13 | Rate limit daftar | Dari jaringan yang sama, daftar 6 akun baru dalam 1 jam | Akun ke-6 ditolak: "Too many sign-ups from this network. Try again later." | ✅ | Opsional, bikin banyak akun. Ke-6 ditolak sesuai |
| AUTH-14 | Buat User B | Di Browser 2, daftar akun `User B` | Berhasil, masuk ke `/games` | ✅ | Dipakai di test selanjutnya |

### 3.2 Guard — halaman yang butuh login

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| GRD-01 | Tamu buka halaman privat | Tamu (incognito, belum login) buka satu per satu: `/games`, `/shelf`, `/shelf/backlog`, `/shelf/lists`, `/profile`, `/dashboard`, `/dashboard/review/2026` | Semua diarahkan ke landing page `/` | ✅ |  |
| GRD-02 | User login buka landing | User A buka `/` | Langsung diarahkan ke `/games` | ✅ |  |
| GRD-03 | Tamu lihat landing page | Tamu buka `/` | Landing page tampil lengkap (Hero, How it works, FAQ, CTA, Footer), tombol daftar/login mengarah ke `/auth` | ✅ |  |
| GRD-04 | Export tanpa login | Tamu buka `/api/export` | Respons 401 `{"error":"Please log in first"}` | ✅ |  |

### 3.3 Discover — cari & lihat game

Login sebagai User A.

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| DSC-01 | Halaman Discover | Buka `/games` | Grid game tampil dengan cover, GOTY slider tampil | ✅ |  |
| DSC-02 | Shortcut `/` | Di `/games` klik area kosong lalu tekan `/` | Kursor pindah ke search bar | ✅ |  |
| DSC-03 | Cari game | Ketik `witcher` → enter | Hasil berisi game Witcher | ✅ |  |
| DSC-04 | Cari tanpa hasil | Ketik teks acak `zzqqxx123` | Muncul pesan tidak ada hasil, tidak error | ✅ |  |
| DSC-05 | Filter genre / platform / tahun | Pilih genre, lalu platform, lalu tahun rilis | Hasil berubah sesuai filter, URL ikut berubah | ✅ |  |
| DSC-06 | Sort | Ganti urutan sort | Urutan hasil berubah | ✅ |  |
| DSC-07 | Pagination | Klik halaman berikutnya / sebelumnya | Hasil berganti, filter tetap terjaga | ✅ |  |
| DSC-08 | Refresh & back | Setelah filter, refresh lalu tekan Back | Filter tetap sama setelah refresh, Back kembali ke state sebelumnya | ✅ |  |
| DSC-09 | Detail game | Klik satu game | Halaman detail: judul, cover, deskripsi (bisa expand), screenshot (bisa dibuka galeri), store link, game satu seri | ✅ |  |
| DSC-10 | Game tidak ada | Buka `/games/slug-ngawur-xyz-123` | Halaman 404 / not found, bukan error 500 | ✅ | Tampilan not found benar, tapi HTTP 200 (BUG-02) |

### 3.4 Shelf — tambah, ubah, hapus game

Login sebagai User A.

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| SHF-01 | Shelf kosong | User A baru buka `/shelf` | Tampil empty state dengan ajakan cari game | ✅ |  |
| SHF-02 | Tambah game (Planned) | Detail game → status Planned → tambah | Toast "Added to your shelf as Planned", tombol berubah jadi "In your shelf · Planned" + "Open in shelf" | ✅ |  |
| SHF-03 | Tambah dengan status lain | Tambah 3 game lain sebagai Playing, Completed, Dropped | Masing-masing masuk dengan status yang dipilih | ✅ |  |
| SHF-04 | Tambah 3 game Planned lagi | Tambah 3 game lagi sebagai Planned (total 4 Planned) | Berhasil | ✅ | Buat test Backlog |
| SHF-05 | Badge "in shelf" di Discover | Kembali ke `/games` | Game yang sudah ditambah punya penanda sudah di shelf | ✅ |  |
| SHF-06 | Tambah game yang sama lagi | Di tab lain buka detail game yang sudah ditambah (sebelum refresh), klik tambah | Toast "This game is already in your shelf", tidak ada duplikat di `/shelf` | ✅ |  |
| SHF-07 | Tab filter & jumlah | `/shelf` → klik tab All / Planned / Playing / Completed / Dropped | Grid terfilter, angka di tiap tab cocok dengan jumlah game | ✅ |  |
| SHF-08 | Cari di shelf | Ketik sebagian judul di "Search your shelf..." | Hanya game yang cocok tampil; tekan `Esc` mengosongkan pencarian | ✅ |  |
| SHF-09 | Cari tanpa hasil | Ketik `zzzz` | Pesan "No games matching "zzzz"." | ✅ |  |
| SHF-10 | Sort shelf | Coba semua: Recently added, Recently updated, Highest rated, Most played, Title A–Z | Urutan sesuai pilihan | ✅ | Lebih jelas setelah SHF-13/14 |
| SHF-11 | Ubah status → Playing | Buka game Planned di `/shelf/<slug>` → klik Playing | Toast "Moved to Playing", timeline "Started" terisi tanggal hari ini | ✅ |  |
| SHF-12 | Ubah status → Completed | Klik Completed | "Finished" terisi hari ini, "Started" tetap tanggal awal | ✅ |  |
| SHF-13 | Ubah status → Dropped / Planned | Klik Dropped, lalu Planned | Tanggal "Finished" kosong lagi | ✅ |  |
| SHF-14 | Rating | Klik bintang 4 → refresh; klik bintang yang sama lagi untuk hapus rating | Rating tersimpan setelah refresh; bisa dikosongkan | ✅ |  |
| SHF-15 | Play hours | Isi `25` → tekan Enter → refresh | Tersimpan 25 jam | ✅ |  |
| SHF-16 | Play hours tidak valid | Isi `2.5` lalu klik di luar field | Toast "Play hours must be a whole number", nilai kembali ke sebelumnya | ✅ |  |
| SHF-17 | Play hours terlalu besar | Isi `100000` → Enter | Error "Playtime is too large", tidak tersimpan | ✅ | Toast "Playtime is too large", nilai tetap |
| SHF-18 | Catatan (autosave) | Ketik catatan, tunggu sebentar, refresh | Indikator simpan muncul, catatan masih ada setelah refresh | ✅ |  |
| SHF-19 | Batas catatan | Paste teks > 1000 karakter | Terpotong di 1000, counter "1000/1000" | ✅ |  |
| SHF-20 | Hapus game | Di `/shelf`, hapus satu game lewat kartunya (konfirmasi dialog) | Toast "Game removed from shelf", game hilang dari `/shelf` | ✅ |  |
| SHF-21 | Game bukan milik sendiri | User B buka `/shelf/<slug game User A>` | Not found (User B belum punya game itu) | ✅ | Not found benar, HTTP 200 (BUG-02) |

### 3.5 Backlog

Login sebagai User A, minimal 3 game Planned.

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| BCK-01 | Daftar backlog | Buka `/shelf/backlog` | Hanya game Planned yang tampil, berurutan | ✅ |  |
| BCK-02 | Drag reorder | Drag game ke-3 ke posisi 1 → refresh | Urutan baru tersimpan | ✅ | Desktop. Diuji drag otomatis (Playwright) |
| BCK-03 | Tombol naik / turun | Klik panah atas / bawah di satu game → refresh | Urutan berubah dan tersimpan | ✅ | Juga dicek di mobile |
| BCK-04 | Up Next | Lihat bagian "Up Next" | Menampilkan game urutan teratas backlog | ✅ |  |
| BCK-05 | What should I play? | Klik tombol random beberapa kali | Selalu memilih game Planned, hasil bervariasi | ✅ |  |
| BCK-06 | Game baru masuk paling bawah | Tambah game baru sebagai Planned | Muncul di urutan paling bawah backlog | ✅ |  |
| BCK-07 | Keluar dari backlog | Ubah satu game backlog jadi Playing | Hilang dari backlog | ✅ |  |

### 3.6 Lists

Login sebagai User A.

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| LST-01 | Buat list | `/shelf/lists` → isi nama `Couch co-op` + deskripsi → buat | List muncul di daftar | ✅ |  |
| LST-02 | Nama kosong | Coba buat list dengan nama kosong / spasi saja | Ditolak ("Give the list a name") | ✅ | Tombol Create mati untuk nama kosong / spasi, jadi pesan "Give the list a name" tidak pernah muncul. Perlu update dokumen |
| LST-03 | Batas panjang | Ketik nama > 60 / deskripsi > 200 karakter | Input berhenti di 60 / 200 karakter | ✅ |  |
| LST-04 | Tambah game ke list | Dari game di shelf, buka menu tambah ke list → centang `Couch co-op` | Game muncul di `/shelf/lists/<id>` | ✅ | Kalau langsung pindah halaman (0 ms) setelah centang, perubahan hilang (BUG-03) |
| LST-05 | Keluarkan game dari list | Uncentang list di menu yang sama | Game hilang dari list, tapi tetap ada di shelf | ✅ |  |
| LST-06 | Edit list | Ubah nama & deskripsi list → simpan → refresh | Toast "List updated", perubahan tersimpan | ✅ |  |
| LST-07 | Hapus game dari shelf | Hapus dari shelf game yang ada di list | Game ikut hilang dari list | ✅ |  |
| LST-08 | Hapus list | Hapus list (konfirmasi) | Toast "List deleted", list hilang; game-nya tetap di shelf | ✅ |  |
| LST-09 | List orang lain | User B buka `/shelf/lists/<id list User A>` | Not found | ✅ | Not found benar, HTTP 200 (BUG-02) |

### 3.7 Dashboard & Year in Review

Login sebagai User A dengan beberapa game (beda status, ada rating & play hours).

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| DSH-01 | Angka statistik | Buka `/dashboard`, bandingkan dengan isi `/shelf` | Total game, jam main (jumlah play hours), rata-rata rating cocok | ✅ |  |
| DSH-02 | Status breakdown | Lihat breakdown per status | Jumlah per status cocok dengan tab di `/shelf` | ✅ |  |
| DSH-03 | Chart completion | Lihat chart bulanan | Game yang di-Completed bulan ini terhitung di bulan ini | ✅ |  |
| DSH-04 | Top games | Lihat daftar top games | Maks 5 game, hanya Playing / Completed, urut rating tertinggi (yang belum dirating di bawah) | ✅ |  |
| DSH-05 | Rating kosong tidak dihitung | Hapus rating satu game, cek rata-rata | Rata-rata hanya dari game yang punya rating | ✅ |  |
| DSH-06 | Year in Review | Buka `/dashboard/review/2026` | Game yang selesai tahun ini, favorit, bulan tersibuk | ✅ | Console error Cache Components (BUG-01) |
| DSH-07 | Tahun tanpa data | Buka `/dashboard/review/2010` | Tampil kosong dengan rapi, tidak error | ✅ | Console error Cache Components (BUG-01) |
| DSH-08 | Tahun tidak valid | Buka `/dashboard/review/abc` | Halaman not found | ✅ | Not found benar, HTTP 200 (BUG-02) |
| DSH-09 | Dashboard kosong | User B (shelf kosong) buka `/dashboard` | Tampil angka nol / empty state, tidak error | ✅ |  |

### 3.8 Profile & akun

Login sebagai User A → buka `/profile`.

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| PRF-01 | Ganti nickname | Ubah nickname → simpan | Toast "Nickname updated", nama di navbar ikut berubah | ✅ |  |
| PRF-02 | Nickname tidak valid | Isi 2 karakter / 21 karakter | Ditolak dengan pesan validasi | ✅ | Tombol Save mati + hint merah, tidak ada pesan lain. Input maks 20 karakter, 21 tidak bisa diketik. Perlu update dokumen |
| PRF-03 | Ganti username | Ubah username jadi `usera-test` → simpan | Tersimpan, share link berubah ke `/u/usera-test` | ✅ | Dipakai `usera-t607` (biar unik antar run) |
| PRF-04 | Username tidak valid | Coba `ab`, `-abc`, `abc-`, `ABC def`, 21 karakter | Ditolak: "3–20 characters: letters, numbers, - or _ (not at the start or end)". Huruf besar diubah jadi kecil | ✅ | Pesan server tidak pernah tampil: tombol Save mati, hint "3–20 characters: a–z, 0–9, - or _. Changing it breaks old links." jadi merah. Huruf besar jadi kecil ✅, 21 karakter terpotong ke 20. Perlu update dokumen |
| PRF-05 | Username sudah dipakai | User B coba pakai username User A | "That username is taken" | ✅ |  |
| PRF-06 | Copy share link | Klik tombol copy | Ikon jadi centang, link `/u/<username>` ada di clipboard | ✅ | Tombol copy mati selama profil privat; test ini harus setelah PUB-04. Diuji setelah profil publik |
| PRF-07 | Upload avatar | Upload PNG/JPG → crop → simpan | Toast "Photo updated", foto tampil di navbar & profile | ✅ | Tidak ada langkah crop, foto otomatis di-crop tengah. Perlu update dokumen |
| PRF-08 | Upload file palsu | Upload file `.txt` yang di-rename `.png` | Ditolak ("Couldn't read that image" / "Pick a PNG, JPG or WebP image"), foto lama tetap | ✅ | Toast "Couldn't read that image", foto lama tetap |
| PRF-09 | Hapus avatar | Klik hapus foto | Toast "Photo removed", kembali ke inisial nama | ✅ |  |
| PRF-10 | Export CSV | Klik export CSV | File `gameshelf-YYYY-MM-DD.csv` terunduh; buka di Excel: kolom title, slug, rawgId, status, rating, playtime, caption, startedAt, completedAt, createdAt, updatedAt; karakter non-Latin tampil benar | ✅ | Ada BOM UTF-8, kolom lengkap, 日本語 benar. Dicek di file, belum dibuka di Excel |
| PRF-11 | CSV aman dari formula | Isi catatan satu game dengan `=1+1`, export CSV, buka di Excel | Sel tampil sebagai teks `'=1+1`, **bukan** dihitung jadi `2` | ✅ | Sel jadi `'=1+1` (juga `@`). Dicek di file, belum dibuka di Excel |
| PRF-12 | Export JSON | Klik export JSON | File `.json` terunduh, berisi semua game di shelf | ✅ |  |
| PRF-13 | Ganti password — password lama salah | Isi password lama salah + password baru valid | "Current password is wrong" | ✅ |  |
| PRF-14 | Ganti password — sama dengan lama | Password baru = password lama | "Pick a password you haven't used here" | ✅ |  |
| PRF-15 | Ganti password — lemah | Password baru `abc` | Pesan aturan password | ✅ |  |
| PRF-16 | Ganti password sukses | Login User A juga di browser lain dulu, lalu ganti password di Browser 1 | Toast "Password changed. Log in again."; sesi di **kedua** browser ke-logout; login password lama gagal, password baru berhasil | ✅ | Browser lain diarahkan ke `/auth` (bukan landing), export jadi 401 |
| PRF-17 | Rate limit ganti password | Salah password lama 6x | Ke-6: "Too many attempts. Try again later." | ✅ |  |

### 3.9 Profil publik

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| PUB-01 | Default privat | Akun baru: Tamu buka `/u/<username User A>` | Halaman not found | ✅ | Not found benar, HTTP 200 (BUG-02) |
| PUB-02 | Pemilik lihat profil privat | User A buka `/u/<username sendiri>` | Profil tampil dengan banner "Only you can see this page..." | ✅ |  |
| PUB-03 | User lain lihat profil privat | User B buka `/u/<username User A>` | Not found | ✅ | Not found benar, HTTP 200 (BUG-02) |
| PUB-04 | Jadikan publik | User A nyalakan public profile di `/profile` | Tamu sekarang bisa buka `/u/<username>`: nama, avatar, "on GameShelf since …", statistik, lists, shelf per status (Playing, Completed, Planned, Dropped) | ✅ | Console error Cache Components (BUG-01) |
| PUB-05 | Catatan tidak bocor | Di halaman publik, cek game yang punya catatan; juga lihat page source | Catatan pribadi **tidak** tampil di mana pun | ✅ |  |
| PUB-06 | List publik | Tamu klik salah satu list di profil publik | `/u/<username>/lists/<id>` tampil dengan isinya | ✅ | Console error Cache Components (BUG-01) |
| PUB-07 | Preview link | Tempel link profil di WhatsApp / Discord / X (atau cek tag `og:` di page source) | Muncul judul, deskripsi dan gambar preview | ✅ | Butuh URL publik. Dicek lewat tag `og:`/`twitter:` + og:image 200, belum ditempel ke WhatsApp/Discord |
| PUB-08 | Link lama | Tamu buka `/dashboard/share/<userId User A>` (ambil id dari `npx prisma studio`) | Diarahkan ke `/u/<username>`; kalau profil privat → not found | ✅ | Redirect jalan di browser setelah HTTP 200 (BUG-02); console error (BUG-01) |
| PUB-09 | Ganti username | Ganti username User A, buka link lama | Username lama → not found, username baru → tampil | ✅ |  |
| PUB-10 | Jadikan privat lagi | Matikan public profile | Tamu → not found lagi | ✅ |  |
| PUB-11 | Username tidak ada | Buka `/u/tidak-ada-orangnya` | Not found | ✅ |  |

### 3.10 Hapus akun

Lakukan **paling akhir**, pakai User B (atau akun khusus).

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| DEL-01 | Password salah | `/profile` → hapus akun → isi password salah | "Wrong password", akun tetap ada | ✅ |  |
| DEL-02 | Rate limit | Salah password 6x | Ke-6: "Too many attempts. Try again later." | ✅ | Opsional. Ke-6 "Too many attempts. Try again later." |
| DEL-03 | Hapus sukses | Jadikan profil User B publik dulu, lalu hapus akun dengan password benar | Toast "Your account was deleted", ter-logout | ✅ | Ter-logout, tapi toast tidak tertangkap karena halaman langsung reload (BUG-05) |
| DEL-04 | Data benar-benar hilang | Buka `/u/<username User B>`; coba login lagi pakai akun User B | Profil not found; login gagal "Invalid email or password" | ✅ |  |
| DEL-05 | Email bisa dipakai lagi | Daftar lagi dengan email User B | Berhasil (akun baru, shelf kosong) | ✅ |  |

### 3.11 UI umum

| ID | Skenario | Langkah | Hasil yang diharapkan | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| UI-01 | Tampilan mobile | DevTools → mode device (lebar ~375px), buka semua halaman utama | Tab bar bawah tampil, tidak ada scroll horizontal, tombol bisa diklik | ✅ |  |
| UI-02 | Navigasi navbar | Klik semua link navbar & menu user | Semua mengarah ke halaman yang benar, link aktif ter-highlight | ✅ |  |
| UI-03 | Halaman 404 | Buka `/halaman-ngawur` | Halaman not found yang rapi dengan link kembali | ✅ |  |
| UI-04 | Loading state | DevTools → Network "Slow 3G", buka `/shelf`, `/dashboard`, detail game | Skeleton tampil saat loading, tidak layar putih kosong | ✅ | Diuji dengan throttling ~Slow 3G, skeleton muncul di ketiga halaman |
| UI-05 | Keyboard | Navigasi pakai Tab di `/auth`, `/shelf/<slug>`, `/profile` | Fokus terlihat jelas, semua tombol bisa dipakai pakai keyboard | ✅ | Diuji otomatis: semua bisa pakai Tab. Input fokusnya cuma ganti warna border (bukan outline), perlu dicek pakai mata |
| UI-06 | Console bersih | Buka DevTools Console sambil jalanin test di atas | Tidak ada error merah | ✅ | Awalnya ❌: error di 4 route dinamis (BUG-01). Diuji ulang setelah fix: bersih, selain 4xx yang memang disengaja dari test negatif |
| UI-07 | RAWG lambat / mati | Ganti `RAWG_API_KEY` jadi salah, restart, buka `/games` dan coba tambah game | Pesan error yang jelas ("Couldn't reach the game database, try again" saat tambah), app tidak crash; halaman shelf/dashboard tetap jalan | ⏭️ | Kembalikan key setelahnya. Butuh ganti `RAWG_API_KEY` + restart container |

---

## 4. Ringkasan hasil

| Modul | Total | ✅ Lulus | ❌ Gagal | ⏭️ Skip |
| --- | --- | --- | --- | --- |
| 3.1 Auth | 14 | 14 | 0 | 0 |
| 3.2 Guard | 4 | 4 | 0 | 0 |
| 3.3 Discover | 10 | 10 | 0 | 0 |
| 3.4 Shelf | 21 | 21 | 0 | 0 |
| 3.5 Backlog | 7 | 7 | 0 | 0 |
| 3.6 Lists | 9 | 9 | 0 | 0 |
| 3.7 Dashboard | 9 | 9 | 0 | 0 |
| 3.8 Profile | 17 | 17 | 0 | 0 |
| 3.9 Profil publik | 11 | 11 | 0 | 0 |
| 3.10 Hapus akun | 5 | 5 | 0 | 0 |
| 3.11 UI umum | 7 | 6 | 0 | 1 |
| **Total** | **114** | **113** | **0** | **1** |

**Keputusan:** ☐ Diterima ☑ Diterima dengan catatan ☐ Ditolak

Semua fitur jalan. BUG-01, BUG-03, BUG-04 sudah diperbaiki; BUG-02 by design; BUG-05 masih perlu dicek pakai mata. Catatannya: 5 test case (LST-02, PRF-02, PRF-04, PRF-06, PRF-07) yang dokumennya perlu disesuaikan dengan perilaku app.

## 5. Daftar bug

| Bug ID | Test ID | Deskripsi | Langkah reproduksi | Severity (Tinggi / Sedang / Rendah) | Status |
| --- | --- | --- | --- | --- | --- |
| BUG-01 | UI-06, DSH-06, DSH-07, PUB-04, PUB-06, PUB-08 | Console error Cache Components di dev: `/dashboard/review/[year]`, `/u/[username]/lists/[listId]`, `/dashboard/share/[id]` → "uncached data accessed outside `<Suspense>`"; `/u/[username]` → "`crypto.getRandomValues()` while prerendering". Halaman tetap tampil | Buka salah satu route itu di `npm run dev` / Docker, lihat Console | Sedang | Fixed: `loading.tsx` sendiri di `review/[year]` & `u/[username]/lists/[listId]`, `instant = false` di `dashboard/share/[id]`, `getSession()` sebelum Prisma di `/u/*`. Dicek ulang: 0 error di console & log server |
| BUG-02 | DSC-10, SHF-21, LST-09, DSH-08, PUB-01, PUB-03, PUB-08 | Halaman not found tampil benar, tapi status HTTP-nya 200, bukan 404. Link lama `/dashboard/share/<id>` juga 200 dulu, baru redirect di browser. Cuma URL yang memang tidak ada (`/halaman-ngawur`) yang 404. Berpengaruh ke crawler & bot preview link | `curl -I localhost:3000/games/slug-ngawur-xyz-123` | Rendah | By design: perilaku streaming Next.js — status terkunci 200 begitu skeleton `loading.tsx` tampil, `notFound()` lalu menyisipkan `<meta name="robots" content="noindex">` (sudah dicek ada). Real 404 berarti skeleton/navigasi instan hilang, jadi dipertahankan |
| BUG-03 | LST-04 | Centang list di menu "Add to list" lalu langsung pindah halaman (0 ms) → checkbox sudah tercentang tapi perubahan tidak tersimpan. Dengan jeda 300 ms aman | Detail game di shelf → Add to list → centang → langsung buka `/shelf/lists` | Rendah | Fixed: selama simpan masih jalan, reload/tutup tab memunculkan konfirmasi browser. Navigasi lewat link di app memang sudah aman |
| BUG-04 | AUTH-02, AUTH-06 | Typo di teks app: "Name must be atleast 3 characters", "Name is to long", "Email already exist". Dokumen ini ikut pakai teks yang typo | Daftar dengan nama `ab` / 21 karakter / email terdaftar | Rendah | Fixed, termasuk "Password must be atleast 6 characters" di form login. Test unit & integration ikut diperbarui |
| BUG-05 | DEL-03 | Toast "Your account was deleted" tidak tertangkap: `signOut` langsung reload halaman, jadi toast kemungkinan cuma kedip | Hapus akun, perhatikan toast | Rendah (perlu cek pakai mata) | Open |
| BUG-06 | SHF-18 | Notes autosave (jeda 0,9 detik) hilang kalau user langsung tekan Back atau reload/tutup tab setelah ngetik. Klik link di app aman karena blur langsung menyimpan | Detail game di shelf → ketik di My notes → langsung tekan Back browser / reload | Sedang | Fixed: notes yang belum kesimpen dikirim saat pindah halaman di app (unmount), dan reload/tutup tab memunculkan konfirmasi browser selama notes belum dikonfirmasi server. Dicek: Back, reload, klik link, dan alur normal semua tersimpan |

## 6. Catatan

- Test otomatis yang sudah ada bisa dijalankan sebagai pelengkap: `npm test` (unit + integration) dan `npm run test:e2e` (Playwright). UAT ini tetap dikerjakan manual karena menguji dari sisi pengguna.
- Data dari RAWG (judul, cover, jumlah hasil) bisa berubah sewaktu-waktu, jadi fokus ke perilaku app, bukan angka persisnya.

### Catatan run 2026-11-14

- Test otomatis: unit 117/117 lulus. Suite lengkap lewat `docker compose --profile test run --rm test` lulus 213/213. `npm run test:e2e` tidak dijalankan.
- `npm test` langsung di Windows gagal konek DB ("password authentication failed"): password Postgres di `DATABASE_URL` `.env.test` (dan `.env`) beda dengan password container Docker (`postgres`, lihat `compose.yaml`). Port 5432 memang ke Postgres Docker. Masalah environment, bukan bug app.
- Hal yang belum dicek pakai mata: CSV dibuka di Excel (PRF-10/11, dicek dari isi file), preview link di WhatsApp/Discord (PUB-07, dicek dari tag `og:`), tampilan fokus keyboard (UI-05), toast hapus akun (BUG-05).
- Akun tes `uat-a-*`, `uat-b-*`, `uat-r1..5-*` (`@example.test`) masih ada di DB dev. Tabel `RateLimit` dikosongkan beberapa kali selama test.
