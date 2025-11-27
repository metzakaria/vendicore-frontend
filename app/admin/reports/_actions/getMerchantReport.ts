"use server";

import prisma from "@/lib/prisma";

interface MerchantReportParams {
  startDate?: string;
  endDate?: string;
  merchantId?: string;
}

export const getMerchantReport = async (params: MerchantReportParams = {}) => {
  try {
    const where: any = {};

    if (params.merchantId) {
      where.merchant_id = BigInt(params.merchantId);
    }

    if (params.startDate || params.endDate) {
      where.created_at = {};
      if (params.startDate) {
        where.created_at.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const endDate = new Date(params.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.created_at.lte = endDate;
      }
    }

    // Get merchant transaction statistics
    const merchantStats = await prisma.vas_transactions.groupBy({
      by: ["merchant_id"],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get merchant details
    const merchantIds = merchantStats.map((stat) => stat.merchant_id);
    const merchants = await prisma.vas_merchants.findMany({
      where: {
        id: {
          in: merchantIds,
        },
      },
      include: {
        vas_users: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });

    // Combine stats with merchant details
    const reportData = merchantStats.map((stat) => {
      const merchant = merchants.find((m) => m.id === stat.merchant_id);
      return {
        merchant_id: stat.merchant_id.toString(),
        merchant_code: merchant?.merchant_code || "N/A",
        business_name: merchant?.business_name || "N/A",
        email: merchant?.vas_users?.email || "N/A",
        total_transactions: stat._count.id,
        total_amount: stat._sum.amount?.toString() || "0",
        current_balance: merchant?.current_balance.toString() || "0",
        is_active: merchant?.is_active || false,
      };
    });

    // Calculate totals
    const totals = merchantStats.reduce(
      (acc, stat) => ({
        totalTransactions: acc.totalTransactions + stat._count.id,
        totalAmount: (acc.totalAmount + Number(stat._sum.amount || 0)).toString(),
      }),
      { totalTransactions: 0, totalAmount: "0" }
    );

    return {
      merchants: reportData,
      totals,
    };
  } catch (error) {
    console.error("Error fetching merchant report:", error);
    return {
      merchants: [],
      totals: {
        totalTransactions: 0,
        totalAmount: "0",
      },
    };
  }
};

