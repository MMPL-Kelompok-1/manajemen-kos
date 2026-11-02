"use client";

import React, { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";

// Types Definitions
interface RoomType {
  id: string;
  name: string;
  price: number;
  available: number;
  total: number;
  size: string;
  floor: string;
  image: string;
  facilities: string[];
}

interface RoomUnit {
  id: string;
  number: string;
  type: string;
  typeBadgeClass: string;
  floor: string;
  price: number;
  status: "TERISI" | "SIAP HUNI" | "PERAWATAN";
  tenantName?: string;
  dueDate?: string;
  notes?: string;
}

// Data Dummy
const ROOM_TYPES: RoomType[] = [
  {
    id: "1",
    name: "Kamar Deluxe Lantai 1",
    price: 1500000,
    available: 1,
    total: 4,
    size: "4x4 m",
    floor: "Lt. 1",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmykJ1Kir2qftrlzzMnBfgnHAsjbO5HeOtxuUXVhHuoUOetbe56B8jKvTVleU0Ri7tfhn7d-dSBIDk-bYa7V9nNajzsZhOaAqdcxuTPyT5zIXb9OhhsG-oKNCR9PKgfS0EFAjxebarpmAIyrFFfLhVpbZJUKwm4tH6G__Te9O0Ciq2SRxUy9sbpjiYVMS3ag52aJiM3gPYYQ0nusm89S32jQwQKYxLJP7p2Dwpvaan",
    facilities: [
      "AC 1 PK",
      "KM Dalam",
      "Springbed Queen",
      "Meja Belajar",
      "WiFi 100M",
      "Water Heater",
    ],
  },
  {
    id: "2",
    name: "Kamar Standard Balkon",
    price: 1200000,
    available: 0,
    total: 3,
    size: "3.5x3 m",
    floor: "Lt. 2",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBNMiT8RchYVdM9k6vJGgMphR0h21I4-BIWpIGiBx0FvG8fnQi580fyPLixlivTDfPuHmh38vcR_2UGkrgm9Lt1csybyb6W5RRgfiUANdNAFRFuJfrckHfh8zhNjjcvxeDg3MJqxhrQmyj5JhSxIkRIre5YVfxx_jKgvsRJLPxxJS5sTQ1ApUl_Q8J6P4_q22aMIGzwW2jBa8A467CJMAi9kndr8lxiK0AfsWPtj3d7",
    facilities: [
      "AC 1/2 PK",
      "Balkon Pribadi",
      "Kasur Single",
      "Lemari 2 Pintu",
      "KM Luar Bersih",
    ],
  },
  {
    id: "3",
    name: "Kamar Executive Suite",
    price: 2100000,
    available: 1,
    total: 2,
    size: "5x4.5 m",
    floor: "Lt. 3",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMnEUI-lUKnFR6zH15iMJKc5pEvFRELwj4B50sY2T-SAk10W4ztxPMN3aoay6NIxx3OafB6S405npTqHg6qVG_R9BeoHOfFL04fUuxl3AgJNnkEZvPTHUHXkmmwUz28xXfhN2-tPQcGT8-eErv5_rh-fsnh87d0Uq00_4kXlFx8sG5H2SjhL_F7VtOLqG16uB4PVdbdzPVhgxjZDPAct0ejS1c9PZh-fQZro15fcid",
    facilities: [
      "AC Daikin 1.5 PK",
      'Smart TV 43"',
      "Kulkas Mini",
      "Kasur King",
      "Bathtub",
      "Balkon Panoramic",
    ],
  },
  {
    id: "4",
    name: "Kamar Hemat Cozy",
    price: 950000,
    available: 0,
    total: 3,
    size: "3x3 m",
    floor: "Lt. 1",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDBDuqC-LL3T_-hF6WVEbFkou53HF-g055M8c7kHf1OAep6nzxhSVyM5BolHTyafRP-Fj2zj5cFfaqOrPe4xNQhGbxZcBKMWgKRQNCwzvi2UORaeuDN7Ld0KAaXLoT5T359qaZuLvO7zVh57YFHKR7cancKSSetYPTmix9JkQxKfI2klSidxEzWzDjaSpDczr-aex6Inrz5YcPNQN6lqriDKO5BuJiJZJnAV6PLhRMm",
    facilities: [
      "Kipas Angin Dinding",
      "Kasur Single",
      "Meja Belajar",
      "KM Bersama",
      "Ventilasi Alami",
    ],
  },
];

const ROOM_UNITS: RoomUnit[] = [
  {
    id: "1",
    number: "A-101",
    type: "Deluxe Lt. 1",
    typeBadgeClass: "bg-primary/10 text-primary",
    floor: "Lantai 1",
    price: 1500000,
    status: "TERISI",
    tenantName: "Budi Santoso",
    dueDate: "14 Okt 2025",
  },
  {
    id: "2",
    number: "A-102",
    type: "Deluxe Lt. 1",
    typeBadgeClass: "bg-primary/10 text-primary",
    floor: "Lantai 1",
    price: 1500000,
    status: "SIAP HUNI",
    notes: "Kamar Kosong - Bersih & Siap Check-in",
  },
  {
    id: "3",
    number: "A-103",
    type: "Deluxe Lt. 1",
    typeBadgeClass: "bg-primary/10 text-primary",
    floor: "Lantai 1",
    price: 1500000,
    status: "TERISI",
    tenantName: "Siti Rahmawati",
    dueDate: "01 Des 2025",
  },
  {
    id: "4",
    number: "A-104",
    type: "Deluxe Lt. 1",
    typeBadgeClass: "bg-primary/10 text-primary",
    floor: "Lantai 1",
    price: 1500000,
    status: "TERISI",
    tenantName: "Reza Pratama",
    dueDate: "28 Feb 2026",
  },
  {
    id: "5",
    number: "B-201",
    type: "Standard Balkon",
    typeBadgeClass: "bg-tertiary-container/30 text-tertiary",
    floor: "Lantai 2",
    price: 1200000,
    status: "TERISI",
    tenantName: "Ahmad Fauzi",
    dueDate: "10 Jan 2026",
  },
  {
    id: "6",
    number: "B-202",
    type: "Standard Balkon",
    typeBadgeClass: "bg-tertiary-container/30 text-tertiary",
    floor: "Lantai 2",
    price: 1200000,
    status: "TERISI",
    tenantName: "Dian Maharani",
    dueDate: "18 Nov 2025",
  },
  {
    id: "7",
    number: "B-203",
    type: "Standard Balkon",
    typeBadgeClass: "bg-tertiary-container/30 text-tertiary",
    floor: "Lantai 2",
    price: 1200000,
    status: "TERISI",
    tenantName: "Gita Novita",
    dueDate: "22 Mar 2026",
  },
  {
    id: "8",
    number: "C-301",
    type: "Executive Suite",
    typeBadgeClass: "bg-secondary/15 text-secondary",
    floor: "Lantai 3",
    price: 2100000,
    status: "SIAP HUNI",
    notes: "Unit Kosong - Selesai Deep Cleaning",
  },
  {
    id: "9",
    number: "C-302",
    type: "Executive Suite",
    typeBadgeClass: "bg-secondary/15 text-secondary",
    floor: "Lantai 3",
    price: 2100000,
    status: "TERISI",
    tenantName: "Kevin Wijaya",
    dueDate: "15 Mei 2026",
  },
  {
    id: "10",
    number: "H-101",
    type: "Hemat Cozy",
    typeBadgeClass: "bg-surface-bright text-on-surface-variant",
    floor: "Lantai 1",
    price: 950000,
    status: "TERISI",
    tenantName: "Rian Hidayat",
    dueDate: "05 Nov 2025",
  },
  {
    id: "11",
    number: "H-102",
    type: "Hemat Cozy",
    typeBadgeClass: "bg-surface-bright text-on-surface-variant",
    floor: "Lantai 1",
    price: 950000,
    status: "TERISI",
    tenantName: "Taufik Ismail",
    dueDate: "19 Des 2025",
  },
  {
    id: "12",
    number: "H-103",
    type: "Hemat Cozy",
    typeBadgeClass: "bg-surface-bright text-on-surface-variant",
    floor: "Lantai 1",
    price: 950000,
    status: "TERISI",
    tenantName: "Yusuf Mansur",
    dueDate: "30 Jan 2026",
  },
];

export default function RoomManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFloorFilter, setSelectedFloorFilter] = useState("Semua Lantai");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TERISI" | "SIAP HUNI">("ALL");

  // Format Mata Uang IDR
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter Logic
  const filteredUnits = ROOM_UNITS.filter((unit) => {
    const matchesSearch =
      unit.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.tenantName && unit.tenantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "SIAP HUNI"
          ? unit.status === "SIAP HUNI"
          : unit.status === "TERISI";

    const matchesFloor =
      selectedFloorFilter === "Semua Lantai"
        ? true
        : unit.floor.toLowerCase().includes(selectedFloorFilter.toLowerCase().slice(0, 8));

    return matchesSearch && matchesStatus && matchesFloor;
  });

  return (
    <Sidebar>
      <div className="w-full bg-surface px-space-lg min-h-screen text-on-surface">
        <div className="flex flex-col w-full pb-space-2xl gap-space-xl">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-md">
            <div className="flex flex-col gap-space-xs">
              <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">
                Manajemen Kos & Kamar
              </h1>
              <p className="font-body text-body-md text-on-surface-variant">
                Kelola tipe kamar, tarif sewa bulanan, fasilitas, dan ketersediaan unit kos secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-space-sm flex-wrap">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-space-sm px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
                  <span className="font-body text-label-md">{selectedFloorFilter}</span>
                  <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-highest shadow-xl p-space-sm z-30 flex flex-col gap-1">
                    <span className="font-body text-label-sm text-outline px-space-sm py-1 uppercase">
                      Pilih Lantai
                    </span>
                    {[
                      "Semua Lantai",
                      "Lantai 1 (Gedung Utama)",
                      "Lantai 2 (Balkon Sayap)",
                      "Lantai 3 (Rooftop View)",
                    ].map((floor) => (
                      <button
                        key={floor}
                        onClick={() => {
                          setSelectedFloorFilter(floor);
                          setIsFilterOpen(false);
                        }}
                        className="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-left text-on-surface hover:bg-surface-container text-body-sm"
                        type="button"
                      >
                        <span>{floor}</span>
                        {selectedFloorFilter === floor && (
                          <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tambah Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-space-sm px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container font-headline text-headline-sm hover:opacity-90 shadow-md transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>+ Tambah Tipe Kamar Baru</span>
              </button>
            </div>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {/* Metric 1 */}
            <div className="p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-on-surface-variant">Total Kapasitas</span>
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">domain</span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="font-headline text-metric-stat text-on-surface tracking-tight">
                  12 <span className="font-body text-body-md text-outline">Kamar</span>
                </div>
                <div className="flex items-center gap-space-xs mt-1 text-on-surface-variant font-body text-body-sm">
                  <span className="font-code text-secondary">100%</span>
                  <span>terdaftar di 3 lantai aktif</span>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-secondary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-on-surface-variant">Tingkat Okupansi</span>
                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-headline text-metric-stat text-on-surface tracking-tight">10</span>
                  <span className="font-body text-body-md text-outline">Kamar</span>
                  <span className="ml-auto font-body text-label-sm px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                    83.3% Occupied
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-1000 w-[83.3%]" />
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-tertiary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-on-surface-variant">Unit Siap Sewa</span>
                <div className="w-9 h-9 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">meeting_room</span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-headline text-metric-stat text-on-surface tracking-tight">2</span>
                  <span className="font-body text-body-md text-outline">Kamar Kosong</span>
                </div>
                <div className="flex items-center gap-space-xs mt-1 text-body-sm font-body">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-secondary font-body text-label-md">Ready to move-in</span>
                  <span className="text-outline">• A-102 & C-301</span>
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary-container/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-on-surface-variant">Potensi Pendapatan</span>
                <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="font-headline text-metric-stat text-on-surface tracking-tight">
                  {formatIDR(18250000)}
                </div>
                <div className="flex items-center justify-between mt-1 text-on-surface-variant font-body text-body-sm">
                  <span>Target kas / bulan</span>
                  <span className="text-secondary font-code font-semibold">+6.4% MoM</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: MASTER ROOM TYPES */}
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div>
                <h2 className="font-headline text-headline-md text-on-surface">Katalog Tipe Kamar Master</h2>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Konfigurasi fasilitas standar, kuota unit, dan tarif per kategori kamar
                </p>
              </div>
              <span className="font-body text-label-sm text-outline self-start sm:self-auto">
                4 Kategori Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
              {ROOM_TYPES.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl bg-surface-container shadow-md flex flex-col justify-between overflow-hidden hover:bg-surface-container-high transition-all"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-surface-container-low">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/20 to-transparent" />
                    <span
                      className={`absolute top-3 left-3 px-2 py-0.5 rounded-md font-body text-label-sm font-semibold tracking-wider ${room.available > 0
                        ? "bg-secondary/90 text-on-secondary"
                        : "bg-error-container/90 text-on-error-container"
                        }`}
                    >
                      {room.available > 0
                        ? `${room.available} UNIT TERSEDIA`
                        : "PENUH (0 TERSEDIA)"}
                    </span>
                    <span className="absolute bottom-2 right-3 font-code text-on-surface-variant bg-surface/80 px-2 py-0.5 rounded backdrop-blur">
                      {room.floor} • {room.size}
                    </span>
                  </div>

                  <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                    <div className="flex flex-col gap-space-xs">
                      <h3 className="font-headline text-headline-sm text-on-surface">{room.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline text-metric-stat text-primary">
                          {formatIDR(room.price)}
                        </span>
                        <span className="text-on-surface-variant font-body text-body-sm">/ bln</span>
                      </div>

                      <div className="flex items-center gap-space-xs mt-1">
                        <span className="font-body text-body-sm text-outline">Kapasitas:</span>
                        <span
                          className={`font-body text-label-sm px-2 py-0.5 rounded ${room.available > 0
                            ? "text-on-surface bg-surface-container-highest"
                            : "text-error bg-error/10"
                            }`}
                        >
                          {room.total - room.available} Terisi / {room.available} Kosong
                        </span>
                      </div>

                      {/* Facility Pills */}
                      <div className="mt-space-sm flex flex-col gap-1">
                        <span className="font-body text-label-sm text-outline uppercase tracking-wider">
                          Fasilitas Utama:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-code text-code"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-xs pt-space-sm">
                      <button
                        className="flex-1 py-1.5 px-space-sm rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-body text-label-md text-center transition-colors"
                        type="button"
                      >
                        Edit Tipe
                      </button>
                      <button
                        className="flex-1 py-1.5 px-space-sm rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-body text-label-md text-center transition-colors"
                        type="button"
                      >
                        Detail Unit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: DAFTAR UNIT KAMAR & STATUS REAL-TIME */}
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div>
                <h2 className="font-headline text-headline-md text-on-surface">
                  Daftar Unit Kamar & Status Real-Time
                </h2>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Monitoring individual {ROOM_UNITS.length} unit kamar, riwayat penghuni, dan status pemeliharaan
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-space-sm flex-wrap">
                {/* Search Bar */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari no. kamar / penyewa..."
                    className="h-9 pl-9 pr-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-outline font-body text-body-sm focus:outline-none focus:bg-surface-container-highest transition-colors"
                  />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center p-1 rounded-lg bg-surface-container-high text-label-sm font-body">
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className={`px-3 py-1 rounded transition-all ${statusFilter === "ALL"
                      ? "bg-surface-container text-on-surface font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    type="button"
                  >
                    Semua ({ROOM_UNITS.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("TERISI")}
                    className={`px-3 py-1 rounded transition-all ${statusFilter === "TERISI"
                      ? "bg-surface-container text-on-surface font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    type="button"
                  >
                    Terisi ({ROOM_UNITS.filter((u) => u.status === "TERISI").length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("SIAP HUNI")}
                    className={`px-3 py-1 rounded transition-all ${statusFilter === "SIAP HUNI"
                      ? "bg-surface-container text-on-surface font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    type="button"
                  >
                    Kosong ({ROOM_UNITS.filter((u) => u.status === "SIAP HUNI").length})
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="w-full rounded-xl bg-surface-container shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-outline font-body text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-space-md">Nomor Kamar</th>
                      <th className="py-3 px-space-md">Tipe Kamar</th>
                      <th className="py-3 px-space-md">Lantai</th>
                      <th className="py-3 px-space-md">Tarif / Bln</th>
                      <th className="py-3 px-space-md">Status & Penghuni</th>
                      <th className="py-3 px-space-md text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-body text-body-md text-on-surface">
                    {filteredUnits.length > 0 ? (
                      filteredUnits.map((unit) => (
                        <tr
                          key={unit.id}
                          className={`transition-colors ${unit.status === "SIAP HUNI"
                            ? "bg-secondary/5 hover:bg-secondary/10"
                            : "hover:bg-surface-container-high/60"
                            }`}
                        >
                          <td className="py-3.5 px-space-md">
                            <div className="flex items-center gap-space-sm">
                              <span
                                className={`w-2 h-2 rounded-full bg-secondary ${unit.status === "SIAP HUNI" ? "animate-ping" : ""
                                  }`}
                              />
                              <span className="font-headline text-headline-sm text-on-surface font-semibold">
                                {unit.number}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-space-md">
                            <span className={`px-2.5 py-1 rounded-md font-code ${unit.typeBadgeClass}`}>
                              {unit.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-space-md text-on-surface-variant">{unit.floor}</td>
                          <td className="py-3.5 px-space-md font-code font-semibold text-on-surface">
                            {formatIDR(unit.price)}
                          </td>
                          <td className="py-3.5 px-space-md">
                            {unit.status === "TERISI" ? (
                              <div className="flex items-center gap-space-xs">
                                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-body text-label-sm font-semibold">
                                  TERISI
                                </span>
                                <span className="font-body text-body-sm text-on-surface">
                                  {unit.tenantName}
                                </span>
                                <span className="text-outline font-body text-body-sm">
                                  (s/d {unit.dueDate})
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-space-xs">
                                <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-body text-label-sm font-semibold">
                                  SIAP HUNI
                                </span>
                                <span className="text-secondary font-body text-body-sm font-medium">
                                  {unit.notes}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-space-md text-right">
                            <div className="flex items-center justify-end gap-1">
                              {unit.status === "SIAP HUNI" && (
                                <button
                                  className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary-container font-body text-label-sm hover:opacity-90 transition-opacity mr-1"
                                  type="button"
                                >
                                  Check-in Tamu
                                </button>
                              )}
                              <button
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                                title="Edit Unit"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              {unit.status === "TERISI" && (
                                <button
                                  className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors"
                                  title="Set Kosong"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    person_remove
                                  </span>
                                </button>
                              )}
                              <button
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Riwayat Kamar"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">history</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-outline font-body">
                          Tidak ada unit kamar yang cocok dengan kriteria pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="py-3 px-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-body text-body-sm text-on-surface-variant">
                <span>
                  Menampilkan 1 - {filteredUnits.length} dari {filteredUnits.length} unit terdaftar
                </span>
                <div className="flex items-center gap-space-xs">
                  <button className="p-1 rounded bg-surface-container opacity-40 cursor-not-allowed" disabled type="button">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <span className="px-2.5 py-0.5 rounded bg-primary-container text-on-primary-container font-semibold">
                    1
                  </span>
                  <button className="p-1 rounded bg-surface-container opacity-40 cursor-not-allowed" disabled type="button">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: TAMBAH TIPE KAMAR BARU */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm p-space-md">
            <div className="relative w-full max-w-xl rounded-2xl bg-surface-container shadow-2xl p-space-lg flex flex-col gap-space-lg max-h-[90vh] overflow-y-auto border border-surface-container-high">
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
                <div className="flex flex-col">
                  <h3 className="font-headline text-headline-md text-on-surface">Tambah Tipe Kamar Baru</h3>
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Atur spesifikasi kamar, harga sewa dasar, dan paket fasilitas
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-body text-label-md text-on-surface">Nama Tipe Kamar</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kamar Studio VIP Balcony"
                    className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-outline text-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-1">
                    <label className="font-body text-label-md text-on-surface">Tarif Sewa Bulanan (Rp)</label>
                    <input
                      type="number"
                      placeholder="1850000"
                      className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-outline text-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-body text-label-md text-on-surface">Ukuran Dimensi</label>
                    <input
                      type="text"
                      placeholder="4 x 4 Meter"
                      className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-outline text-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-body text-label-md text-on-surface">Fasilitas Utama Termasuk</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {[
                      { label: "AC Daikin", defaultChecked: true },
                      { label: "KM Dalam", defaultChecked: true },
                      { label: "Water Heater", defaultChecked: true },
                      { label: "WiFi 100Mbps", defaultChecked: true },
                      { label: "Smart TV", defaultChecked: false },
                      { label: "Kulkas Mini", defaultChecked: false },
                    ].map((fac, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={fac.defaultChecked}
                          className="rounded accent-primary"
                        />
                        <span className="font-body text-body-sm text-on-surface">{fac.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-body text-label-md text-on-surface">Catatan / Deskripsi Tambahan</label>
                  <textarea
                    rows={3}
                    placeholder="Informasi daya listrik token, batas kapasitas penghuni..."
                    className="p-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-outline text-body-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-surface-container-high">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-body text-label-md"
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity font-headline text-headline-sm"
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
    </Sidebar>
  );
}