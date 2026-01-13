"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const generateApiKey = () => {
  return crypto.randomBytes(24).toString("hex");
};

const generateApiSecret = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const resetApiKeys = async (merchantId: string) => {
  try {
    const newApiKey = generateApiKey();
    const newApiSecret = generateApiSecret();

    await prisma.vas_merchants.update({
      where: {
        id: BigInt(merchantId),
      },
      data: {
        api_key: newApiKey,
        api_secret: newApiSecret,
        api_key_updated_at: new Date(),
        api_secret_updated_at: new Date(),
      },
    });

    revalidatePath(`/admin/merchants/${merchantId}`);

    return {
      success: true,
      apiKey: newApiKey,
      apiSecret: newApiSecret,
    };
  } catch (error) {
    console.error("Error resetting API keys:", error);
    return {
      success: false,
      error: "Failed to reset API keys. Please try again.",
    };
  }
};
