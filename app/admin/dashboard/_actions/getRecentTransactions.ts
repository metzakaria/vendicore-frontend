"use server";

import prisma from "@/lib/prisma";

export const getRecentTransactions = async () => {
  try {
    const transactions = await prisma.vas_transactions.findMany({
      take: 10,
      orderBy: {
        created_at: 'desc',
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

    // Serialize Decimal objects to strings
    const serializedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: transaction.amount.toString(),
      discount_amount: transaction.discount_amount.toString(),
      balance_before: transaction.balance_before.toString(),
      balance_after: transaction.balance_after.toString(),
      // Ensure created_at and updated_at are also serialized to string if they are Date objects
      created_at: transaction.created_at?.toISOString() || null,
      updated_at: transaction.updated_at?.toISOString() || null,
    }));
    
    return serializedTransactions;
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
};