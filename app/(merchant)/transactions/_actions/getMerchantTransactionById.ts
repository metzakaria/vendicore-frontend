"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getMerchantTransactionById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return null;
    }

    const merchantId = BigInt(session.user.merchantId);
    const transactionId = BigInt(id);

    const transaction = await prisma.vas_transactions.findFirst({
      where: {
        id: transactionId,
        merchant_id: merchantId, // Ensure merchant can only access their own transactions
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
            description: true,
          },
        },
        vas_provider_accounts: {
          select: {
            account_name: true,
          },
        },
        vas_product_categories: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return null;
    }

    // Serialize BigInt values
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
    };
  } catch (error) {
    console.error("Error fetching merchant transaction:", error);
    return null;
  }
};

