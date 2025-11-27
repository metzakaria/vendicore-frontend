"use server";

import prisma from "@/lib/prisma";

export const getProductsForMerchant = async ( ) => {
  try {
    console.log("Fetching products for merchant:");
    
    // Return all active products (merchant-specific filtering can be added later if needed)
    const products = await prisma.vas_products.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        product_name: true,
        product_code: true,
        vas_product_categories: {
          select: {
            id: true,
            name: true,
            category_code: true,
          },
        },
      },
      orderBy: {
        product_name: "asc",
      },
    });

    console.log(`Found ${products.length} products`);

    // Serialize BigInt values to strings for JSON
    const serialized = products.map((product) => ({
      ...product,
      id: product.id.toString(),
      vas_product_categories: {
        ...product.vas_product_categories,
        id: product.vas_product_categories.id.toString(),
      },
    }));

    return serialized;
  } catch (error) {
    console.error("Error fetching products:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
};

