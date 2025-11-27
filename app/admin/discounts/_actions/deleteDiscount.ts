"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const deleteDiscount = async (discountId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if discount exists
    const existingDiscount = await prisma.vas_merchant_discount.findUnique({
      where: {
        id: BigInt(discountId),
      },
    });

    if (!existingDiscount) {
      return {
        success: false,
        error: "Discount not found",
      };
    }

    // Delete discount
    await prisma.vas_merchant_discount.delete({
      where: {
        id: BigInt(discountId),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting discount:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

