"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type Tab = "masuk" | "daftar";

interface AuthFormsProps {
  initialTab?: Tab;
  kosId?: string | null;
  isModal?: boolean;
  onClose?: () => void;
}

// Form masuk & daftar untuk penghuni / calon penghuni.
export default function AuthForms({
  initialTab = "masuk",
  kosId = null,
  isModal = false,
  onClose,
}: AuthFormsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTab(initialTab);
    setError("");
  }, [initialTab]);

  const isRegister = tab === "daftar";
  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-border bg-muted px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card sm:text-sm";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const body = isRegister
      ? { name: form.name, phone: form.phone, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal. Coba lagi.");

      if (isModal && onClose) {
        onClose();
      }

      const target =
        data.role === "owner"
          ? "/admin/dashboard"
          : kosId
            ? `/dashboard?kos=${encodeURIComponent(kosId)}`
            : "/dashboard";
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className={isModal ? "w-full" : "mx-auto w-full max-w-md px-5 py-12 sm:py-20"}>
      <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}

        <div className={`grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold ${isModal ? "mt-5" : ""}`}>
          {(["masuk", "daftar"] as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                setError("");
              }}
              className={`rounded-full py-2.5 capitalize transition ${tab === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {value === "masuk" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {kosId && (
          <p className="mt-5 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            Setelah {isRegister ? "mendaftar" : "masuk"}, kos pilihan Anda akan diproses untuk pembayaran.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <>
              <label className="block text-sm font-semibold text-foreground">
                Nama lengkap
                <input
                  required
                  minLength={3}
                  autoComplete="name"
                  placeholder="Nama lengkap Anda"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-semibold text-foreground">
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

          <label className="block text-sm font-semibold text-foreground">
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

          <label className="block text-sm font-semibold text-foreground">
            Kata sandi
            <input
              required
              type="password"
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={isRegister ? "Minimal 8 karakter" : "••••••••"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-3 p-3 text-sm text-red-11">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {loading ? "Memproses..." : isRegister ? "Daftar akun" : "Masuk"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Admin dan penghuni menggunakan halaman masuk yang sama.
        </p>
      </div>

    </div>
  );
}

