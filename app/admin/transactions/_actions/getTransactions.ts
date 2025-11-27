"use server";

import prisma from "@/lib/prisma";

interface GetTransactionsParams {
  page?: number;
  limit?: number;
  referenceNo?: string;
  beneficiary?: string;
  amount?: string;
  status?: string;
  merchant_id?: string;
  product_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

export const getTransactions = async (params: GetTransactionsParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const referenceNo = params.referenceNo;
    const beneficiary = params.beneficiary;
    const amount = params.amount;
    const status = params.status;
    const merchantId = params.merchant_id;
    const productId = params.product_id;
    const categoryId = params.category_id;
    const dateFrom = params.date_from;
    const dateTo = params.date_to;

    const where: any = {};

    // Reference number search (merchant_ref or provider_ref)
    if (referenceNo) {
      where.OR = [
        { merchant_ref: { contains: referenceNo, mode: "insensitive" } },
        { provider_ref: { contains: referenceNo, mode: "insensitive" } },
      ];
    }

    // Beneficiary search
    if (beneficiary) {
      where.beneficiary_account = { contains: beneficiary, mode: "insensitive" };
    }

    // Amount filter
    if (amount) {
      where.amount = parseFloat(amount);
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (merchantId && merchantId !== "all") {
      where.merchant_id = BigInt(merchantId);
    }

    if (productId && productId !== "all") {
      where.product_id = BigInt(productId);
    }

    if (categoryId && categoryId !== "all") {
      where.product_category_id = BigInt(categoryId);
    }

    if (dateFrom) {
      const startDate = new Date(dateFrom);
      startDate.setHours(0, 0, 0, 0);
      where.created_at = {
        ...where.created_at,
        gte: startDate,
      };
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.created_at = {
        ...where.created_at,
        lte: endDate,
      };
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
          vas_merchants: {
            select: {
              id: true,
              merchant_code: true,
              business_name: true,
            },
          },
          vas_products: {
            select: {
              id: true,
              product_name: true,
              product_code: true,
            },
          },
          vas_product_categories: {
            select: {
              id: true,
              name: true,
              category_code: true,
            },
          },
          vas_provider_accounts: {
            select: {
              id: true,
              account_name: true,
              vas_providers: {
                select: {
                  name: true,
                  provider_code: true,
                },
              },
            },
          },
        },
      }),
      prisma.vas_transactions.count({ where }),
    ]);

    // Serialize BigInt and Decimal values to strings for JSON
    const serializedTransactions = transactions.map((transaction: any) => ({
      ...transaction,
      id: transaction.id.toString(),
      merchant_id: transaction.merchant_id.toString(),
      product_id: transaction.product_id.toString(),
      product_category_id: transaction.product_category_id.toString(),
      provider_account_id: transaction.provider_account_id?.toString() || null,
      amount: transaction.amount.toString(),
      discount_amount: transaction.discount_amount.toString(),
      balance_before: transaction.balance_before.toString(),
      balance_after: transaction.balance_after.toString(),
      vas_merchants: {
        ...transaction.vas_merchants,
        id: transaction.vas_merchants.id.toString(),
      },
      vas_products: {
        ...transaction.vas_products,
        id: transaction.vas_products.id.toString(),
      },
      vas_product_categories: {
        ...transaction.vas_product_categories,
        id: transaction.vas_product_categories.id.toString(),
      },
      vas_provider_accounts: transaction.vas_provider_accounts
        ? {
            ...transaction.vas_provider_accounts,
            id: transaction.vas_provider_accounts.id.toString(),
          }
        : null,
    }));

    return {
      transactions: serializedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      transactions: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

