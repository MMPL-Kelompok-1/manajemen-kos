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
    <main className="flex min-h-[100svh] items-center justify-center bg-zinc-50 px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <ShieldCheck size={16} />
          </span>
          Kosanku Admin
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-xl font-bold">Masuk pemilik kos</h1>
            <p className="mt-1 text-sm text-zinc-500">Pantau penghuni dan konfirmasi pembayaran.</p>
          </div>

          <label className="block text-sm font-semibold">
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-zinc-950 sm:text-sm"
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
              className="mt-1.5 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-zinc-950 sm:text-sm"
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
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Penghuni?{" "}
          <Link href="/login" className="font-semibold text-zinc-950 underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
