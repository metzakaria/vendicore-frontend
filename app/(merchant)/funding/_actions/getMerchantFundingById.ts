"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getMerchantFundingById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return null;
    }

    const merchantId = BigInt(session.user.merchantId);

    const funding = await prisma.vas_merchant_funding.findFirst({
      where: {
        funding_ref: id,
        merchant_id: merchantId, // Ensure merchant can only access their own funding
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
        vas_users_vas_merchant_funding_created_byTovas_users: {
          select: {
            username: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        vas_users_vas_merchant_funding_approved_byTovas_users: {
          select: {
            username: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!funding) {
      return null;
    }

    // Serialize BigInt values
    return {
      ...funding,
      id: funding.funding_ref,
      merchant_id: funding.merchant_id.toString(),
      created_by: funding.created_by?.toString() || null,
      approved_by: funding.approved_by?.toString() || null,
      amount: funding.amount.toString(),
      balance_before: funding.balance_before.toString(),
      balance_after: funding.balance_after.toString(),
      vas_merchants: funding.vas_merchants ? {
        ...funding.vas_merchants,
        id: funding.vas_merchants.id.toString(),
        current_balance: funding.vas_merchants.current_balance.toString(),
      } : null,
    };
  } catch (error) {
    console.error("Error fetching merchant funding:", error);
    return null;
  }
};

