"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "owner", email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal masuk");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck size={16} />
          </span>
          Kosanku Admin
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-xl font-bold">Masuk pemilik kos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pantau penghuni dan konfirmasi pembayaran.</p>
          </div>

          <label className="block text-sm font-semibold">
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-base outline-none focus:border-primary bg-muted sm:text-sm"
            />
          </label>
          <label className="block text-sm font-semibold">
            Kata sandi
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-base outline-none focus:border-primary bg-muted sm:text-sm"
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
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Penghuni?{" "}
          <Link href="/" className="font-semibold text-foreground underline">
            Masuk di sini
          </Link>
        </p>

      </div>
    </main>
  );
}
