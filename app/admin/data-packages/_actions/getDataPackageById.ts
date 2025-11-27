"use server";

import prisma from "@/lib/prisma";

export const getDataPackageById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid data package ID:", id);
      return null;
    }

    const packageId = BigInt(id);

    const dataPackage = await prisma.vas_data_packages.findUnique({
      where: {
        id: packageId,
      },
      include: {
        vas_products: {
          select: {
            id: true,
            product_name: true,
            product_code: true,
            vas_product_categories: {
              select: {
                name: true,
                category_code: true,
              },
            },
          },
        },
      },
    });

    if (!dataPackage) {
      return null;
    }

    // Serialize BigInt values to strings for JSON
    return {
      ...dataPackage,
      id: dataPackage.id.toString(),
      product_id: dataPackage.product_id.toString(),
      amount: dataPackage.amount.toString(),
      vas_products: {
        ...dataPackage.vas_products,
        id: dataPackage.vas_products.id.toString(),
      },
    };
  } catch (error) {
    console.error("Error fetching data package:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

