"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getProductsForDropdown = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return [];
    }

    // Get products that have discounts for this merchant
    const merchantId = BigInt(session.user.merchantId);
    
    const discounts = await prisma.vas_merchant_discount.findMany({
      where: {
        merchant_id: merchantId,
      },
      select: {
        product_id: true,
      },
      distinct: ["product_id"],
    });

    const productIds = discounts.map((d) => d.product_id);

    if (productIds.length === 0) {
      return [];
    }

    const products = await prisma.vas_products.findMany({
      where: {
        id: { in: productIds },
        is_active: true,
      },
      select: {
        id: true,
        product_name: true,
        product_code: true,
      },
      orderBy: {
        product_name: "asc",
      },
    });

    return products.map((product) => ({
      id: product.id.toString(),
      product_name: product.product_name,
      product_code: product.product_code,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

