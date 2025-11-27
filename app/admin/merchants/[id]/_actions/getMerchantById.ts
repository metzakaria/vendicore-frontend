"use server";

import prisma from "@/lib/prisma";

export const getMerchantById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid merchant ID:", id);
      return null;
    }

    const merchantId = BigInt(id);
    console.log("Fetching merchant with ID:", merchantId.toString());

    const merchant = await prisma.vas_merchants.findUnique({
      where: {
        id: merchantId,
      },
      include: {
        vas_users: {
          select: {
            id: true,
            email: true,
            username: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            is_active: true,
            date_joined: true,
          },
        },
        _count: {
          select: {
            vas_transactions: true,
          },
        },
      },
    });

    if (!merchant) {
      return null;
    }

    // Get recent transactions count
    const recentTransactions = await prisma.vas_transactions.count({
      where: {
        merchant_id: merchant.id,
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Get total transaction volume
    const totalVolume = await prisma.vas_transactions.aggregate({
      where: {
        merchant_id: merchant.id,
        status: "success",
      },
      _sum: {
        amount: true,
      },
    });

    // Serialize BigInt values to strings for JSON
    return {
      ...merchant,
      id: merchant.id.toString(),
      user_id: merchant.user_id?.toString() || null,
      current_balance: merchant.current_balance.toString(),
      balance_before: merchant.balance_before.toString(),
      recentTransactionsCount: recentTransactions,
      totalVolume: totalVolume._sum.amount?.toString() || "0",
    };
  } catch (error) {
    console.error("Error fetching merchant:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

