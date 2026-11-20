# Load test GameShelf pakai k6

Panduan belajar k6 sambil ngetes GameShelf. Kerjain dari atas ke bawah: tiap latihan nambah satu konsep baru. Script contohnya **ketik sendiri** (jangan copy-paste semua sekaligus) dan simpan di folder ini, mis. `docs/test-k6/01-smoke.js`.

> Semua perintah di bawah pakai **Command Prompt (cmd)** di Windows, jalanin dari folder root project (`D:\Development\Website\GameShelf`). Contoh script ditulis untuk k6 versi terbaru (v1.x / v2.x).

---

## 1. k6 itu apa?

k6 adalah tool buat **load test**: dia pura-pura jadi banyak user yang buka website barengan, lalu ngukur seberapa cepat dan seberapa sering server gagal. Script-nya ditulis pakai JavaScript, tapi **bukan jalan di Node.js / browser** — k6 punya engine sendiri (jadi `fetch`, `require`, npm package gak bisa dipakai).

Istilah yang bakal sering muncul:

| Istilah | Artinya |
| --- | --- |
| **VU** (Virtual User) | 1 "user palsu". 10 VU = 10 user jalanin script barengan. |
| **Iteration** | 1 kali jalanin fungsi `default` dari awal sampai akhir. Tiap VU ngulang terus selama test jalan. |
| **Check** | Pengecekan (mis. "status harus 200"). Kalau gagal, test **tetap lanjut**, cuma dicatat. |
| **Threshold** | Syarat lulus test (mis. "95% request harus < 500ms"). Kalau gak terpenuhi, k6 keluar dengan exit code error. |
| **Stages** | Jadwal naik-turun jumlah VU (mis. naik ke 20 VU dalam 30 detik, tahan 1 menit, turun ke 0). |
| **p(95)** | Persentil 95: 95% request lebih cepat dari angka ini. Lebih jujur daripada rata-rata. |

Jenis test (semuanya script yang sama, bedanya cuma di jumlah VU dan durasi):

- **Smoke** — 1–2 VU sebentar. Cuma mastiin script-nya bener.
- **Load** — beban "normal" yang kamu harapkan, beberapa menit.
- **Stress** — naikin terus sampai server mulai lambat / error. Nyari batas.
- **Spike** — lonjakan mendadak (0 → banyak VU dalam beberapa detik).
- **Soak** — beban normal tapi lama (30 menit – berjam-jam). Nyari memory leak / koneksi DB yang numpuk.

## 2. Install k6

```bat
winget install k6 --source winget
```

Alternatif: `choco install k6`, atau tanpa install pakai Docker (`docker run --rm -i grafana/k6 run - <script.js`).

Tutup lalu buka lagi terminal, terus cek:

```bat
k6 version
```

## 3. Siapin target yang mau dites

**Jangan load test pakai `next dev`** (stack `compose.yaml` biasa). Mode dev nge-compile halaman pas pertama dibuka dan gak dioptimasi, jadi angkanya gak mencerminkan production. Pakai build production:

1. Matikan stack dev (port 3000 bakal bentrok):
   ```bat
   docker compose down
   ```
2. Pastikan `.env` punya `POSTGRES_PASSWORD` (huruf & angka aja), `AUTH_SECRET`, `RAWG_API_KEY`.
3. Jalankan stack production:
   ```bat
   docker compose -f compose.prod.yaml up -d --build
   ```
4. Buka `http://localhost:3000`, pastikan jalan.
5. Daftar 1 akun manual lewat browser, tambahin beberapa game ke shelf. Catat:
   - **username** akun itu (lihat di halaman Profile) → dipakai buat `/u/<username>`
   - **1 slug game** dari URL `/games/<slug>` (mis. `the-witcher-3-wild-hunt`)

> Stack production pakai database sendiri (project `gameshelf-prod`), jadi data dev kamu gak keganggu.

## 4. Hal yang perlu kamu tau soal app ini

Ini yang bikin load test GameShelf beda dari contoh di tutorial k6:

