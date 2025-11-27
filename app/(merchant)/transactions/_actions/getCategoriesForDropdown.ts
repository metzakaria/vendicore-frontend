"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getCategoriesForDropdown = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return [];
    }

    // Get all active categories
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

    return categories.map((category) => ({
      id: category.id.toString(),
      name: category.name,
      category_code: category.category_code,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

