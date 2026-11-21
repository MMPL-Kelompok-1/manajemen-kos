"use client";

import { useMemo, useState } from "react";
import { BedDouble, Plus, Search } from "lucide-react";
import ListingImage from "@/components/ListingImage";
import { StatusDot } from "@/components/StatusBadge";
import AddRoomDialog from "@/components/admin/AddRoomDialog";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";
import Segmented from "@/components/ui/Segmented";
import StatCard from "@/components/ui/StatCard";
import type { RoomManagementData } from "@/lib/data";
import { formatRupiah, formatRupiahCompact } from "@/lib/format";

type StatusFilter = "ALL" | "TERISI" | "SIAP HUNI";
const SEMUA_LANTAI = "";

export default function ManajemenKosView({ initialData }: { initialData: RoomManagementData }) {
  const { stats, roomTypes, units } = initialData;
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [floor, setFloor] = useState(SEMUA_LANTAI);

  // Pilihan lantai diambil dari data, bukan daftar tetap.
  const floors = useMemo(
    () => [...new Set(units.map((u) => u.floor).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id")),
    [units],
  );

  const counts = useMemo(
    () => ({
      terisi: units.filter((u) => u.status === "TERISI").length,
      kosong: units.filter((u) => u.status === "SIAP HUNI").length,
    }),
    [units],
  );

  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return units.filter((unit) => {
      if (statusFilter !== "ALL" && unit.status !== statusFilter) return false;
      if (floor !== SEMUA_LANTAI && unit.floor !== floor) return false;
      if (!q) return true;
      return [unit.number, unit.type, unit.tenantName ?? ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [units, searchQuery, statusFilter, floor]);

  const adaFilter = searchQuery.trim() !== "" || statusFilter !== "ALL" || floor !== SEMUA_LANTAI;

  function resetFilter() {
    setSearchQuery("");
    setStatusFilter("ALL");
    setFloor(SEMUA_LANTAI);
  }

  // "Lihat unit" pada kartu tipe: saring tabel ke tipe itu lalu gulir ke sana.
  function showUnitsOf(typeName: string) {
    setSearchQuery(typeName);
    setStatusFilter("ALL");
    setFloor(SEMUA_LANTAI);
    const target = document.getElementById("unit");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    document.getElementById("cari-unit")?.focus({ preventScroll: true });
  }

  const addButton = (
    <button onClick={() => setAddOpen(true)} className="btn btn-primary" type="button">
      <Plus className="size-4" aria-hidden="true" />
      Tambah kamar
    </button>
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-section">Manajemen kos & kamar</h1>
          <p className="mt-1.5 text-sm text-ink-11">Tipe kamar, tarif, fasilitas, dan ketersediaan unit.</p>
        </div>
        {units.length > 0 && addButton}
      </div>

      {units.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="Belum ada kamar"
          description="Tambahkan kamar pertama. Kamar baru langsung tampil di daftar kos."
          action={addButton}
        />
      ) : (
        <>
          <section
            aria-label="Ringkasan"
            className="stat-list grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
          >
            <StatCard value={stats.totalRooms} label="Total kamar" />
            <StatCard
              value={
                <>
                  {stats.occupiedRooms}
                  <span className="ml-1.5 text-sm text-ink-11">{stats.occupancyRate}%</span>
                </>
              }
              label="Kamar terisi"
              tone="blue"
            >
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink-4" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-blue-9"
                  style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
                />
              </div>
            </StatCard>
            <StatCard value={stats.availableRooms} label="Kamar kosong" tone="green" />
            <StatCard
              value={formatRupiahCompact(stats.potentialRevenue)}
              title={formatRupiah(stats.potentialRevenue)}
              label="Potensi pendapatan / bulan"
            />
          </section>

          <Section
            id="tipe"
            title="Tipe kamar"
            description="Fasilitas, jumlah unit, dan tarif per tipe."
            actions={<span className="text-meta">{roomTypes.length} tipe terdaftar</span>}
          >
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roomTypes.map((room) => (
                <li key={room.id} className="surface-raised flex flex-col overflow-hidden">
                  <div className="relative h-40 w-full overflow-hidden bg-ink-3">
                    <ListingImage src={room.image} alt={room.name} />
                    <span
                      className={`badge absolute left-3 top-3 ${room.available > 0 ? "badge-green" : "badge-neutral"}`}
                    >
                      {room.available > 0 ? `${room.available} tersedia` : "Penuh"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-title">{room.name}</h3>
                        <p className="text-meta">
                          {[room.floor, room.size].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <p className="flex items-baseline gap-1">
                        <span className="text-sm text-ink-12 tabular-nums">{formatRupiah(room.price)}</span>
                        <span className="text-xs text-ink-10">/ bln</span>
                      </p>
                      <p className="text-sm text-ink-11">
                        {room.total - room.available} terisi · {room.available} kosong
                      </p>
                      {room.facilities.length > 0 && (
                        <ul aria-label="Fasilitas" className="flex flex-wrap gap-1">
                          {room.facilities.map((fac) => (
                            <li key={fac} className="chip">
                              {fac}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => showUnitsOf(room.name)}
                      className="btn btn-secondary btn-sm w-full max-md:h-11"
                    >
                      Lihat {room.total} unit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="unit"
            title="Unit kamar"
            description={`${units.length} unit, penyewa aktif, dan statusnya.`}
            actions={
              <>
                <div className="relative w-full sm:w-56">
                  <label htmlFor="cari-unit" className="sr-only">
                    Cari kamar, tipe, atau penyewa
                  </label>
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-10"
                    aria-hidden="true"
                  />
                  <input
                    id="cari-unit"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kamar atau penyewa…"
                    className="field pl-9"
                  />
                </div>
                {floors.length > 1 && (
                  <>
                    <label htmlFor="filter-lantai" className="sr-only">
                      Lantai
                    </label>
                    <select
                      id="filter-lantai"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="field w-full sm:w-auto"
                    >
                      <option value={SEMUA_LANTAI}>Semua lantai</option>
                      {floors.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <Segmented<StatusFilter>
                  label="Status unit"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-full sm:w-auto"
                  options={[
                    { value: "ALL", label: `Semua (${units.length})` },
                    { value: "TERISI", label: `Terisi (${counts.terisi})` },
                    { value: "SIAP HUNI", label: `Kosong (${counts.kosong})` },
                  ]}
                />
              </>
            }
          >
            {filteredUnits.length === 0 ? (
              <EmptyState
                title="Tidak ada unit yang cocok"
                description="Ubah kata kunci, lantai, atau status."
                action={
                  adaFilter && (
                    <button type="button" onClick={resetFilter} className="btn btn-secondary">
                      Hapus filter
                    </button>
                  )
                }
              />
            ) : (
              <div>
                <div className="overflow-x-auto p-0.5">
                  <table className="table-tactile">
                    <thead>
                      <tr>
                        <th scope="col">Kamar</th>
                        <th scope="col">Tipe</th>
                        <th scope="col">Lantai</th>
                        <th scope="col">Tarif</th>
                        <th scope="col">Status</th>
                        <th scope="col">Penyewa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnits.map((unit) => (
                        <tr key={unit.id}>
                          <td className="whitespace-nowrap">{unit.number}</td>
                          <td className="max-w-[32ch] truncate" title={unit.type}>
                            {unit.type}
                          </td>
                          <td className="whitespace-nowrap">{unit.floor || "–"}</td>
                          <td className="whitespace-nowrap">{formatRupiah(unit.price)}</td>
                          <td>
                            <StatusDot kind="room" status={unit.status} />
                          </td>
                          <td>
                            {unit.status === "TERISI" && unit.tenantName ? (
                              <span className="whitespace-nowrap">
                                <span className="text-ink-12">{unit.tenantName}</span>
                                {unit.dueDate && <span className="text-xs"> s/d {unit.dueDate}</span>}
                              </span>
                            ) : (
                              "–"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-meta mt-3" aria-live="polite">
                  Menampilkan {filteredUnits.length} dari {units.length} unit
                </p>
              </div>
            )}
          </Section>
        </>
      )}

      {addOpen && <AddRoomDialog onClose={() => setAddOpen(false)} />}
    </div>
  );
}
