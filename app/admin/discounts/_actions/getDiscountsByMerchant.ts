"use server";

import prisma from "@/lib/prisma";

export const getDiscountsByMerchant = async (merchantId: string) => {
  console.log("=======Fetching discounts by merchant:", merchantId);
  try {
    if (!merchantId || merchantId === "all") {
      return {};
    }

    const discounts = await prisma.vas_merchant_discount.findMany({
      where: {
        merchant_id: BigInt(merchantId),
      },
      select: {
        id: true,
        product_id: true,
        discount_type: true,
        discount_value: true,
        is_active: true,
      },
    });

    // Create an object map of product_id -> discount for JSON serialization
    const discountMap: Record<string, any> = {};
    discounts.forEach((discount) => {
      discountMap[discount.product_id.toString()] = {
        id: discount.id.toString(),
        discount_type: discount.discount_type,
        discount_value: discount.discount_value.toString(),
        is_active: discount.is_active,
      };
    });

    return discountMap;
  } catch (error) {
    console.error("Error fetching discounts by merchant:", error);
    return {};
  }
};

