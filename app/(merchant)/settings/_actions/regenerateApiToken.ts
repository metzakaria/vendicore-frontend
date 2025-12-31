"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";

// Generate secure API token
const generateApiToken = (): string => {
  const token = randomBytes(32);
  return token.toString("base64url");
};

// Generate secure API secret key
const generateApiSecretKey = (): string => {
  const secret = randomBytes(32);
  return secret.toString("base64url");
};

export const regenerateApiToken = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);

    // Generate new API credentials
    const apiToken = generateApiToken();
    const apiSecretKey = generateApiSecretKey();
    const apiTokenCreated = new Date();
    const apiTokenExpire = new Date();
    apiTokenExpire.setFullYear(apiTokenExpire.getFullYear() + 1);

    // Update merchant with new credentials
    await prisma.vas_merchants.update({
      where: { id: merchantId },
      data: {
        api_key: apiToken,
        api_secret: apiSecretKey,
        api_key_updated_at: apiTokenCreated,
        api_secret_updated_at: apiTokenExpire,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      api_key: apiToken,
      api_secret: apiSecretKey,
      api_key_updated_at: apiTokenCreated,
      api_secret_updated_at: apiTokenExpire,
    };
  } catch (error) {
    console.error("Error regenerating API token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

