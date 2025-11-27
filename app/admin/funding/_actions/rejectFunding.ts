"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const rejectFunding = async (fundingRef: string) => {
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
        error: "Cannot reject an already approved funding request",
      };
    }

    // Mark as rejected (we'll use is_active = false to indicate rejection)
    await prisma.vas_merchant_funding.update({
      where: {
        funding_ref: fundingRef,
      },
      data: {
        is_active: false,
        approved_by: userId,
        approved_at: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error rejecting funding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

