"use server";

import prisma from "@/lib/prisma";

interface TransactionReportParams {
  startDate?: string;
  endDate?: string;
  merchantId?: string;
  productId?: string;
  status?: string;
  amount?: string;
  page?: number;
  limit?: number;
}

export const getTransactionReport = async (params: TransactionReportParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

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

    // Merchant filter
    if (params.merchantId) {
      where.merchant_id = BigInt(params.merchantId);
    }

    // Product filter
    if (params.productId) {
      where.product_id = BigInt(params.productId);
    }

    // Status filter
    if (params.status && params.status !== "all") {
      where.status = params.status;
    }

    // Amount filter (exact match)
    if (params.amount && params.amount.trim() !== "") {
      const amountValue = parseFloat(params.amount);
      if (!isNaN(amountValue)) {
        where.amount = amountValue;
      }
    }

    const [transactions, total, summary] = await Promise.all([
      prisma.vas_transactions.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_merchants: {
            select: {
              merchant_code: true,
              business_name: true,
            },
          },
          vas_products: {
            select: {
              product_name: true,
              product_code: true,
            },
          },
          vas_provider_accounts: {
            select: {
              account_name: true,
            },
          },
        },
      }),
      prisma.vas_transactions.count({ where }),
      prisma.vas_transactions.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    // Serialize BigInt and Decimal values
    const serializedTransactions = transactions.map((tx: any) => ({
      ...tx,
      id: tx.id.toString(),
      merchant_id: tx.merchant_id.toString(),
      product_id: tx.product_id.toString(),
      product_category_id: tx.product_category_id?.toString() || null,
      provider_account_id: tx.provider_account_id?.toString() || null,
      amount: tx.amount.toString(),
      discount_amount: tx.discount_amount.toString(),
      balance_before: tx.balance_before.toString(),
      balance_after: tx.balance_after.toString(),
    }));

    return {
      transactions: serializedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalAmount: summary._sum.amount?.toString() || "0",
        totalCount: summary._count,
      },
    };
  } catch (error) {
    console.error("Error fetching transaction report:", error);
    return {
      transactions: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
      summary: {
        totalAmount: "0",
        totalCount: 0,
      },
    };
  }
};