- **Rate limit** (`src/lib/rate-limit.ts`, disimpan di tabel `RateLimit` di Postgres):
  - Login: maks **20 percobaan per IP** dan **5 per email** tiap 15 menit (`src/auth.ts`). Login sukses mereset hitungan per email.
  - Daftar akun: maks **5 akun per IP per jam** (`src/app/api/auth/register/route.ts`).
  - Semua VU k6 datang dari IP yang sama (laptop kamu) → langsung kena **429**. Triknya: app baca IP dari **entri terakhir** header `X-Forwarded-For` (fungsi `clientIp()`), jadi di test lokal tiap VU kirim header itu dengan IP palsu yang beda-beda.
  - Kenapa trik ini cuma jalan di lokal: di lokal gak ada reverse proxy, jadi Next.js nerima header dari k6 apa adanya. Di production, app harus ada di belakang reverse proxy (nginx / Caddy / Vercel) yang **nambahin IP asli di akhir** header itu atau **menimpanya**. Jadi IP palsu dari client ketimpa / kegeser ke depan dan gak kebaca lagi. Kalau port 3000 dibuka langsung ke internet tanpa proxy, orang lain masih bisa pakai trik yang sama.
- **Login & daftar itu berat CPU** karena password di-hash pakai bcrypt. Wajar kalau endpoint ini jauh lebih lambat dari halaman biasa.
- **Halaman `/games` ambil data dari RAWG API** (`src/lib/rawg.ts`), tapi hasilnya di-cache. Request pertama lambat (cache miss), selanjutnya cepat. Jangan bikin VU nyari query acak-acakan — tiap query baru = request ke RAWG = ngabisin kuota API key kamu.
- **Aksi kayak "tambah ke shelf" pakai Server Actions**, bukan REST API. Dari k6 susah dipanggil (butuh header `Next-Action` berisi ID hasil build yang berubah tiap build), jadi di panduan ini kita fokus ke **buka halaman**, **daftar**, **login**, dan **`/api/export`**.

---

## 5. Latihan 1 — Smoke test (script pertama)

Buat `docs/test-k6/01-smoke.js`:

```js
import http from 'k6/http'
import { check, sleep } from 'k6'

// options = konfigurasi test
export const options = {
    vus: 1,           // 1 user palsu
    duration: '10s',  // selama 10 detik
}

// fungsi default = yang dijalanin tiap VU berulang-ulang (1x jalan = 1 iteration)
export default function () {
    const res = http.get('http://localhost:3000/')

    check(res, {
        'status 200': (r) => r.status === 200,
    })

    sleep(1) // jeda 1 detik, kayak user beneran yang baca halaman dulu
}
```

Jalanin:

```bat
k6 run docs/test-k6/01-smoke.js
```

Cara baca output (yang penting aja):

| Baris | Artinya |
| --- | --- |
| `checks` | Persentase check yang lulus. Harusnya 100%. |
| `http_req_duration` | Waktu request (avg, min, med, max, p(90), p(95)). **Lihat p(95)**, bukan avg. |
| `http_req_failed` | Persentase request gagal (status 4xx/5xx atau koneksi error). |
| `http_reqs` | Total request + request per detik (throughput). |
| `iterations` | Berapa kali fungsi `default` selesai. |
| `vus` / `vus_max` | Jumlah VU yang aktif. |

**Coba:** hapus `sleep(1)`, jalanin lagi. Lihat `http_reqs` per detik naik drastis — tanpa sleep, 1 VU nembak secepat mungkin (gak realistis buat user, tapi berguna buat nyari batas).

## 6. Latihan 2 — Threshold (syarat lulus)

Copy `01-smoke.js` jadi `02-threshold.js`, tambahin `thresholds` di `options`:

```js
export const options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% request harus di bawah 500ms
        http_req_failed: ['rate<0.01'],   // error harus di bawah 1%
        checks: ['rate>0.99'],            // check lulus minimal 99%
    },
}
```

Jalanin. Di output, tiap threshold dikasih tanda ✓ atau ✗.

**Coba:** ganti jadi `p(95)<5` (pasti gagal), jalanin, lalu cek exit code:

```bat
k6 run docs/test-k6/02-threshold.js
echo %ERRORLEVEL%
```

(Ketik dua baris itu terpisah. Kalau digabung pakai `&` di satu baris, cmd udah ngisi `%ERRORLEVEL%` sebelum k6 jalan, jadi angkanya salah.)

Exit code bukan 0 = test gagal. Ini yang nanti dipakai kalau k6 dijalanin di CI.

## 7. Latihan 3 — Load test halaman publik (stages + group)

Buat `03-public-pages.js`. Ganti `USERNAME` dan `SLUG` dengan yang kamu catat di langkah 3.

