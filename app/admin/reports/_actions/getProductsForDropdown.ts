"use server";

import prisma from "@/lib/prisma";

export const getProductsForDropdown = async () => {
  try {
    const products = await prisma.vas_products.findMany({
      where: {
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

