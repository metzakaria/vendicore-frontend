"use server";

import prisma from "@/lib/prisma";

export const getMerchantLoginRecords = async (merchantId: string) => {
  try {
    const merchant = await prisma.vas_merchants.findUnique({
      where: {
        id: BigInt(merchantId),
      },
      select: {
        user_id: true,
      },
    });

    if (!merchant || !merchant.user_id) {
      return [];
    }

    const loginRecords = await prisma.django_admin_log.findMany({
      where: {
        user_id: merchant.user_id,
      },
      orderBy: {
        action_time: "desc",
      },
    });

    return loginRecords.map(record => ({
      ...record,
      id: record.id.toString(),
      user_id: record.user_id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching merchant login records:", error);
    return [];
  }
};
