"use server";

import prisma from "@/lib/prisma";

export const getMerchantsForDropdown = async () => {
  try {
    const merchants = await prisma.vas_merchants.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        merchant_code: true,
        business_name: true,
      },
      orderBy: {
        business_name: "asc",
      },
    });

    // Serialize BigInt values to strings for JSON
    return merchants.map((merchant) => ({
      ...merchant,
      id: merchant.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return [];
  }
};

