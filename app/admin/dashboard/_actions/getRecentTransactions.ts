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
    
    return transactions;
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
};