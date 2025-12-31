"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getMerchantApiCredentials = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);

    const merchant = await prisma.vas_merchants.findUnique({
      where: { id: merchantId },
      select: {
        api_key: true,
        api_secret: true,
        api_key_updated_at: true,
        api_secret_updated_at: true,
        api_access_ips: true,
      },
    });

    if (!merchant) {
      return {
        error: "Merchant not found",
      };
    }

    return {
      api_key: merchant.api_key || null,
      api_secret: merchant.api_secret || null,
      api_key_updated_at: merchant.api_key_updated_at,
      api_secret_updated_at: merchant.api_secret_updated_at,
      api_access_ips: merchant.api_access_ips || null,
    };
  } catch (error) {
    console.error("Error fetching API credentials:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

