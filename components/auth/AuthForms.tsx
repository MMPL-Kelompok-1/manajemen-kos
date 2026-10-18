"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tab = "masuk" | "daftar";

// Form masuk & daftar untuk penghuni / calon penghuni.
export default function AuthForms({ initialTab, kosId }: { initialTab: Tab; kosId: string | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = tab === "daftar";
  const inputClass =
    "mt-1.5 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-zinc-950 sm:text-sm";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const body = isRegister
      ? { name: form.name, phone: form.phone, email: form.email, password: form.password }
      : { role: "user", email: form.email, password: form.password };

    try {
      const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal. Coba lagi.");

      const target = kosId ? `/dashboard?kos=${encodeURIComponent(kosId)}` : "/dashboard";
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-12 sm:py-20">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid grid-cols-2 rounded-full bg-zinc-100 p-1 text-sm font-semibold">
          {(["masuk", "daftar"] as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                setError("");
              }}
              className={`rounded-full py-2.5 capitalize transition ${
                tab === value ? "bg-white shadow-sm" : "text-zinc-500"
              }`}
            >
              {value === "masuk" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {kosId && (
          <p className="mt-5 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
            Setelah {isRegister ? "mendaftar" : "masuk"}, kos pilihan Anda akan diproses untuk pembayaran.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <>
              <label className="block text-sm font-semibold">
                Nama lengkap
                <input
                  required
                  minLength={3}
                  autoComplete="name"
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
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="081234567890"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </label>
            </>
          )}

          <label className="block text-sm font-semibold">
            Gmail
            <input
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              pattern={isRegister ? "[a-zA-Z0-9._%+\\-]+@gmail\\.com" : undefined}
              title="Gunakan alamat Gmail (contoh: nama@gmail.com)"
              placeholder="nama@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-semibold">
            Kata sandi
            <input
              required
              type="password"
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={isRegister ? "Minimal 8 karakter" : ""}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-950 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Memproses..." : isRegister ? "Daftar akun" : "Masuk"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Pemilik kos?{" "}
        <Link href="/admin/login" className="font-semibold text-zinc-950 underline">
          Masuk sebagai admin
        </Link>
      </p>
    </div>
  );
}
