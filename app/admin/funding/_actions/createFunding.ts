"use server";

import prisma from "@/lib/prisma";
import type { CreateFundingFormData } from "@/lib/validations/funding";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

export const createFunding = async (data: CreateFundingFormData) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = BigInt(session.user.id);
    const merchantId = BigInt(data.merchant_id);
    const amount = parseFloat(data.amount);

    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: "Invalid amount. Amount must be a positive number",
      };
    }

    // Get merchant current balance
    const merchant = await prisma.vas_merchants.findUnique({
      where: {
        id: merchantId,
      },
      select: {
        current_balance: true,
      },
    });

    if (!merchant) {
      return {
        success: false,
        error: "Merchant not found",
      };
    }

    const balanceBefore = Number(merchant.current_balance);
    const balanceAfter = balanceBefore + amount;
    const fundingRef = randomUUID();

    // Create funding request
    const funding = await prisma.vas_merchant_funding.create({
      data: {
        funding_ref: fundingRef,
        merchant_id: merchantId,
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: data.description,
        source: data.source,
        is_approved: false,
        is_credited: false,
        is_active: true,
        created_by: userId,
        created_at: new Date(),
      },
    });

    // Serialize BigInt and Decimal values to strings for JSON
    return {
      success: true,
      funding: {
        ...funding,
        funding_ref: funding.funding_ref,
        merchant_id: funding.merchant_id.toString(),
        created_by: funding.created_by.toString(),
        amount: funding.amount.toString(),
        balance_before: funding.balance_before.toString(),
        balance_after: funding.balance_after.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating funding request:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