```js
import http from 'k6/http'
import { check, group, sleep } from 'k6'

const BASE = 'http://localhost:3000'
const USERNAME = 'ganti-username'
const SLUG = 'ganti-slug-game'

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // naik pelan-pelan dari 0 ke 20 VU
        { duration: '1m', target: 20 },  // tahan 20 VU selama 1 menit
        { duration: '15s', target: 0 },  // turun ke 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        'http_req_duration{group:::Landing}': ['p(95)<500'], // threshold khusus 1 group
    },
}

export default function () {
    // group = ngelompokin request, hasilnya kepisah per group di output
    group('Landing', () => {
        check(http.get(`${BASE}/`), { 'landing 200': (r) => r.status === 200 })
    })
    group('Discover', () => {
        check(http.get(`${BASE}/games`), { 'games 200': (r) => r.status === 200 })
    })
    group('Game detail', () => {
        check(http.get(`${BASE}/games/${SLUG}`), { 'detail 200': (r) => r.status === 200 })
    })
    group('Public profile', () => {
        check(http.get(`${BASE}/u/${USERNAME}`), { 'profile 200': (r) => r.status === 200 })
    })
    sleep(1)
}
```

Hal yang diperhatiin:
- Bandingin `http_req_duration` tiap group (output-nya ada per group). Halaman mana yang paling lambat? Kenapa?
- `/games` lebih lambat di detik-detik awal? Itu cache RAWG yang belum ke-isi.

## 8. Latihan 4 — User yang login

Konsep baru:
- **`setup()`** — jalan **sekali** sebelum test mulai. Dipakai nyiapin data (di sini: daftarin akun test). Return value-nya dikirim ke fungsi `default`.
- **`__VU`** — nomor VU yang lagi jalan (mulai dari 1). Dipakai biar tiap VU pakai akun sendiri.
- **Cookie jar** — k6 otomatis nyimpen cookie per VU (kayak browser), jadi setelah login, request berikutnya ikut bawa cookie session.

Alur login Auth.js (cara browser login di app ini):
1. `GET /api/auth/csrf` → dapet `csrfToken` (dan cookie csrf).
2. `POST /api/auth/callback/credentials` dengan form `email`, `password`, `csrfToken`.
3. Kalau berhasil, server ngasih cookie **`authjs.session-token`**.

Buat `04-logged-in.js`:

```js
import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE = 'http://localhost:3000'
const VUS = 10
const PASSWORD = 'K6test1234'

export const options = { vus: VUS, duration: '1m' }

// IP palsu beda per nomor, biar gak kena rate limit per IP (lihat bab 4)
const ip = (n) => ({ 'X-Forwarded-For': `10.0.${n}.1` })

export function setup() {
    for (let n = 1; n <= VUS; n++) {
        const res = http.post(`${BASE}/api/auth/register`,
            JSON.stringify({ name: `k6 user ${n}`, email: `k6-${n}@test.local`, password: PASSWORD }),
            { headers: { 'Content-Type': 'application/json', ...ip(n) } })
        // 201 = akun baru, 400 = udah ada dari run sebelumnya (gak apa-apa)
        check(res, { 'register ok': (r) => r.status === 201 || r.status === 400 })
    }
}

let loggedIn = false // tiap VU punya variabel ini sendiri-sendiri

function login() {
    const csrfToken = http.get(`${BASE}/api/auth/csrf`, { headers: ip(__VU) }).json('csrfToken')
    http.post(`${BASE}/api/auth/callback/credentials`,
        { email: `k6-${__VU}@test.local`, password: PASSWORD, csrfToken }, // object = dikirim sebagai form
        { headers: ip(__VU), redirects: 0 })
    const cookies = http.cookieJar().cookiesForURL(BASE)
    loggedIn = check(cookies, { 'dapet session cookie': (c) => !!c['authjs.session-token'] })
}

export default function () {
    if (!loggedIn) login() // login cukup sekali per VU

    for (const path of ['/shelf', '/dashboard', '/api/export?format=json']) {
        const res = http.get(`${BASE}${path}`)
        // halaman yang butuh login nge-redirect ke /auth kalau session gak valid
        check(res, { [`${path} 200 & masih login`]: (r) => r.status === 200 && !r.url.includes('/auth') })
    }
    sleep(1)
}
```

Hal yang diperhatiin:
- Kalau check `dapet session cookie` gagal: cek password akun memenuhi aturan (min 6, ada huruf besar, kecil, angka), atau kamu kena rate limit (lihat Troubleshooting).
- Shelf akun k6 masih kosong, jadi `/shelf` & `/dashboard` di sini "ringan". Buat versi lebih realistis, isi shelf beberapa akun k6 lewat browser dulu, lalu bandingin angkanya.

