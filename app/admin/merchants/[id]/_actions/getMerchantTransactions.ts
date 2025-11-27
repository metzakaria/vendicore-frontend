"use server";

import prisma from "@/lib/prisma";

interface GetMerchantTransactionsParams {
  merchantId: string;
  page?: number;
  limit?: number;
  status?: string;
}

export const getMerchantTransactions = async (
  params: GetMerchantTransactionsParams
) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      merchant_id: BigInt(params.merchantId),
    };

    if (params.status && params.status !== "all") {
      where.status = params.status;
    }

    const [transactions, total] = await Promise.all([
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
              name: true,
              product_code: true,
            },
          },
        },
      }),
      prisma.vas_transactions.count({ where }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serializedTransactions = transactions.map((transaction: any) => ({
      ...transaction,
      id: transaction.id.toString(),
      merchant_id: transaction.merchant_id.toString(),
      product_id: transaction.product_id?.toString() || null,
      provider_account_id: transaction.provider_account_id?.toString() || null,
      amount: transaction.amount.toString(),
    }));

    return {
      transactions: serializedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching merchant transactions:", error);
    return {
      transactions: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

