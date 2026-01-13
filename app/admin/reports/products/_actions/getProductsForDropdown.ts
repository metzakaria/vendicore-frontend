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
        name: true,
        product_code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products.map((product) => ({
      ...product,
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
