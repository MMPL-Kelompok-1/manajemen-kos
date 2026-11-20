import { OrderStatusEnum, PaymentStatusEnum } from "@prisma/client";
import {
  currentJakartaMonthKey,
  formatMonthKey,
  jakartaMonthBounds,
  jakartaMonthKey,
} from "@/lib/format";
import { roomDisplayName } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import type {
  FinancialExportRow,
  FinancialReport,
  MonthlyRevenue,
  RoomRevenue,
} from "@/lib/types";

function yearBounds(year: number): { start: Date; end: Date } {
  return {
    start: new Date(`${year}-01-01T00:00:00+07:00`),
    end: new Date(`${year + 1}-01-01T00:00:00+07:00`),
  };
}

export async function getAvailableReportYears(): Promise<number[]> {
  const currentYear = Number(currentJakartaMonthKey().slice(0, 4));
  const paid = await prisma.payment.findMany({
    where: { status: PaymentStatusEnum.paid, paid_at: { not: null } },
    select: { paid_at: true },
  });
  const years = new Set<number>([currentYear]);
  for (const payment of paid) {
    if (!payment.paid_at) continue;
    years.add(Number(jakartaMonthKey(payment.paid_at).slice(0, 4)));
  }
  return [...years].sort((a, b) => b - a);
}

export async function getFinancialReport(year: number): Promise<FinancialReport> {
  const { start, end } = yearBounds(year);
  const currentMonth = currentJakartaMonthKey();
  const currentYear = Number(currentMonth.slice(0, 4));
  const currentMonthNumber = Number(currentMonth.slice(5, 7));
  const thisMonth = jakartaMonthBounds(currentMonth);

  const [paid, availableYears, receivable, thisMonthPaid] = await Promise.all([
    prisma.payment.findMany({
      where: { status: PaymentStatusEnum.paid, paid_at: { gte: start, lt: end } },
      select: {
        id: true,
        amount: true,
        paid_at: true,
        order: {
          select: {
            client_id: true,
            room: { select: { id: true, name: true, room_number: true } },
          },
        },
      },
    }),
    getAvailableReportYears(),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatusEnum.unpaid,
        order: { status: OrderStatusEnum.pending },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatusEnum.paid,
        paid_at: { gte: thisMonth.start, lt: thisMonth.end },
      },
      _sum: { amount: true },
    }),
  ]);

  const monthly: MonthlyRevenue[] = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    return { month, label: formatMonthKey(month), revenue: 0, transactions: 0, tenants: 0 };
  });
  const tenantsByMonth = Array.from({ length: 12 }, () => new Set<string>());
  const rooms = new Map<string, RoomRevenue>();
  let totalRevenue = 0;

  for (const payment of paid) {
    if (!payment.paid_at) continue;
    const key = jakartaMonthKey(payment.paid_at);
    const index = Number(key.slice(5, 7)) - 1;
    const amount = payment.amount.toNumber();
    totalRevenue += amount;

    const bucket = monthly[index];
    if (bucket) {
      bucket.revenue += amount;
      bucket.transactions++;
      tenantsByMonth[index].add(payment.order.client_id);
    }

    const room = payment.order.room;
    const existing = rooms.get(room.id);
    if (existing) {
      existing.revenue += amount;
      existing.transactions++;
    } else {
      rooms.set(room.id, {
        roomId: room.id,
        name: roomDisplayName(room),
        roomNumber: room.room_number,
        revenue: amount,
        transactions: 1,
      });
    }
  }

  monthly.forEach((bucket, index) => {
    bucket.tenants = tenantsByMonth[index].size;
  });

  const monthsElapsed =
    year < currentYear ? 12 : year === currentYear ? currentMonthNumber : 1;

  const years = [...new Set([year, ...availableYears])].sort((a, b) => b - a);

  return {
    year,
    years,
    totalRevenue,
    thisMonthRevenue: thisMonthPaid._sum.amount?.toNumber() ?? 0,
    averageMonthly: totalRevenue / Math.max(1, monthsElapsed),
    paidTransactions: paid.length,
    receivableAmount: receivable._sum.amount?.toNumber() ?? 0,
    receivableCount: receivable._count,
    monthly,
    roomBreakdown: [...rooms.values()].sort((a, b) => b.revenue - a.revenue),
  };
}

export async function getFinancialExportRows(year: number): Promise<FinancialExportRow[]> {
  const { start, end } = yearBounds(year);
  const paid = await prisma.payment.findMany({
    where: { status: PaymentStatusEnum.paid, paid_at: { gte: start, lt: end } },
    orderBy: { paid_at: "asc" },
    select: {
      id: true,
      amount: true,
      method: true,
      paid_at: true,
      order: {
        select: {
          client: { select: { name: true, email: true } },
          room: { select: { name: true, room_number: true } },
        },
      },
    },
  });

  return paid.map((payment) => ({
    paymentId: payment.id,
    paidAt: payment.paid_at?.toISOString() ?? "",
    tenantName: payment.order.client.name,
    tenantEmail: payment.order.client.email,
    roomName: roomDisplayName(payment.order.room),
    roomNumber: payment.order.room.room_number,
    amount: payment.amount.toNumber(),
    method: payment.method,
  }));
}
