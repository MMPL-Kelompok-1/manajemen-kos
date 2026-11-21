"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Notice from "@/components/ui/Notice";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { errorMessage, postJson } from "@/lib/client/http";

type Values = {
  roomNumber: string;
  name: string;
  area: string;
  price: string;
  gender: string;
  roomSize: string;
  bathroom: string;
  description: string;
  facilities: string;
};
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

const initial: Values = {
  roomNumber: "",
  name: "",
  area: "",
  price: "",
  gender: "",
  roomSize: "",
  bathroom: "",
  description: "",
  facilities: "",
};

// Batas sama dengan validasi di server (lib/services/room.ts).
const HARGA_MAKS = 100_000_000;

function parsePrice(text: string): number | null {
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function parseFacilities(text: string): string[] {
  return [...new Set(text.split(",").map((item) => item.trim()).filter(Boolean))];
}

function validateField(field: Field, values: Values): string | undefined {
  const v = values[field].trim();
  switch (field) {
    case "roomNumber":
      if (!v) return "Isi nomor kamar.";
      if (v.length > 20) return "Maksimal 20 karakter.";
      return;
    case "name":
      if (!v) return "Isi nama atau tipe kamar.";
      if (v.length > 80) return "Maksimal 80 karakter.";
      return;
    case "area":
      if (!v) return "Isi area atau lantai.";
      if (v.length > 120) return "Maksimal 120 karakter.";
      return;
    case "price": {
      const price = parsePrice(v);
      if (!v) return "Isi harga per bulan.";
      if (price === null || price <= 0) return "Harga harus angka lebih dari 0.";
      if (price > HARGA_MAKS) return "Maksimal Rp 100.000.000.";
      return;
    }
    case "roomSize":
      if (v.length > 20) return "Maksimal 20 karakter.";
      return;
    case "description":
      if (v.length > 2000) return "Maksimal 2000 karakter.";
      return;
    case "facilities": {
      const list = parseFacilities(v);
      if (list.length > 30) return "Maksimal 30 fasilitas.";
      if (list.some((item) => item.length > 40)) return "Setiap fasilitas maksimal 40 karakter.";
      return;
    }
    default:
      return;
  }
}

function validateAll(values: Values): Errors {
  const errors: Errors = {};
  for (const field of Object.keys(values) as Field[]) {
    const message = validateField(field, values);
    if (message) errors[field] = message;
  }
  return errors;
}

export default function AddRoomDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const close = () => {
    if (!saving) onClose();
  };
  useFocusTrap(panelRef, true, close);

  function set(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Setelah ada error, perbarui saat mengetik supaya pesan hilang begitu benar.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, { ...values, [field]: value }) }));
    }
  }

  function blur(field: Field) {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateAll(values);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as Field[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSaving(true);
    setApiError("");
    const t = (s: string) => s.trim() || undefined;
    try {
      await postJson("/api/admin/rooms", {
        roomNumber: values.roomNumber.trim(),
        name: values.name.trim(),
        area: values.area.trim(),
        price: parsePrice(values.price),
        gender: t(values.gender),
        roomSize: t(values.roomSize),
        bathroom: t(values.bathroom),
        description: t(values.description),
        facilities: parseFacilities(values.facilities),
      });
      onClose();
      router.refresh();
    } catch (err) {
      setApiError(errorMessage(err, "Kamar gagal disimpan. Coba lagi."));
      setSaving(false);
    }
  }

  const fieldProps = (field: Field) => ({
    id: `room-${field}`,
    name: field,
    value: values[field],
    onBlur: () => blur(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `room-${field}-error` : undefined,
    className: "field",
  });

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="animate-fade-in fixed inset-0 backdrop-blur-[2px]"
        style={{ background: "var(--backdrop)" }}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-room-title"
        aria-describedby="add-room-desc"
        className="surface-overlay animate-modal-in relative flex max-h-[92svh] w-full max-w-[620px] flex-col rounded-b-none rounded-t-[14px] sm:rounded-container"
      >
        <button
          type="button"
          onClick={close}
          disabled={saving}
          aria-label="Tutup"
          className="group absolute left-1/2 top-0 flex h-14 w-[88px] -translate-x-1/2 -translate-y-full items-end justify-center pb-3 sm:hidden"
        >
          <span className="block h-[5px] w-9 rounded-full bg-white shadow-[inset_0_-0.5px_0_rgb(0_0_0/.08),0_0_0_0.5px_rgb(0_0_0/.12),0_1px_2px_rgb(0_0_0/.28)] transition-transform duration-150 ease-[var(--ease-out)] group-active:scale-95" />
        </button>
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-5">
          <div>
            <h2 id="add-room-title" className="text-title">
              Tambah kamar
            </h2>
            <p id="add-room-desc" className="mt-1 text-sm text-ink-11">
              Kamar baru langsung tercatat sebagai siap huni.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="btn btn-ghost btn-icon btn-sm -mr-1 -mt-1 max-sm:hidden"
            aria-label="Tutup"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form ref={formRef} noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nomor kamar" field="roomNumber" error={errors.roomNumber}>
                <input
                  {...fieldProps("roomNumber")}
                  data-autofocus
                  required
                  maxLength={20}
                  placeholder="Contoh: A-101"
                  autoComplete="off"
                  onChange={(e) => set("roomNumber", e.target.value)}
                />
              </FormField>
              <FormField label="Harga per bulan (Rp)" field="price" error={errors.price}>
                <input
                  {...fieldProps("price")}
                  required
                  inputMode="numeric"
                  placeholder="1500000"
                  autoComplete="off"
                  onChange={(e) => set("price", e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Nama atau tipe kamar" field="name" error={errors.name}>
              <input
                {...fieldProps("name")}
                required
                maxLength={80}
                placeholder="Contoh: Kamar Standar"
                onChange={(e) => set("name", e.target.value)}
              />
            </FormField>

            <FormField
              label="Area atau lantai"
              field="area"
              error={errors.area}
              hint="Teks sebelum tanda hubung dipakai sebagai lantai, misalnya Lantai 1 - Sayap Timur."
            >
              <input
                {...fieldProps("area")}
                required
                maxLength={120}
                placeholder="Lantai 1 - Sayap Timur"
                onChange={(e) => set("area", e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Penghuni" field="gender" optional>
                <select {...fieldProps("gender")} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Tidak ditentukan</option>
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                  <option value="Campur">Campur</option>
                </select>
              </FormField>
              <FormField label="Ukuran" field="roomSize" error={errors.roomSize} optional>
                <input
                  {...fieldProps("roomSize")}
                  maxLength={20}
                  placeholder="3 x 4 m"
                  onChange={(e) => set("roomSize", e.target.value)}
                />
              </FormField>
              <FormField label="Kamar mandi" field="bathroom" optional>
                <select {...fieldProps("bathroom")} onChange={(e) => set("bathroom", e.target.value)}>
                  <option value="">Tidak ditentukan</option>
                  <option value="Dalam">Dalam</option>
                  <option value="Luar">Luar</option>
                </select>
              </FormField>
            </div>

            <FormField
              label="Fasilitas"
              field="facilities"
              error={errors.facilities}
              hint="Pisahkan dengan koma, misalnya AC, WiFi, Lemari."
              optional
            >
              <input
                {...fieldProps("facilities")}
                placeholder="AC, WiFi, Lemari"
                onChange={(e) => set("facilities", e.target.value)}
              />
            </FormField>

            <FormField label="Deskripsi" field="description" error={errors.description} optional>
              <textarea
                {...fieldProps("description")}
                rows={3}
                maxLength={2000}
                placeholder="Daya listrik, aturan kos, kapasitas penghuni"
                className="field resize-none"
                onChange={(e) => set("description", e.target.value)}
              />
            </FormField>

            {apiError && <Notice tone="red">{apiError}</Notice>}
          </div>

          <div className="hairline-t flex shrink-0 flex-col-reverse gap-2 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:flex-row sm:justify-between">
            <button type="button" onClick={close} disabled={saving} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Menyimpan…" : "Simpan kamar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  field,
  error,
  hint,
  optional = false,
  children,
}: {
  label: string;
  field: Field;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={`room-${field}`} className="field-label">
        {label}
        {optional && <span className="text-meta"> (opsional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`room-${field}-error`} className="field-error">
          {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}
