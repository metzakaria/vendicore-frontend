"use server";

import prisma from "@/lib/prisma";

export const getCategoriesForDropdown = async () => {
  try {
    const categories = await prisma.vas_product_categories.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        category_code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Serialize BigInt values to strings for JSON
    return categories.map((category) => ({
      ...category,
      id: category.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

