"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GetMerchantDashboardStatsParams {
  startDate?: string;
  endDate?: string;
}

export const getMerchantDashboardStats = async (params: GetMerchantDashboardStatsParams = {}) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);
    
    // Get merchant details
    const merchant = await prisma.vas_merchants.findUnique({
      where: { id: merchantId },
      select: {
        current_balance: true,
        business_name: true,
        merchant_code: true,
      },
    });
    if (!merchant) {
      return {
        error: "Merchant not found",
      };
    }

    // Use provided date range or default to today
    let startDate: Date;
    let endDate: Date;

    if (params.startDate && params.endDate) {
      startDate = new Date(params.startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      startDate = today;
    }

    // Get transaction statistics - optimized to 2 queries
    const [
      allTransactionsStats,
      successTransactions,
    ] = await Promise.all([
      // Aggregate query: Get sum of amount and count for ALL transactions in one call
      prisma.vas_transactions.aggregate({
        where: {
          merchant_id: merchantId,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
      // Count successful transactions only (for success rate calculation)
      prisma.vas_transactions.count({
        where: {
          merchant_id: merchantId,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
          status: "Success",
        },
      }),
    ]);

    // Extract values from aggregate result
    const totalVolume = allTransactionsStats._sum?.amount?.toString() || "0";
    const totalTransactions = allTransactionsStats._count?.id || 0;

    // Calculate success rate
    const successRate =
      totalTransactions > 0
        ? ((successTransactions / totalTransactions) * 100).toFixed(1)
        : "0.0";

    return {
      merchant: {
        business_name: merchant.business_name,
        merchant_code: merchant.merchant_code,
        current_balance: merchant.current_balance.toString(),
      },
      stats: {
        totalTransactions,
        totalVolume,
        successRate: `${successRate}%`,
      },
    };
  } catch (error) {
    console.error("Error fetching merchant dashboard stats:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

