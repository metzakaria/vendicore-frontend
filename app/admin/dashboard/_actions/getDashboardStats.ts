"use server";

import prisma from "@/lib/prisma";

interface GetDashboardStatsParams {
  startDate?: string;
  endDate?: string;
}

export const getDashboardStats = async (params?: GetDashboardStatsParams) => {
  try {
    let startDate: Date;
    let endDate: Date;
    
    if (params?.startDate && params?.endDate) {
      startDate = new Date(params.startDate);
      endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today;
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    const [
      totalMerchants,
      todayTransactions,
      totalVolume,
      failedTransactions,
      activeProviders,
      successTransactions,
      pendingTransactions,
      totalProviderAccounts,
    ] = await Promise.all([
      prisma.vas_merchants.count({
        where: { is_active: true },
      }),
      prisma.vas_transactions.count({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.vas_transactions.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "success",
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.vas_transactions.count({
        where: {
          status: "failed",
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.vas_providers.count({
        where: { is_active: true },
      }),
      prisma.vas_transactions.count({
        where: {
          status: "success",
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.vas_transactions.count({
        where: {
          status: "pending",
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.vas_provider_accounts.count({
        where: {
          vas_providers: {
            is_active: true,
          },
        },
      }),
    ]);

    const volume = totalVolume._sum.amount || 0;
    const totalTransactions = await prisma.vas_transactions.count({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const failureRate =
      totalTransactions > 0
        ? ((failedTransactions / totalTransactions) * 100).toFixed(1)
        : "0";

    const successRate =
      todayTransactions > 0
        ? ((successTransactions / todayTransactions) * 100).toFixed(1)
        : "0";

    return {
      totalMerchants,
      todayTransactions,
      volume: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(Number(volume)),
      failureRate: `${failureRate}%`,
      successRate: `${successRate}%`,
      activeProviders,
      pendingTransactions,
      totalProviderAccounts,
      failedTransactions,
      successTransactions,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalMerchants: 0,
      todayTransactions: 0,
      volume: "₦0",
      failureRate: "0%",
      successRate: "0%",
      activeProviders: 0,
      pendingTransactions: 0,
      totalProviderAccounts: 0,
      failedTransactions: 0,
      successTransactions: 0,
    };
  }
};