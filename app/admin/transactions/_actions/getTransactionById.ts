"use server";

import prisma from "@/lib/prisma";

export const getTransactionById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid transaction ID:", id);
      return null;
    }

    const transactionId = BigInt(id);

    const transaction = await prisma.vas_transactions.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        vas_merchants: {
          select: {
            id: true,
            merchant_code: true,
            business_name: true,
            current_balance: true,
          },
        },
        vas_products: {
          select: {
            id: true,
            product_name: true,
            product_code: true,
            vas_product_categories: {
              select: {
                name: true,
                category_code: true,
              },
            },
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
                id: true,
                name: true,
                provider_code: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return null;
    }

    // Serialize BigInt and Decimal values to strings for JSON
    return {
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
        current_balance: transaction.vas_merchants.current_balance.toString(),
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
            vas_providers: {
              ...transaction.vas_provider_accounts.vas_providers,
              id: transaction.vas_provider_accounts.vas_providers.id.toString(),
            },
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

