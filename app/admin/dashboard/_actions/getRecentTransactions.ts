"use server";

import prisma from "@/lib/prisma";

export const getRecentTransactions = async () => {
  try {
    const transactions = await prisma.vas_transactions.findMany({
      take: 5,
      orderBy: {
        created_at: "desc",
      },
      include: {
        vas_merchants: {
          select: {
            business_name: true,
          },
        },
        vas_products: {
          select: {
            product_name: true,
          },
        },
      },
    });

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

    return serializedTransactions;
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
};

