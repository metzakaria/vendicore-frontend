"use server";

import prisma from "@/lib/prisma";

interface RevenueReportParams {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

export const getRevenueReport = async (params: RevenueReportParams = {}) => {
  try {
    const where: any = {};

    // Date range filter
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

    // Only successful transactions
    where.status = "success";

    // Get transaction summary
    const [transactionSummary, productSummary, merchantSummary] = await Promise.all([
      prisma.vas_transactions.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          amount: true,
        },
      }),
      prisma.vas_transactions.groupBy({
        by: ["product_id"],
        where,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.vas_transactions.groupBy({
        by: ["merchant_id"],
        where,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Get product and merchant details
    const productIds = productSummary.map((p) => p.product_id);
    const merchantIds = merchantSummary.map((m) => m.merchant_id);

    const [products, merchants] = await Promise.all([
      prisma.vas_products.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          product_name: true,
          product_code: true,
        },
      }),
      prisma.vas_merchants.findMany({
        where: {
          id: { in: merchantIds },
        },
        select: {
          id: true,
          merchant_code: true,
          business_name: true,
        },
      }),
    ]);

    // Combine product stats with details
    const productRevenue = productSummary.map((stat) => {
      const product = products.find((p) => p.id === stat.product_id);
      return {
        product_id: stat.product_id.toString(),
        product_name: product?.product_name || "N/A",
        product_code: product?.product_code || "N/A",
        total_amount: stat._sum.amount?.toString() || "0",
        transaction_count: stat._count.id,
      };
    });

    // Combine merchant stats with details
    const merchantRevenue = merchantSummary.map((stat) => {
      const merchant = merchants.find((m) => m.id === stat.merchant_id);
      return {
        merchant_id: stat.merchant_id.toString(),
        merchant_code: merchant?.merchant_code || "N/A",
        business_name: merchant?.business_name || "N/A",
        total_amount: stat._sum.amount?.toString() || "0",
        transaction_count: stat._count.id,
      };
    });

    return {
      summary: {
        totalRevenue: transactionSummary._sum.amount?.toString() || "0",
        totalTransactions: transactionSummary._count.id,
        averageTransaction: transactionSummary._avg.amount?.toString() || "0",
      },
      productRevenue: productRevenue.sort((a, b) => 
        Number(b.total_amount) - Number(a.total_amount)
      ),
      merchantRevenue: merchantRevenue.sort((a, b) => 
        Number(b.total_amount) - Number(a.total_amount)
      ),
    };
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    return {
      summary: {
        totalRevenue: "0",
        totalTransactions: 0,
        averageTransaction: "0",
      },
      productRevenue: [],
      merchantRevenue: [],
    };
  }
};

