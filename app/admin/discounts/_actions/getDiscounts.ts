"use server";

import prisma from "@/lib/prisma";

interface GetDiscountsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
  discount_type?: "percentage" | "flat" | "all";
  merchant_id?: string;
  product_id?: string;
}

export const getDiscounts = async (params: GetDiscountsParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const merchantId = params.merchant_id;

    const where: any = {};

    if (merchantId && merchantId !== "all") {
      where.merchant_id = BigInt(merchantId);
    }
 // <-- Added log

    const [discounts, total] = await Promise.all([
      prisma.vas_merchant_discount.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
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
            },
          },
          vas_users_vas_merchant_discount_updated_byTovas_users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.vas_merchant_discount.count({ where }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serializedDiscounts = discounts.map((discount: any) => ({
      ...discount,
      id: discount.id.toString(),
      merchant_id: discount.merchant_id.toString(),
      product_id: discount.product_id.toString(),
      updated_by: discount.updated_by?.toString() || null,
      vas_merchants: {
        ...discount.vas_merchants,
        id: discount.vas_merchants.id.toString(),
      },
      vas_products: {
        ...discount.vas_products,
        id: discount.vas_products.id.toString(),
      },
      vas_users_vas_merchant_discount_updated_byTovas_users: discount.vas_users_vas_merchant_discount_updated_byTovas_users ? {
        ...discount.vas_users_vas_merchant_discount_updated_byTovas_users,
        id: discount.vas_users_vas_merchant_discount_updated_byTovas_users.id.toString(),
      } : null,
    }));

    return {
      discounts: serializedDiscounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return {
      discounts: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

