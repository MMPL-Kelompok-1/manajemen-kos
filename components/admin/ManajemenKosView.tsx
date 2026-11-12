"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Users,
  DoorOpen,
  DollarSign,
  Plus,
  SlidersHorizontal,
  Search,
  Check,
  Edit,
  UserX,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Layers,
} from "lucide-react";
import type { RoomManagementData } from "@/lib/data";
import { formatRupiah } from "@/lib/format";

interface ManajemenKosViewProps {
  initialData: RoomManagementData;
}

export default function ManajemenKosView({
  initialData,
}: ManajemenKosViewProps) {
  const { stats, roomTypes, units } = initialData;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFloorFilter, setSelectedFloorFilter] =
    useState("Semua Lantai");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "TERISI" | "SIAP HUNI"
  >("ALL");

  // Filter Logic
  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.tenantName &&
        unit.tenantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "SIAP HUNI"
          ? unit.status === "SIAP HUNI"
          : unit.status === "TERISI";

    const matchesFloor =
      selectedFloorFilter === "Semua Lantai"
        ? true
        : unit.floor
            .toLowerCase()
            .includes(selectedFloorFilter.toLowerCase().slice(0, 8));

    return matchesSearch && matchesStatus && matchesFloor;
  });

  return (
    <div className="min-h-full">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-12 sm:px-6 md:py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Manajemen Kos & Kamar
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola tipe kamar, tarif sewa bulanan, fasilitas, dan ketersediaan
              unit kos secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted transition-colors"
                type="button"
              >
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <span>{selectedFloorFilter}</span>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg z-30 flex flex-col gap-1">
                  <span className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pilih Lantai
                  </span>
                  {["Semua Lantai", "Lantai 1", "Lantai 2", "Lantai 3"].map(
                    (floor) => (
                      <button
                        key={floor}
                        onClick={() => {
                          setSelectedFloorFilter(floor);
                          setIsFilterOpen(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-muted transition-colors"
                        type="button"
                      >
                        <span
                          className={
                            selectedFloorFilter === floor
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {floor}
                        </span>
                        {selectedFloorFilter === floor && (
                          <Check className="size-4 text-primary" />
                        )}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Tambah Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-sm transition-opacity"
              type="button"
            >
              <Plus className="size-4" />
              <span>Tambah Tipe Kamar</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {/* Metric 1 */}
          <div className="rounded-2xl bg-card p-4 shadow-sm sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Total Kapasitas
              </p>
              <div className="rounded-lg bg-muted p-2 text-foreground">
                <Building2 className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold sm:text-3xl">
                {stats.totalRooms}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  Kamar
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Terdaftar di unit aktif
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-2xl bg-card p-4 shadow-sm sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Tingkat Okupansi
              </p>
              <div className="rounded-lg bg-green-3 p-2 text-green-11">
                <Users className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold sm:text-3xl text-green-11">
                  {stats.occupiedRooms}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    Kamar
                  </span>
                </p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-3 text-green-11">
                  {stats.occupancyRate}%
                </span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-green-10 h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-2xl bg-card p-4 shadow-sm sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Unit Siap Sewa
              </p>
              <div className="rounded-lg bg-blue-3 p-2 text-blue-11">
                <DoorOpen className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold sm:text-3xl text-blue-11">
                {stats.availableRooms}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  Kamar Kosong
                </span>
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-blue-9 animate-pulse" />
                <span>Siap huni / ready to rent</span>
              </div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-primary-foreground/80 sm:text-sm">
                Potensi Pendapatan
              </p>
              <div className="rounded-lg bg-primary-foreground/10 p-2 text-primary-foreground">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl font-bold sm:text-2xl truncate">
                {formatRupiah(stats.potentialRevenue)}
              </p>
              <p className="mt-1 text-xs text-primary-foreground/80">
                Target pendapatan / bulan
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 1: MASTER ROOM TYPES */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-lg font-bold">Katalog Tipe Kamar Master</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Konfigurasi fasilitas standar, kuota unit, dan tarif per
                kategori kamar
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {roomTypes.length} Tipe Kamar Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {roomTypes.map((room) => (
              <div
                key={room.id}
                className="rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between overflow-hidden hover:border-muted-foreground/30 transition-all"
              >
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span
                    className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-semibold tracking-wider ${
                      room.available > 0
                        ? "bg-green-9 text-white"
                        : "bg-red-9 text-white"
                    }`}
                  >
                    {room.available > 0
                      ? `${room.available} UNIT TERSEDIA`
                      : "PENUH (0 TERSEDIA)"}
                  </span>
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-2 text-xs font-medium text-white bg-black/60 px-2.5 py-0.5 rounded-lg backdrop-blur">
                    <span>{room.floor}</span>
                    <span>•</span>
                    <span>{room.size}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">{room.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-foreground">
                        {formatRupiah(room.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / bln
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="text-muted-foreground">Kapasitas:</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-medium ${
                          room.available > 0
                            ? "bg-muted text-foreground"
                            : "bg-red-3 text-red-11"
                        }`}
                      >
                        {room.total - room.available} Terisi / {room.available}{" "}
                        Kosong
                      </span>
                    </div>

                    {/* Facility Pills */}
                    <div className="pt-2">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                        Fasilitas Utama:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {room.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex-1 py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-center transition-colors"
                      type="button"
                    >
                      Edit Tipe
                    </button>
                    <button
                      className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold text-center transition-opacity"
                      type="button"
                    >
                      Detail Unit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: DAFTAR UNIT KAMAR & STATUS REAL-TIME */}
        <section className="rounded-3xl bg-card shadow-sm border border-border overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">
                Daftar Unit Kamar & Status Real-Time
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Monitoring individual {units.length} unit kamar, penyewa aktif,
                dan status kamar
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kamar / penyewa..."
                  className="h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors w-full sm:w-56"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-muted text-xs">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === "ALL"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  type="button"
                >
                  Semua ({units.length})
                </button>
                <button
                  onClick={() => setStatusFilter("TERISI")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === "TERISI"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  type="button"
                >
                  Terisi ({units.filter((u) => u.status === "TERISI").length})
                </button>
                <button
                  onClick={() => setStatusFilter("SIAP HUNI")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === "SIAP HUNI"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  type="button"
                >
                  Kosong ({units.filter((u) => u.status === "SIAP HUNI").length}
                  )
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Nomor Kamar</th>
                  <th className="py-3 px-4 sm:px-6">Tipe Kamar</th>
                  <th className="py-3 px-4 sm:px-6">Lantai / Lokasi</th>
                  <th className="py-3 px-4 sm:px-6">Tarif Sewa</th>
                  <th className="py-3 px-4 sm:px-6">Status & Penghuni</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <tr
                      key={unit.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        unit.status === "SIAP HUNI" ? "bg-green-1/30" : ""
                      }`}
                    >
                      <td className="py-4 px-4 sm:px-6 font-semibold">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              unit.status === "SIAP HUNI"
                                ? "bg-green-9"
                                : unit.status === "TERISI"
                                  ? "bg-amber-9"
                                  : "bg-muted-foreground"
                            }`}
                          />
                          <span>{unit.number}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-foreground">
                          {unit.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-muted-foreground">
                        {unit.floor}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-semibold">
                        {formatRupiah(unit.price)}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        {unit.status === "TERISI" ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-amber-3 text-amber-11 text-xs font-semibold">
                              TERISI
                            </span>
                            <span className="font-medium text-foreground">
                              {unit.tenantName}
                            </span>
                            {unit.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                (s/d {unit.dueDate})
                              </span>
                            )}
                          </div>
                        ) : unit.status === "SIAP HUNI" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-green-3 text-green-11 text-xs font-semibold">
                              SIAP HUNI
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {unit.notes ?? "Siap Check-in"}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                            PERAWATAN
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Edit Unit"
                            type="button"
                          >
                            <Edit className="size-4" />
                          </button>
                          {unit.status === "TERISI" && (
                            <button
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-11 hover:bg-red-3 transition-colors"
                              title="Set Kosong"
                              type="button"
                            >
                              <UserX className="size-4" />
                            </button>
                          )}
                          <button
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="Riwayat Kamar"
                            type="button"
                          >
                            <History className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Tidak ada unit kamar yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="py-3 px-4 sm:px-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Menampilkan {filteredUnits.length} dari {units.length} unit
              terdaftar
            </span>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-lg border border-border bg-card opacity-50 cursor-not-allowed"
                disabled
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold">
                1
              </span>
              <button
                className="p-1.5 rounded-lg border border-border bg-card opacity-50 cursor-not-allowed"
                disabled
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL: TAMBAH TIPE KAMAR BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold">Tambah Tipe Kamar Baru</h3>
                <p className="text-xs text-muted-foreground">
                  Atur spesifikasi kamar, harga sewa dasar, dan paket fasilitas
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nama Tipe Kamar
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kamar Studio VIP Balcony"
                  className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Tarif Sewa Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="1850000"
                    className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Ukuran Dimensi
                  </label>
                  <input
                    type="text"
                    placeholder="4 x 4 Meter"
                    className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Fasilitas Utama Termasuk
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {[
                    { label: "AC", defaultChecked: true },
                    { label: "KM Dalam", defaultChecked: true },
                    { label: "Water Heater", defaultChecked: true },
                    { label: "WiFi", defaultChecked: true },
                    { label: "Smart TV", defaultChecked: false },
                    { label: "Kulkas Mini", defaultChecked: false },
                  ].map((fac, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background hover:bg-muted cursor-pointer transition-colors text-xs font-medium"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={fac.defaultChecked}
                        className="rounded accent-primary"
                      />
                      <span>{fac.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Catatan / Deskripsi Tambahan
                </label>
                <textarea
                  rows={3}
                  placeholder="Informasi daya listrik token, batas kapasitas penghuni..."
                  className="p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
                  type="button"
                >
                  Batal
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium transition-opacity"
                  type="submit"
                >
                  Simpan Tipe Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
