"use server";

import prisma from "@/lib/prisma";

export const getUserById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid user ID:", id);
      return null;
    }

    const userId = BigInt(id);

    const user = await prisma.vas_users.findUnique({
      where: {
        id: userId,
      },
      include: {
        vas_merchants: {
          select: {
            id: true,
            merchant_code: true,
            business_name: true,
            current_balance: true,
            is_active: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Serialize BigInt values to strings for JSON
    return {
      ...user,
      id: user.id.toString(),
      vas_merchants: user.vas_merchants
        ? {
            ...user.vas_merchants,
            id: user.vas_merchants.id.toString(),
            current_balance: user.vas_merchants.current_balance.toString(),
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

