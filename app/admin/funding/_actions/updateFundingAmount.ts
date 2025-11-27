"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const updateFundingAmount = async (fundingRef: string, newAmount: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the funding request
    const funding = await prisma.vas_merchant_funding.findUnique({
      where: {
        funding_ref: fundingRef,
      },
      include: {
        vas_merchants: true,
      },
    });

    if (!funding) {
      return {
        success: false,
        error: "Funding request not found",
      };
    }

    if (funding.is_approved) {
      return {
        success: false,
        error: "Cannot update amount for approved funding requests",
      };
    }

    if (funding.is_credited) {
      return {
        success: false,
        error: "Cannot update amount for credited funding requests",
      };
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: "Invalid amount. Amount must be a positive number",
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
    console.error("Error updating funding amount:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

