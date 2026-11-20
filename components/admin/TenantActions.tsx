"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { errorMessage, postJson, requestJson } from "@/lib/client/http";

// Konfirmasi pembayaran manual. Dipakai di dashboard, daftar penghuni, detail,
// dan daftar transaksi.
export function ConfirmPaymentButton({
  paymentId,
  label,
  fullWidth = false,
}: {
  paymentId: string;
  label: string;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setLoading(true);
    setError("");
    try {
      await postJson(`/api/admin/payments/${paymentId}/confirm`);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Gagal mengonfirmasi pembayaran."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={confirm}
        disabled={loading}
        className={`btn btn-secondary ${fullWidth ? "w-full" : "btn-sm"}`}
      >
        {loading ? "Memproses…" : label}
      </button>
      {error && (
        <p role="alert" className="field-error max-w-[220px]">
          {error}
        </p>
      )}
    </div>
  );
}

// Mengubah nomor kamar pada pesanan terakhir penghuni.
export function RoomEditor({
  registrationId,
  initial,
  compact = false,
}: {
  registrationId: string;
  initial: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = value.trim() !== (initial ?? "");
  const errorId = `kamar-error-${registrationId}`;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setError("");
    try {
      await requestJson(`/api/admin/registrations/${registrationId}`, "PATCH", {
        roomNumber: value.trim(),
      });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Gagal menyimpan nomor kamar."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="w-full min-w-[120px]">
      {!compact && (
        <label htmlFor={`kamar-${registrationId}`} className="field-label">
          Nomor kamar
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          id={`kamar-${registrationId}`}
          value={value}
          maxLength={20}
          placeholder="Belum ada"
          onChange={(e) => setValue(e.target.value)}
          aria-label={compact ? "Nomor kamar" : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`field min-w-0 ${compact ? "h-8 w-24" : ""}`}
        />
        {dirty && (
          <button
            type="submit"
            disabled={saving}
            className={`btn btn-secondary shrink-0 ${compact ? "btn-sm" : ""}`}
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      )}
    </form>
  );
}
