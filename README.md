# KosanKu

Aplikasi pencarian, pendaftaran, dan pembayaran kos. Frontend dan backend dalam satu proyek Next.js 16 (App Router), data di PostgreSQL lewat Prisma 7.

## Menjalankan

```bash
npm install
cp .env.example .env          # isi DATABASE_URL, SESSION_SECRET, OWNER_PASSWORD, BANK_*
npx prisma migrate deploy     # terapkan skema
npm run db:seed               # buat akun pemilik dan kamar contoh
npm run dev                   # http://localhost:3000
```

Mode produksi: `npm run build && npm start`. Di produksi `SESSION_SECRET` dan ketiga variabel `BANK_*` wajib diisi; tanpa itu login dan halaman pembayaran akan gagal dengan pesan yang jelas.

## Peran dan halaman

| Halaman | Untuk | Isi |
| --- | --- | --- |
| `/` | Umum | Daftar kos, harga, fasilitas |
| `/kos/[id]` | Umum | Detail kamar dan tombol daftar |
| `/login` | Semua | Masuk atau daftar; pemilik diarahkan ke dashboard admin |
| `/dashboard` | Penghuni | Kamar, status tagihan, jatuh tempo |
| `/dashboard/pembayaran` | Penghuni | Rekening tujuan, "Saya sudah membayar", perpanjangan |
| `/dashboard/histori` | Penghuni | Riwayat pesanan dan tagihan |
| `/admin/dashboard` | Pemilik | Pesanan masuk, daftar penghuni, konfirmasi pembayaran |
| `/admin/penghuni` | Pemilik | Daftar penghuni, filter status, konfirmasi cepat |
| `/admin/penghuni/[id]` | Pemilik | Detail penghuni, ubah nomor kamar, riwayat pesanan dan tagihan |
| `/admin/transaksi` | Pemilik | Semua tagihan, filter status/bulan, konfirmasi transfer |
| `/admin/laporan` | Pemilik | Pendapatan per bulan dan per kamar, piutang, unduh CSV (`?tahun=YYYY`) |
| `/admin/manajemenkos` | Pemilik | Kamar, okupansi, tambah kamar |

Alur: pilih kamar, daftar atau masuk, tagihan dibuat otomatis (berlaku 24 jam), transfer, tekan "Saya sudah membayar", pemilik mengonfirmasi, status menjadi lunas dan kamar terisi.

## API

```
POST  /api/auth/register                 { name, phone, email, password }   batas 10/jam per IP
POST  /api/auth/login                    { email, password }                 batas 5 gagal/15 menit
POST  /api/auth/logout
GET   /api/auth/me
POST  /api/payments                      { kosId }                           penghuni
POST  /api/payments/:id/paid                                                 penghuni, tagihan sendiri
POST  /api/admin/payments/:id/confirm                                        pemilik
PATCH /api/admin/registrations/:id       { roomNumber }                      pemilik
POST  /api/admin/rooms                   { roomNumber, name, area, price, ... } pemilik
GET   /api/admin/laporan/export?tahun=YYYY                                    pemilik, CSV
```

## Struktur

```
app/                    route (halaman dan app/api)
components/
  ui/                   komponen dasar: EmptyState, StatCard, Section, CopyButton, Segmented, status
  layout/AppShell.tsx   shell admin dan penghuni
  admin/, dashboard/, auth/   tampilan per area
lib/
  services/             logika bisnis per domain: auth, payment, room, dashboard, tenant, transaction, report
  status.ts             satu sumber turunan status tagihan dan penghuni
  validation.ts, errors.ts, mappers.ts, types.ts
  data.ts               re-export untuk kompatibilitas
  auth.ts, session.ts   sesi cookie bertanda HMAC
  rate-limit.ts         pembatas percobaan (per proses)
  payment.ts            rekening tujuan dari env
  client/http.ts        helper fetch untuk komponen client
prisma/
  schema.prisma, migrations/, seed.ts, seed-data/kos.json
```

Desain memakai token di `app/globals.css` (skala `ink-1..12`, permukaan, bayangan, resep `.btn`, `.field`, `.badge`, `.table-tactile`). Gunakan resep itu, jangan warna atau ukuran lepas.

## Catatan

- Pembatas login disimpan di memori proses. Untuk lebih dari satu instance, ganti dengan penyimpanan bersama (misalnya Redis).
- Foto kamar dari seed (`/images/kamar-*.jpg`) belum ada di `public/images/`; kamar tanpa foto menampilkan placeholder.
- Kontak di `components/Footer.tsx` masih contoh; ganti dengan kontak asli.
