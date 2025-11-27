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
        api_token: true,
        api_secret_key: true,
        api_token_created: true,
        api_token_expire: true,
        api_access_ip: true,
      },
    });

    if (!merchant) {
      return {
        error: "Merchant not found",
      };
    }

    return {
      api_token: merchant.api_token || null,
      api_secret_key: merchant.api_secret_key || null,
      api_token_created: merchant.api_token_created,
      api_token_expire: merchant.api_token_expire,
      api_access_ip: merchant.api_access_ip || null,
    };
  } catch (error) {
    console.error("Error fetching API credentials:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

