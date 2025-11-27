"use server";

import prisma from "@/lib/prisma";

interface SummaryReportParams {
  startDate?: string;
  endDate?: string;
}

export const getSummaryReport = async (params: SummaryReportParams = {}) => {
  try {
    const where: any = {};

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

    const [
      transactionStats,
      transactionStatusBreakdown,
      fundingStats,
      merchantCount,
      productCount,
    ] = await Promise.all([
      // Transaction statistics
      prisma.vas_transactions.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Transaction status breakdown
      prisma.vas_transactions.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      // Funding statistics
      prisma.vas_merchant_funding.aggregate({
        where: params.startDate || params.endDate ? {
          created_at: where.created_at,
        } : {},
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Merchant count
      prisma.vas_merchants.count({
        where: {
          is_active: true,
        },
      }),
      // Product count
      prisma.vas_products.count({
        where: {
          is_active: true,
        },
      }),
    ]);

    // Calculate success rate
    const failedCount = transactionStats._count > 0
      ? (transactionStatusBreakdown.find((s) => s.status === "failed")?._count || 0)
      : 0;
    const successCount = transactionStats._count - failedCount;
    const successRate = transactionStats._count > 0
      ? ((successCount / transactionStats._count) * 100).toFixed(2)
      : "0";

    return {
      transactions: {
        total: transactionStats._count,
        totalAmount: transactionStats._sum.amount?.toString() || "0",
        successRate: `${successRate}%`,
        statusBreakdown: transactionStatusBreakdown.map((stat) => ({
          status: stat.status,
          count: stat._count,
        })),
      },
      funding: {
        total: fundingStats._count,
        totalAmount: fundingStats._sum.amount?.toString() || "0",
      },
      merchants: {
        active: merchantCount,
      },
      products: {
        active: productCount,
      },
    };
  } catch (error) {
    console.error("Error fetching summary report:", error);
    return {
      transactions: {
        total: 0,
        totalAmount: "0",
        successRate: "0%",
        statusBreakdown: [],
      },
      funding: {
        total: 0,
        totalAmount: "0",
      },
      merchants: {
        active: 0,
      },
      products: {
        active: 0,
      },
    };
  }
};

