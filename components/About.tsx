// Hanya hal yang benar-benar dilakukan aplikasi ini, tanpa klaim yang tidak bisa dibuktikan.
const fitur = [
  {
    title: "Harga dan fasilitas tercantum jelas",
    desc: "Setiap kamar menampilkan harga per bulan, ukuran, kamar mandi, fasilitas, dan sisa kamar sebelum kamu mendaftar.",
  },
  {
    title: "Daftar dari halaman kamar",
    desc: "Pilih kamar, buat akun, dan tagihan pertamamu langsung dibuat.",
  },
  {
    title: "Bayar lewat transfer",
    desc: "Transfer ke rekening pemilik, tandai sudah membayar, lalu pemilik mengonfirmasi pembayaranmu.",
  },
  {
    title: "Status tagihan di dashboard",
    desc: "Lihat status pembayaran, tanggal jatuh tempo, dan histori pesanan kapan saja dari akunmu.",
  },
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 md:px-6 md:py-24">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <h2 className="font-headline text-section max-w-lg">
          <span className="text-ink-11">Kenapa KosanKu?</span> Jelas dari pilih kamar sampai bayar.
        </h2>
        <p className="max-w-sm text-sm text-ink-11 max-md:text-[15px] md:text-right">
          Informasi kamar, tagihan, dan konfirmasi pembayaran ada di satu tempat.
        </p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10">
        {fitur.map(({ title, desc }) => (
          <li key={title} className="surface-raised rounded-container p-6">
            <h3 className="text-title">{title}</h3>
            <p className="mt-1 max-w-md text-sm text-ink-11 max-md:text-[15px]">{desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
