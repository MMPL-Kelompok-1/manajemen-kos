"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Bath, Check, MapPin, Ruler, Users, X } from "lucide-react";
import ListingImage from "./ListingImage";
import { formatRupiah } from "@/lib/format";
import type { Kos } from "@/lib/data";
import type { PaymentResult } from "@/lib/payment";

export default function KosExplorer({ kos }: { kos: Kos[] }) {
  const [detail, setDetail] = useState<Kos | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const selected = kos.find((k) => k.id === selectedId) ?? null;

  function chooseKos(item: Kos) {
    setSelectedId(item.id);
    setDetail(null);
    setResult(null);
    setConfirmed(false);
    setError("");
    document.getElementById("daftar")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setError("Pilih kos terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const regRes = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error ?? "Pendaftaran gagal");

      const payRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regData.id, kosId: selected.id }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error ?? "Pembayaran gagal dibuat");

      setResult(payData as PaymentResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaid() {
    if (!result) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/payments/${result.payment.id}/paid`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memperbarui status");
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-950";

  return (
    <>
      {/* DAFTAR KOS */}
      <section id="kos" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
        <p className="text-sm font-bold uppercase tracking-wider">Pilihan kos</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight">Kos yang tersedia</h2>
        <p className="mt-2 text-zinc-500">Lihat spesifikasi dan foto sebelum memilih.</p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {kos.map((item) => {
            const full = item.roomsLeft <= 0;
            return (
              <article
                key={item.id}
                className={`overflow-hidden rounded-3xl border ${
                  selectedId === item.id ? "border-zinc-950" : "border-zinc-200"
                }`}
              >
                <div className="relative aspect-[4/3]">
                  <ListingImage src={item.photos[0] ?? ""} alt={item.name} />
                  {full && (
                    <span className="absolute left-4 top-4 rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white">
                      Penuh
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold">
                      {item.gender}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                    <MapPin size={14} /> {item.area}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-600">
                    <span className="flex items-center gap-1"><Ruler size={15} /> {item.roomSize}</span>
                    <span className="flex items-center gap-1"><Bath size={15} /> KM {item.bathroom}</span>
                    <span className="flex items-center gap-1">
                      <Users size={15} /> {full ? "Penuh" : `Sisa ${item.roomsLeft} kamar`}
                    </span>
                  </div>

                  <p className="mt-5 text-2xl font-bold">
                    {formatRupiah(item.price)}
                    <span className="text-sm font-normal text-zinc-500"> / bulan</span>
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDetail(item)}
                      className="rounded-full border border-zinc-200 py-2.5 text-sm font-medium hover:bg-zinc-50"
                    >
                      Lihat spesifikasi
                    </button>
                    <button
                      type="button"
                      disabled={full}
                      onClick={() => chooseKos(item)}
                      className="rounded-full bg-zinc-950 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
                    >
                      Pilih & daftar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* PENDAFTARAN & PEMBAYARAN */}
      <section id="daftar" className="scroll-mt-20 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider">Pendaftaran</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight">Daftar & bayar</h2>

          {selected && (
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
              <div>
                <p className="text-sm text-zinc-500">Kos dipilih</p>
                <p className="font-bold">{selected.name}</p>
              </div>
              <p className="text-right font-bold">
                {formatRupiah(selected.price)}
                <span className="block text-xs font-normal text-zinc-500">per bulan</span>
              </p>
            </div>
          )}

          <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
            {!result && (
              <form onSubmit={handleRegister} className="space-y-4">
                {!selected && (
                  <p className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
                    Pilih kos di bagian atas terlebih dahulu.
                  </p>
                )}
                <label className="block text-sm font-semibold">
                  Nama lengkap
                  <input
                    required
                    minLength={3}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Nomor HP
                  <input
                    required
                    type="tel"
                    placeholder="081234567890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Gmail
                  <input
                    required
                    type="email"
                    pattern="[a-zA-Z0-9._%+\-]+@gmail\.com"
                    title="Gunakan alamat Gmail (contoh: nama@gmail.com)"
                    placeholder="nama@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading || !selected}
                  className="w-full rounded-full bg-zinc-950 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loading
                    ? "Memproses..."
                    : selected
                    ? `Daftar & bayar ${formatRupiah(selected.price)}`
                    : "Daftar & bayar"}
                </button>
              </form>
            )}

            {result && !confirmed && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-zinc-500">Kode pembayaran</p>
                  <p className="font-mono text-lg font-bold">{result.payment.id}</p>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-5">
                  <p className="text-sm text-zinc-500">Total pembayaran ({result.payment.kosName})</p>
                  <p className="text-3xl font-bold">{formatRupiah(result.payment.amount)}</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-5 text-sm">
                  <p className="font-semibold">Transfer ke rekening berikut:</p>
                  <p className="mt-3">Bank: {result.bank.bank}</p>
                  <p>No. rekening: <span className="font-mono font-bold">{result.bank.accountNumber}</span></p>
                  <p>Atas nama: {result.bank.accountName}</p>
                  <p className="mt-3 text-zinc-500">
                    Transfer tepat sebesar {formatRupiah(result.payment.amount)} agar pembayaran mudah dikonfirmasi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePaid}
                  disabled={loading}
                  className="w-full rounded-full bg-zinc-950 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Saya sudah membayar"}
                </button>
              </div>
            )}

            {confirmed && (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={28} />
                </div>
                <p className="text-xl font-bold">Terima kasih, {form.name}!</p>
                <p className="text-zinc-600">
                  Pembayaran {result?.payment.id} sedang dikonfirmasi. Kami akan menghubungi Anda di{" "}
                  {form.email}.
                </p>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          {(result || selected) && !confirmed && (
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setResult(null);
                setError("");
              }}
              className="mt-4 text-sm text-zinc-500 underline hover:text-zinc-950"
            >
              Batalkan dan pilih kos lain
            </button>
          )}
        </div>
      </section>

      {detail && (
        <KosDetail
          kos={detail}
          onClose={() => setDetail(null)}
          onChoose={() => chooseKos(detail)}
        />
      )}
    </>
  );
}

function KosDetail({
  kos,
  onClose,
  onChoose,
}: {
  kos: Kos;
  onClose: () => void;
  onChoose: () => void;
}) {
  const [active, setActive] = useState(0);
  const photos = kos.photos.length > 0 ? kos.photos : [""];
  const full = kos.roomsLeft <= 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const specs = [
    ["Jenis kos", kos.gender],
    ["Ukuran kamar", kos.roomSize],
    ["Kamar mandi", `KM ${kos.bathroom}`],
    ["Area", kos.area],
    ["Ketersediaan", full ? "Penuh" : `Sisa ${kos.roomsLeft} kamar`],
    ["Alamat", kos.address],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Spesifikasi ${kos.name}`}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white"
      >
        <div className="flex items-start justify-between border-b border-zinc-200 p-6">
          <div>
            <h3 className="text-2xl font-bold">{kos.name}</h3>
            <p className="text-sm text-zinc-500">{kos.area}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full p-2 hover:bg-zinc-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl">
            <ListingImage src={photos[active]} alt={`${kos.name} - foto ${active + 1}`} />
          </div>

          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Lihat foto ${index + 1}`}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border-2 ${
                    index === active ? "border-zinc-950" : "border-transparent"
                  }`}
                >
                  <ListingImage src={photo} alt={`Foto ${index + 1}`} />
                </button>
              ))}
            </div>
          )}

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <h4 className="mt-8 font-bold">Fasilitas</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {kos.facilities.map((item) => (
              <li key={item} className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm">
                {item}
              </li>
            ))}
          </ul>

          <h4 className="mt-8 font-bold">Deskripsi</h4>
          <p className="mt-3 leading-relaxed text-zinc-600">{kos.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 p-6">
          <p className="text-xl font-bold">
            {formatRupiah(kos.price)}
            <span className="text-sm font-normal text-zinc-500"> / bulan</span>
          </p>
          <button
            type="button"
            disabled={full}
            onClick={onChoose}
            className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            Pilih & daftar
          </button>
        </div>
      </div>
    </div>
  );
}
