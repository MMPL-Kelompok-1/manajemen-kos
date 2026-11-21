"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Segmented from "@/components/ui/Segmented";
import { errorMessage, postJson } from "@/lib/client/http";

type Tab = "masuk" | "daftar";

interface AuthFormsProps {
  /** Tab awal. Untuk mengganti tab dari luar, ubah `key` komponen ini. */
  initialTab?: Tab;
  kosId?: string | null;
  isModal?: boolean;
  onClose?: () => void;
}

export default function AuthForms({ initialTab = "masuk", kosId = null, isModal = false, onClose }: AuthFormsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = tab === "daftar";
  const Heading = isModal ? "h2" : "h1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const body = isRegister
      ? { name: form.name, phone: form.phone, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const data = await postJson<{ role?: string }>(isRegister ? "/api/auth/register" : "/api/auth/login", body);
      onClose?.();
      const target =
        data.role === "owner"
          ? "/admin/dashboard"
          : kosId
            ? `/dashboard?kos=${encodeURIComponent(kosId)}`
            : "/dashboard";
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className={isModal ? "w-full" : "mx-auto w-full max-w-[464px] px-5 py-12 sm:py-20"}>
      <div
        className={`relative p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:p-8 ${
          isModal
            ? "surface-overlay animate-modal-in rounded-b-none rounded-t-[14px] md:rounded-container"
            : "surface-raised rounded-container"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <Heading id={isModal ? "auth-modal-title" : undefined} className="text-title">
            {isRegister ? "Buat akun KosanKu" : "Masuk ke KosanKu"}
          </Heading>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="btn btn-ghost btn-icon btn-sm -mr-2 -mt-1 max-md:hidden"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <Segmented<Tab>
          label="Pilih masuk atau daftar"
          value={tab}
          onChange={(value) => {
            setTab(value);
            setError("");
          }}
          className="flex w-full"
          options={[
            { value: "masuk", label: "Masuk" },
            { value: "daftar", label: "Daftar" },
          ]}
        />

        {kosId && (
          <p className="mt-4 rounded-control bg-ink-3 p-3 text-sm text-ink-11">
            Setelah {isRegister ? "mendaftar" : "masuk"}, kos pilihan Anda akan diproses untuk pembayaran.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isRegister && (
            <>
              <label className="block">
                <span className="field-label">Nama lengkap</span>
                <input
                  data-autofocus
                  required
                  minLength={3}
                  autoComplete="name"
                  placeholder="Nama lengkap Anda"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field"
                />
              </label>
              <label className="block">
                <span className="field-label">Nomor HP</span>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="081234567890"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="field"
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="field-label">Email</span>
            <input
              data-autofocus={isRegister ? undefined : true}
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              pattern={isRegister ? "[a-zA-Z0-9._%+\\-]+@gmail\\.com" : undefined}
              title="Gunakan alamat Gmail (contoh: nama@gmail.com)"
              placeholder="nama@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="field"
            />
            {isRegister && <span className="field-hint">Saat ini hanya alamat Gmail yang diterima.</span>}
          </label>

          <label className="block">
            <span className="field-label">Kata sandi</span>
            <input
              required
              type="password"
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={isRegister ? "Minimal 8 karakter" : "••••••••"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="field"
            />
          </label>

          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full max-md:h-11">
            {loading ? "Memproses…" : isRegister ? "Daftar akun" : "Masuk"}
          </button>
        </form>
        <p className="text-meta mt-4 text-center">Admin dan penghuni menggunakan halaman masuk yang sama.</p>
      </div>
    </div>
  );
}
