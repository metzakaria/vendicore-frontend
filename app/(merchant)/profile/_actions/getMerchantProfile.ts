"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getMerchantProfile = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);
    const userId = BigInt(session.user.id);

    // Get merchant with user details
    const merchant = await prisma.vas_merchants.findUnique({
      where: { id: merchantId },
      include: {
        vas_users: {
          select: {
            id: true,
            email: true,
            username: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            date_joined: true,
            last_login: true,
          },
        },
      },
    });

    if (!merchant) {
      return {
        error: "Merchant not found",
      };
    }

    // Serialize BigInt values
    return {
      merchant: {
        id: merchant.id.toString(),
        merchant_code: merchant.merchant_code,
        business_name: merchant.business_name,
        business_description: merchant.business_description,
        address: merchant.address,
        city: merchant.city,
        state: merchant.state,
        country: merchant.country,
        website: merchant.website,
        current_balance: merchant.current_balance.toString(),
        account_type: merchant.account_type,
        daily_tranx_limit: merchant.daily_tranx_limit,
        api_access_ip: merchant.api_access_ips,
        is_active: merchant.is_active,
        created_at: merchant.created_at,
        updated_at: merchant.updated_at,
        user: {
          id: merchant.vas_users?.id.toString() || "",
          email: merchant.vas_users?.email || "",
          username: merchant.vas_users?.username || "",
          first_name: merchant.vas_users?.first_name || "",
          last_name: merchant.vas_users?.last_name || "",
          phone_number: merchant.vas_users?.phone_number || "",
          date_joined: merchant.vas_users?.date_joined,
          last_login: merchant.vas_users?.last_login,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching merchant profile:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

