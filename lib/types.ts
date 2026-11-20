import type { OrderStatusEnum, RoomStatusEnum } from "@prisma/client";
import type { BankInfo, PaymentStatus } from "@/lib/payment";
import type { Role } from "@/lib/session";

export type Kos = {
  id: string;
  name: string;
  area: string;
  address: string;
  price: number;
  gender: string;
  roomSize: string;
  bathroom: string;
  roomsLeft: number;
  description: string;
  facilities: string[];
  photos: string[];
  status: RoomStatusEnum;
};

export type Payment = {
  id: string;
  registrationId: string;
  kosId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  expiredAt: string | null;
};

export type AccountInfo = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  roomNumber: string | null;
};

export type KosStatus =
  | "belum_pilih_kos"
  | "belum_bayar"
  | "menunggu_konfirmasi"
  | "lunas"
  | "terlambat";

export type ClientOrderHistory = {
  orderId: string;
  kosId: string;
  kosName: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  status: OrderStatusEnum;
  payments: Payment[];
};

export type UserDashboardData = {
  account: AccountInfo;
  kos: Kos | null;
  payment: Payment | null;
  orderHistory: ClientOrderHistory[];
  status: KosStatus;
  lastPaidAt: string | null;
  dueAt: string | null;
  bank: BankInfo;
};

export type TenantRow = {
  registrationId: string;
  name: string;
  phone: string;
  email: string;
  kosName: string | null;
  roomNumber: string | null;
  status: KosStatus;
  amount: number | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus | null;
  lastPaidAt: string | null;
  dueAt: string | null;
};

export type AdminOrderRow = {
  orderId: string;
  clientName: string;
  clientEmail: string;
  kosName: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  status: OrderStatusEnum;
  payments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    expiredAt: string;
  }[];
};

export type AdminOverview = {
  rows: TenantRow[];
  orders: AdminOrderRow[];
  stats: {
    lunas: number;
    menungguKonfirmasi: number;
    terlambat: number;
    belumBayar: number;
    totalKamarTersisa: number;
  };
  kosSummary: { id: string; name: string; roomsLeft: number; price: number }[];
};

export type TenantManagementData = {
  rows: TenantRow[];
  stats: {
    total: number;
    lunas: number;
    menungguKonfirmasi: number;
    terlambat: number;
    belumBayar: number;
    belumPilihKos: number;
  };
};

export type TenantDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: KosStatus;
  lastPaidAt: string | null;
  dueAt: string | null;
  kosName: string | null;
  roomNumber: string | null;
  amount: number | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus | null;
  orders: ClientOrderHistory[];
};

export type TransactionRow = {
  id: string;
  orderId: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  kosName: string;
  roomNumber: string;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  createdAt: string;
  paidAt: string | null;
  expiredAt: string;
  orderStatus: OrderStatusEnum;
  canConfirm: boolean;
};

export type TransactionManagementData = {
  rows: TransactionRow[];
  stats: {
    receivedThisMonth: number;
    pendingAmount: number;
    pendingCount: number;
    unpaidAmount: number;
    unpaidCount: number;
    totalCount: number;
  };
};

export type MonthlyRevenue = {
  month: string;
  label: string;
  revenue: number;
  transactions: number;
  tenants: number;
};

export type RoomRevenue = {
  roomId: string;
  name: string;
  roomNumber: string;
  revenue: number;
  transactions: number;
};

export type FinancialReport = {
  year: number;
  years: number[];
  totalRevenue: number;
  thisMonthRevenue: number;
  averageMonthly: number;
  paidTransactions: number;
  receivableAmount: number;
  receivableCount: number;
  monthly: MonthlyRevenue[];
  roomBreakdown: RoomRevenue[];
};

export type FinancialExportRow = {
  paymentId: string;
  paidAt: string;
  tenantName: string;
  tenantEmail: string;
  roomName: string;
  roomNumber: string;
  amount: number;
  method: string | null;
};

export type RoomUnitStatus = "TERISI" | "SIAP HUNI" | "PERAWATAN";

export type RoomManagementData = {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
    potentialRevenue: number;
  };
  roomTypes: {
    id: string;
    name: string;
    price: number;
    available: number;
    total: number;
    size: string;
    floor: string;
    // Foto pertama kamar; string kosong bila belum ada foto.
    image: string;
    // Bisa kosong bila fasilitas belum diisi.
    facilities: string[];
  }[];
  units: {
    id: string;
    number: string;
    type: string;
    floor: string;
    price: number;
    status: RoomUnitStatus;
    tenantName?: string;
    dueDate?: string;
    notes?: string;
  }[];
};
