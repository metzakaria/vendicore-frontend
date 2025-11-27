"use server";

import prisma from "@/lib/prisma";

export const getFundingRequestById = async (fundingRef: string) => {
  try {
    if (!fundingRef || fundingRef === "undefined" || fundingRef === "null") {
      console.error("Invalid funding reference:", fundingRef);
      return null;
    }

    const funding = await prisma.vas_merchant_funding.findUnique({
      where: {
        funding_ref: fundingRef,
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
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        vas_users_vas_merchant_funding_approved_byTovas_users: {
          select: {
            id: true,
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

    // Serialize BigInt and Decimal values to strings for JSON
    return {
      ...funding,
      merchant_id: funding.merchant_id.toString(),
      created_by: funding.created_by.toString(),
      approved_by: funding.approved_by?.toString() || null,
      amount: funding.amount.toString(),
      balance_before: funding.balance_before.toString(),
      balance_after: funding.balance_after.toString(),
      vas_merchants: {
        ...funding.vas_merchants,
        id: funding.vas_merchants.id.toString(),
        current_balance: funding.vas_merchants.current_balance.toString(),
      },
      vas_users_vas_merchant_funding_created_byTovas_users: {
        ...funding.vas_users_vas_merchant_funding_created_byTovas_users,
        id: funding.vas_users_vas_merchant_funding_created_byTovas_users.id.toString(),
      },
      vas_users_vas_merchant_funding_approved_byTovas_users: funding.vas_users_vas_merchant_funding_approved_byTovas_users
        ? {
            ...funding.vas_users_vas_merchant_funding_approved_byTovas_users,
            id: funding.vas_users_vas_merchant_funding_approved_byTovas_users.id.toString(),
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching funding request:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

