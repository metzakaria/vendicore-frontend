"use server";

import prisma from "@/lib/prisma";

export const getDiscountById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid discount ID:", id);
      return null;
    }

    const discountId = BigInt(id);

    const discount = await prisma.vas_merchant_discount.findUnique({
      where: {
        id: discountId,
      },
      include: {
        vas_merchants: {
          select: {
            id: true,
            merchant_code: true,
            business_name: true,
          },
        },
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

    if (!discount) {
      return null;
    }

    // Serialize BigInt values to strings for JSON
    return {
      ...discount,
      id: discount.id.toString(),
      merchant_id: discount.merchant_id.toString(),
      product_id: discount.product_id.toString(),
      discount_value: discount.discount_value.toString(),
      vas_merchants: {
        ...discount.vas_merchants,
        id: discount.vas_merchants.id.toString(),
      },
      vas_products: {
        ...discount.vas_products,
        id: discount.vas_products.id.toString(),
      },
    };
  } catch (error) {
    console.error("Error fetching discount:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

