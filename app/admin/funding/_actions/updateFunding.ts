"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const updateFunding = async (
  fundingRef: string,
  data: { amount: string; description: string; source: string }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: "Invalid amount. Amount must be a positive number",
      };
    }

    const funding = await prisma.vas_merchant_funding.findUnique({
      where: {
        funding_ref: fundingRef,
      },
    });

    if (!funding) {
      return {
        success: false,
        error: "Funding request not found",
      };
    }

    // Calculate new balance after
    const newBalanceAfter = Number(funding.balance_before) + amount;

    // Update funding request
    const updatedFunding = await prisma.vas_merchant_funding.update({
      where: {
        funding_ref: fundingRef,
      },
      data: {
        amount: amount,
        description: data.description,
        source: data.source,
        balance_after: newBalanceAfter,
      },
    });

    return {
      success: true,
      funding: {
        ...updatedFunding,
        amount: updatedFunding.amount.toString(),
        balance_before: updatedFunding.balance_before.toString(),
        balance_after: updatedFunding.balance_after.toString(),
      },
    };
  } catch (error) {
    console.error("Error updating funding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};
