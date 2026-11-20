// Barrel lapisan data. Implementasi ada di lib/services/*; file ini menjaga import lama tetap jalan.
export { ApiError } from "@/lib/errors";
export { authenticateAccount, registerAccount } from "@/lib/services/auth";
export { confirmPayment, createPayment, markPaymentPaid } from "@/lib/services/payment";
export {
  createRoom,
  getKos,
  getKosList,
  getRoomManagementData,
  setRoomNumber,
} from "@/lib/services/room";
export { getAdminOverview, getUserDashboard } from "@/lib/services/dashboard";
export { getTenantDetail, getTenantManagementData } from "@/lib/services/tenant";
export { getTransactionManagementData } from "@/lib/services/transaction";
export {
  getAvailableReportYears,
  getFinancialExportRows,
  getFinancialReport,
} from "@/lib/services/report";
export type {
  AccountInfo,
  AdminOrderRow,
  AdminOverview,
  ClientOrderHistory,
  FinancialExportRow,
  FinancialReport,
  Kos,
  KosStatus,
  MonthlyRevenue,
  Payment,
  RoomManagementData,
  RoomRevenue,
  RoomUnitStatus,
  TenantDetail,
  TenantManagementData,
  TenantRow,
  TransactionManagementData,
  TransactionRow,
  UserDashboardData,
} from "@/lib/types";
