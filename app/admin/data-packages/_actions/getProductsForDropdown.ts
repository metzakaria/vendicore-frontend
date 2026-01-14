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
        vas_product_categories: { // Include the related category
          select: {
            name: true, // Select the category name
          },
        },
      },
      orderBy: {
        product_name: "asc",
      },
    });

    // Serialize BigInt values to strings for JSON
    const filteredProducts = products.filter(product => {
      const categoryName = product.vas_product_categories?.name?.toLowerCase();
      const productName = product.product_name.toLowerCase();
      return (categoryName && categoryName.includes("data")) || productName.includes("data");
    });

    return filteredProducts.map((product) => ({
      ...product,
      id: product.id.toString(),
      // Remove vas_product_categories reconstruction as it's not needed for dropdown
      // The original product object already contains what's needed for display
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

