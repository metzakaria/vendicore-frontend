"use server";

import prisma from "@/lib/prisma";

export const getMerchantProducts = async () => {
  try {
    const products = await prisma.vas_products.findMany({
      where: {
        is_active: true,
      },
      include: {
        vas_product_categories: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        product_name: "asc",
      },
    });

    // Serialize BigInt to string
    return products.map((product: any) => ({
      ...product,
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};