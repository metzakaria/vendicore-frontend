"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const approveFunding = async (fundingRef: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = BigInt(session.user.id);

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
        error: "Funding request is already approved",
      };
    }

    // Update funding request to approved
    await prisma.vas_merchant_funding.update({
      where: {
        funding_ref: fundingRef,
      },
      data: {
        is_approved: true,
        approved_by: userId,
        approved_at: new Date(),
      },
    });

    // If not yet credited, credit the merchant's account
    if (!funding.is_credited) {
      const newBalance = Number(funding.vas_merchants.current_balance) + Number(funding.amount);

      await prisma.vas_merchants.update({
        where: {
          id: funding.merchant_id,
        },
        data: {
          current_balance: newBalance,
          last_updated_balance_at: new Date(),
        },
      });

      // Mark as credited
      await prisma.vas_merchant_funding.update({
        where: {
          funding_ref: fundingRef,
        },
        data: {
          is_credited: true,
        },
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error approving funding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