**Coba:** bikin test khusus endpoint login (login di **setiap** iteration, bukan sekali). Lihat seberapa lambat dibanding halaman biasa — itu efek bcrypt. Ingat batas 5 login/email/15 menit: login *sukses* mereset hitungannya, jadi aman selama password-nya bener.

## 9. Latihan 5 — Stress & spike

Script-nya pakai ulang `03-public-pages.js`, cukup ganti `stages`.

Stress (naik bertahap sampai ketemu batas):

```js
stages: [
    { duration: '1m', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
],
```

Spike (lonjakan mendadak):

```js
stages: [
    { duration: '10s', target: 5 },
    { duration: '5s', target: 150 }, // tiba-tiba rame
    { duration: '30s', target: 150 },
    { duration: '5s', target: 5 },   // balik sepi
    { duration: '30s', target: 5 },  // server pulih gak?
],
```

Yang dicari: di jumlah VU berapa p(95) mulai naik tajam, dan di mana `http_req_failed` mulai > 0. Itu "batas" server kamu di laptop ini.

> Hasil di laptop ≠ hasil di server production (CPU, RAM, jaringan beda). Pakai angkanya buat **ngebandingin** (sebelum vs sesudah optimasi), bukan buat janji "server kuat X user".

## 10. Mantau server pas test jalan

Buka jendela cmd kedua selama k6 jalan. CPU & RAM tiap container (app vs db):

```bat
docker stats
```

Error dari app (di jendela cmd ketiga, atau gantian):

```bat
docker compose -f compose.prod.yaml logs -f app
```

Pertanyaan yang bisa dijawab dari sini: yang mentok duluan itu **app** (CPU Node.js 100%) atau **db** (Postgres)?

## 11. Simpan hasil

Dashboard live di browser + laporan HTML:

```bat
set K6_WEB_DASHBOARD=true
set K6_WEB_DASHBOARD_EXPORT=docs/test-k6/report.html
k6 run docs/test-k6/03-public-pages.js
```

Jangan kasih spasi di sekitar `=` (di cmd, spasi ikut jadi bagian nama/nilai variabel). Variabel `set` cuma berlaku di jendela cmd itu aja.

Buka `http://localhost:5665` selama test jalan. Grafik di laporan cuma muncul kalau test jalan lebih dari ~30 detik. Matikan lagi:

```bat
set K6_WEB_DASHBOARD=
set K6_WEB_DASHBOARD_EXPORT=
```

Ringkasan dalam bentuk JSON (buat dibandingin antar run):

```bat
k6 run --summary-export docs/test-k6/summary.json docs/test-k6/03-public-pages.js
```

> `report.html` dan `summary.json` itu hasil run, sebaiknya gak di-commit.

## 12. Bersih-bersih

Hapus akun k6 (shelf, list, dll. ikut kehapus karena relasinya cascade) dan reset rate limit. Masuk ke psql dulu:

```bat
docker compose -f compose.prod.yaml exec db psql -U postgres -d gameshelf
```

Lalu di prompt `gameshelf=#` ketik (tanda kutip dua di nama tabel wajib):

```sql
DELETE FROM "User" WHERE email LIKE 'k6-%';
DELETE FROM "RateLimit";
\q
```

Kalau udah selesai semua dan mau balik ke mode dev:

```bat
docker compose -f compose.prod.yaml down
docker compose up --build --watch
```

## 13. Troubleshooting

| Gejala | Kemungkinan penyebab |
| --- | --- |
| Banyak status **429** | Kena rate limit. Pastikan header `X-Forwarded-For` dikirim beda per VU, atau jalanin `DELETE FROM "RateLimit";` (bab 12). |
| Check `masih login` gagal, `r.url` berakhir di `/auth` | Session gak kebentuk. Cek check `dapet session cookie` & akun di `setup()` beneran ke-create (status 201). |
| `connection refused` / `dial tcp` | App belum jalan atau bukan di port 3000. Cek `docker compose -f compose.prod.yaml ps`. |
| `/games` error / kosong | `RAWG_API_KEY` kosong/salah atau kuota RAWG habis. |
| Angka beda jauh dari run sebelumnya | Run pertama setelah `up` masih dingin (cache kosong). Jalanin smoke test dulu sebagai "pemanasan", baru test beneran. |
| `k6` gak dikenal di terminal | Tutup & buka ulang terminal setelah install. |

---

## 14. Catatan hasil

Isi setelah tiap run, biar bisa dibandingin nanti (mis. sebelum & sesudah optimasi).

| Tanggal | Commit | Script | VU maks | Durasi | p(95) | Error % | req/s | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
