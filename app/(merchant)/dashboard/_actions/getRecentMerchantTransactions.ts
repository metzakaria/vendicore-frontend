"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client"; // Import Prisma client types

interface GetRecentMerchantTransactionsParams {
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const getRecentMerchantTransactions = async (params: GetRecentMerchantTransactionsParams = {}) => {
  const limit = params.limit || 10;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        transactions: [],
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);

    const where: Prisma.vas_transactionsWhereInput = {
      merchant_id: merchantId,
    };

    // Add date range filter if provided
    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.created_at = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.vas_transactions.findMany({
      where,
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
      },
    });

    // Define the type for tx based on the Prisma query result
    type TransactionWithProduct = Prisma.vas_transactionsGetPayload<{
      include: {
        vas_products: {
          select: {
            product_name: true;
            product_code: true;
          };
        };
      };
    }>;

    // Serialize BigInt values
    const serializedTransactions = transactions.map((tx: TransactionWithProduct) => ({
      ...tx,
      id: tx.id.toString(),
      merchant_id: tx.merchant_id.toString(),
      product_id: tx.product_id.toString(),
      amount: tx.amount.toString(),
      discount_amount: tx.discount_amount.toString(),
      balance_before: tx.balance_before.toString(),
      balance_after: tx.balance_after.toString(),
    }));

    return {
      transactions: serializedTransactions,
    };
  } catch (error) {
    console.error("Error fetching recent merchant transactions:", error);
    return {
      transactions: [],
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

