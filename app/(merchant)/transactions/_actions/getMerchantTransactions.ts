"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GetMerchantTransactionsParams {
  page?: number;
  limit?: number;
  referenceNo?: string;
  beneficiary?: string;
  amount?: string;
  status?: "all" | "success" | "failed" | "pending";
  startDate?: string;
  endDate?: string;
  productId?: string;
  categoryId?: string;
}

export const getMerchantTransactions = async (params: GetMerchantTransactionsParams = {}) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        transactions: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    console.log("getMerchantTransactions called with:", {
      merchantId: session.user.merchantId,
      page,
      limit,
      params,
    });

    const where: any = {
      merchant_id: merchantId,
    };

    // Reference number filter
    if (params.referenceNo) {
      where.merchant_ref = { contains: params.referenceNo, mode: "insensitive" };
    }

    // Beneficiary filter
    if (params.beneficiary) {
      where.beneficiary_account = { contains: params.beneficiary, mode: "insensitive" };
    }

    // Amount filter - exact match
    if (params.amount) {
      const amountValue = parseFloat(params.amount);
      if (!isNaN(amountValue) && amountValue > 0) {
        where.amount = amountValue;
      }
    }

    // Status filter
    if (params.status && params.status !== "all") {
      where.status = params.status;
    }

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

    // Product filter
    if (params.productId) {
      where.product_id = BigInt(params.productId);
    }

    // Category filter
    if (params.categoryId) {
      where.product_category_id = BigInt(params.categoryId);
    }

    // Helper to serialize BigInt for logging
    const serializeBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'bigint') return obj.toString();
      if (Array.isArray(obj)) return obj.map(serializeBigInt);
      if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
          result[key] = serializeBigInt(obj[key]);
        }
        return result;
      }
      return obj;
    };

    console.log("getMerchantTransactions where clause:", JSON.stringify(serializeBigInt(where), null, 2));

    const [transactions, total, totalValue, successValue, failValue, pendingValue] = await Promise.all([
      prisma.vas_transactions.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
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
      // Total transaction value
      prisma.vas_transactions.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      // Success transaction value
      prisma.vas_transactions.aggregate({
        where: {
          ...where,
          status: "success",
        },
        _sum: {
          amount: true,
        },
      }),
      // Failed transaction value
      prisma.vas_transactions.aggregate({
        where: {
          ...where,
          status: "failed",
        },
        _sum: {
          amount: true,
        },
      }),
      // Pending transaction value
      prisma.vas_transactions.aggregate({
        where: {
          ...where,
          status: "pending",
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    console.log(`getMerchantTransactions found ${transactions.length} transactions (total: ${total})`);

    // Serialize BigInt values
    const serializedTransactions = transactions.map((tx: any) => ({
      ...tx,
      id: tx.id.toString(),
      merchant_id: tx.merchant_id.toString(),
      product_id: tx.product_id.toString(),
      provider_account_id: tx.provider_account_id?.toString() || null,
      amount: tx.amount.toString(),
      discount_amount: tx.discount_amount.toString(),
      balance_before: tx.balance_before.toString(),
      balance_after: tx.balance_after.toString(),
    }));

    const result = {
      transactions: serializedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        transactionCount: total,
        transactionValue: totalValue._sum?.amount?.toString() || "0",
        transactionSuccess: successValue._sum?.amount?.toString() || "0",
        transactionFail: failValue._sum?.amount?.toString() || "0",
        transactionPending: pendingValue._sum?.amount?.toString() || "0",
      },
    };

    console.log("getMerchantTransactions returning:", {
      transactionsCount: result.transactions.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });

    return result;
  } catch (error) {
    console.error("Error fetching merchant transactions:", error);
    return {
      transactions: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      stats: {
        transactionCount: 0,
        transactionValue: "0",
        transactionSuccess: "0",
        transactionFail: "0",
        transactionPending: "0",
      },
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

