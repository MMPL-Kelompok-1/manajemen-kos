# StayEase — Situs Pencarian & Pembayaran Kos

Frontend dan backend dalam satu proyek Next.js 16 (App Router), dengan satu halaman yang bisa di-scroll.

## Menjalankan

```bash
npm install
npm run dev                   # http://localhost:3000
npm run build && npm start    # mode produksi
```

## Alur halaman

1. **Hero**: pembuka dengan tombol "Lihat kos" dan "Daftar sekarang".
2. **Keunggulan**: bagian "Why Choose Us".
3. **Kos yang tersedia**: daftar kos dengan harga, ukuran kamar, dan sisa kamar. Tombol "Lihat spesifikasi" membuka detail dengan galeri foto, spesifikasi, dan fasilitas.
4. **Daftar & bayar**: pengguna mengisi nama, nomor HP, dan Gmail, lalu melihat instruksi transfer dengan nominal sama dengan harga kos. Setelah transfer, pengguna menekan "Saya sudah membayar".

## Struktur

```
app/
  page.tsx                          Satu halaman (semua section)
  api/registrations/route.ts        POST pendaftaran
  api/payments/route.ts             POST pembayaran (nominal = harga kos)
  api/payments/[id]/paid/route.ts   POST konfirmasi "sudah membayar"
components/
  Hero.tsx, WhyChooseUs.tsx         Section statis
  KosSection.tsx                    Mengambil data kos di server
  KosExplorer.tsx                   Daftar kos, spesifikasi, form daftar & pembayaran
lib/
  data.ts                           Logika data & validasi (backend)
  payment.ts                        Rekening tujuan transfer
  format.ts                         Format Rupiah
  http.ts                           Helper response error
data/
  kos.json                          Data kos (edit di sini)
  registrations.json                Dibuat otomatis (jangan di-commit)
  payments.json                     Dibuat otomatis (jangan di-commit)
public/images/                      Foto kos dan hero
```

## Menambahkan foto

Letakkan file di `public/images/` sesuai daftar di `data/kos.json` (kolom `photos`):
- `hero.jpg` untuk background hero
- `kos-melati-1.jpg` sampai `kos-melati-4.jpg`
- `kos-anggrek-1.jpg` sampai `kos-anggrek-3.jpg`
- `kos-mawar-1.jpg` sampai `kos-mawar-4.jpg`

Foto yang belum ada akan tampil sebagai placeholder abu-abu. Anda bisa menambah atau mengurangi foto dengan mengubah array `photos`.

## Yang perlu diganti sebelum production

- **Data kos**: ganti isi `data/kos.json` dengan data asli (nama, alamat, harga, sisa kamar, fasilitas, foto).
- **Rekening**: ganti `BANK_INFO` di `lib/payment.ts` dengan rekening asli.
- **Pembayaran otomatis**: saat ini pembayaran dilakukan transfer manual dan pengguna menekan "Saya sudah membayar". Untuk konfirmasi otomatis, integrasikan payment gateway (Midtrans, Xendit, atau QRIS) di `app/api/payments/route.ts`.
- **Konfirmasi admin**: belum ada halaman admin untuk mengubah status pembayaran dari `menunggu_konfirmasi` menjadi `lunas`. Status ini perlu dicek manual di `data/payments.json` sampai halaman admin dibuat.
- **Sisa kamar**: `roomsLeft` belum berkurang otomatis saat pembayaran lunas. Perbarui manual di `data/kos.json` atau tambahkan logika di `markPaymentPaid`.
- **Kontak**: email dan telepon di `components/Footer.tsx`.
- **Database**: data disimpan sebagai file JSON. Cocok untuk development, tetapi tidak cocok untuk hosting serverless (Vercel) karena file tidak persisten. Ganti `readCollection` / `writeCollection` di `lib/data.ts` dengan database seperti PostgreSQL atau SQLite.
- **Font**: memakai Ubuntu jika terpasang, lalu fallback sistem. Untuk memuat Ubuntu otomatis, gunakan `next/font/google` di `app/layout.tsx`.

## Catatan

- Halaman ini memakai `<Suspense>` karena `cacheComponents` aktif di `next.config.ts`.
- Teks hero dan bagian keunggulan masih memakai bahasa Inggris sesuai desain.
