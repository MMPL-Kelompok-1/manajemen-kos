# StayEase — Situs Pencarian, Pembayaran & Dashboard Kos

Frontend dan backend dalam satu proyek Next.js 16 (App Router).

## Menjalankan

```bash
npm install
cp .env.example .env.local    # isi SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev                   # http://localhost:3000
npm run build && npm start    # mode produksi
```

Di development, jika `ADMIN_EMAIL` / `ADMIN_PASSWORD` kosong, admin memakai
`admin@stayease.local` / `admin12345`. Di production variabel ini wajib diisi,
dan `SESSION_SECRET` wajib diisi (tanpanya login akan gagal dengan error).

## Halaman

| Halaman | Untuk | Keterangan |
| --- | --- | --- |
| `/` | Umum | Landing page, daftar kos, spesifikasi, dan foto |
| `/login` | Penghuni / calon penghuni | Masuk atau daftar akun (Gmail + kata sandi) |
| `/dashboard` | Penghuni | Kos, nomor kamar, status, tanggal bayar, jatuh tempo, rekening, "Saya sudah membayar", perpanjangan |
| `/admin/login` | Admin (pemilik kos) | Masuk memakai kredensial admin |
| `/admin` | Admin | Ringkasan, daftar penghuni, nomor kamar, konfirmasi pembayaran lunas |

Alur penghuni: pilih kos di landing page → "Pilih & daftar" → daftar atau masuk →
tagihan dibuat otomatis → transfer ke rekening → "Saya sudah membayar" →
admin mengonfirmasi di `/admin` → status menjadi lunas dan kamar berkurang.

## Status pembayaran

- **Belum bayar**: tagihan dibuat, belum ditandai sudah dibayar.
- **Menunggu konfirmasi**: penghuni sudah menekan "Saya sudah membayar".
- **Lunas**: admin sudah mengonfirmasi. Tanggal bayar dicatat.
- **Terlambat**: lebih dari satu bulan sejak tanggal bayar terakhir tanpa tagihan baru.
- **Belum pilih kos**: akun sudah terdaftar tetapi belum memilih kos.

Aturan bisnis:
- Satu penghuni hanya boleh punya satu tagihan yang belum lunas.
- Perpanjangan hanya untuk kos yang sudah ditempati.
- `roomsLeft` berkurang hanya saat penghuni baru pertama kali dikonfirmasi lunas.

## API

```
POST /api/auth/register              { name, phone, email, password }   (penghuni)
POST /api/auth/login                 { role: "user" | "admin", email, password }
POST /api/auth/logout
POST /api/payments                   { kosId }                          (penghuni)
POST /api/payments/:id/paid                                             (penghuni, tagihan sendiri)
POST /api/admin/payments/:id/confirm                                    (admin)
PATCH /api/admin/registrations/:id   { roomNumber }                     (admin)
```

## Struktur

```
app/
  layout.tsx                        Layout root (tanpa header/footer)
  (public)/layout.tsx               Header & footer untuk halaman publik
  (public)/page.tsx                 Landing page
  (public)/login/page.tsx           Login & daftar penghuni
  dashboard/page.tsx                Dashboard penghuni (wajib masuk)
  admin/login/page.tsx              Login admin
  admin/page.tsx                    Dashboard admin (wajib masuk admin)
  api/...                           Route handler (lihat daftar API)
components/
  SiteHeader, Footer, Hero, WhyChooseUs, KosSection, KosExplorer
  StatusBadge.tsx                   Badge status pembayaran
  auth/AuthForms.tsx, auth/LogoutButton.tsx
  dashboard/UserDashboard.tsx       Tampilan penghuni
  admin/AdminDashboard.tsx          Tabel (desktop) & kartu (HP) penghuni
  admin/AdminLoginForm.tsx
lib/
  data.ts                           Logika data & aturan bisnis (backend)
  auth.ts                           Pemeriksaan sesi untuk halaman & API
  session.ts                        Token sesi bertanda HMAC
  password.ts                       Hash kata sandi (scrypt)
  payment.ts                        Rekening tujuan & tipe status
  format.ts                         Format Rupiah, tanggal, dan jatuh tempo
  http.ts                           Helper response error
data/
  kos.json                          Data kos (edit di sini)
  registrations.json                Dibuat otomatis (akun penghuni, jangan di-commit)
  payments.json                     Dibuat otomatis (jangan di-commit)
public/images/                      Foto kos dan hero
```

## Menambahkan foto

Letakkan file di `public/images/` sesuai daftar di `data/kos.json` (kolom `photos`).
Foto yang belum ada tampil sebagai placeholder abu-abu.

## Yang perlu diganti sebelum production

- **Data kos**: ganti isi `data/kos.json` dengan data asli.
- **Rekening**: ganti `BANK_INFO` di `lib/payment.ts`.
- **Kredensial & sesi**: isi `SESSION_SECRET`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD` di environment.
- **Pembayaran otomatis**: saat ini transfer manual lalu dikonfirmasi admin. Untuk konfirmasi otomatis,
  integrasikan payment gateway (Midtrans, Xendit, atau QRIS) di `app/api/payments/route.ts`.
- **Database**: data disimpan sebagai file JSON. Tidak cocok untuk hosting serverless (Vercel)
  karena file tidak persisten. Ganti `readCollection` / `writeCollection` di `lib/data.ts`
  dengan PostgreSQL atau SQLite.
- **Pembatasan login**: belum ada rate limiting untuk percobaan masuk. Tambahkan sebelum dipakai publik.
- **Akun lama**: akun di `registrations.json` yang dibuat sebelum fitur kata sandi tidak bisa masuk. Daftar ulang.
- **Kontak**: email dan telepon di `components/Footer.tsx`.
- **Font**: memakai Ubuntu jika terpasang, lalu fallback sistem. Untuk memuat Ubuntu otomatis,
  gunakan `next/font/google` di `app/layout.tsx`.

## Catatan

- Halaman yang membaca sesi memakai `<Suspense>` karena `cacheComponents` aktif di `next.config.ts`.
- Teks hero dan bagian keunggulan masih memakai bahasa Inggris sesuai desain.
