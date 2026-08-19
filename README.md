# Circle Booth

Website internal untuk circle Comifuro: tracking progress merch (WIP) tiap anggota, katalog stok + pricelist gabungan, dan kasir buat hari-H (dengan QR pembayaran statis + laporan pendapatan per anggota).

Dibangun dengan Next.js (App Router) + Supabase (Auth, Postgres, Storage).

## 1. Setup Supabase (sekali di awal)

1. Bikin project gratis di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, buat query baru, paste seluruh isi file
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql), lalu **Run**.
   File ini otomatis membuat semua tabel, aturan keamanan (RLS), fungsi checkout/void, dan
   2 storage bucket (`product-images`, `payment-qr`) — nggak perlu setup manual lagi.
3. Buka **Project Settings > API**, salin `Project URL` dan `anon public` key.
4. Copy `.env.local.example` jadi `.env.local`, lalu isi dua value tadi:

   ```bash
   cp .env.local.example .env.local
   ```

5. Tambahkan akun tiap anggota circle secara manual di **Authentication > Users > Add user**.
   Isi email + password. Kalau mau nama tampilan yang beda dari email, isi field
   **User Metadata** dengan `{"display_name": "Nama Anggota"}` — kalau tidak diisi, nama akan
   dipakai dari bagian sebelum `@` di email. Profile otomatis dibuat lewat trigger database.

## 2. Jalankan lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — akan diarahkan ke halaman login. Login
pakai salah satu akun anggota yang dibuat di langkah sebelumnya.

## 3. Struktur menu

- **Dashboard** (`/`) — pricelist gabungan semua produk dari semua anggota, bisa dicari & difilter per anggota.
- **WIP** (`/wip`) — tracking progress merch milik sendiri (privat), checklist 4 tahap: Draft → Warna → Test Print → Mass Production.
- **Stok** (`/stock`) — CRUD produk milik sendiri: nama, harga, jumlah stok, gambar.
- **Kasir** (`/kasir`) — pilih produk dari semua anggota, checkout, tampilkan QR pembayaran statis, ada riwayat transaksi + tombol batalkan (otomatis mengembalikan stok).
- **Laporan** (`/laporan`) — rekap jumlah item terjual & pendapatan per anggota, filter semua waktu / hari ini.
- **Settings** (`/settings`) — upload/ganti gambar QR pembayaran yang dipakai di menu Kasir.

## 4. Deploy

Deploy paling gampang lewat [Vercel](https://vercel.com/new) — hubungkan repo ini, isi
environment variable `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang sama
seperti di `.env.local`, lalu deploy.

## Catatan teknis

- Next.js versi ini (16) memakai konvensi **`proxy.ts`** (dulu namanya `middleware.ts`) untuk
  proteksi route — lihat `proxy.ts` dan `lib/supabase/proxy.ts`.
- Checkout dan pembatalan transaksi jalan lewat Postgres function (`checkout_transaction`,
  `void_transaction`) yang atomic, supaya aman kalau ada 2 device kasir jalan bersamaan di booth
  dan tidak terjadi oversell.
- Tidak ada halaman pendaftaran akun (self sign-up) secara sengaja — akun anggota circle dibuat
  manual lewat Supabase dashboard karena sifatnya circle tertutup.
