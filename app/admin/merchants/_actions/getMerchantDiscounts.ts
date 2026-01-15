"use server";

import prisma from "@/lib/prisma";

interface GetMerchantDiscountsParams {
  merchant_id?: string;
  page?: number;
  limit?: number;
  product_id?: string;
  discount_type?: string;
}

export const getMerchantDiscounts = async (params: GetMerchantDiscountsParams) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by merchant_id if provided
    if (params.merchant_id) {
      where.merchant_id = BigInt(params.merchant_id);
    }

    // Filter by product_id if provided
    if (params.product_id) {
      where.product_id = BigInt(params.product_id);
    }

    // Filter by discount_type if provided
    if (params.discount_type) {
      where.discount_type = params.discount_type;
    }

    console.log("Fetching merchant discounts with where:", where);

    const [discounts, total] = await Promise.all([
      prisma.vas_merchant_discount.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_products: {
            select: {
              product_name: true,
              product_code: true,
            },
          },
        },
      }),
      prisma.vas_merchant_discount.count({ where }),
    ]);

    // Serialize BigInt values
    const serializedDiscounts = discounts.map((discount: any) => ({
      ...discount,
      id: discount.id.toString(),
      merchant_id: discount.merchant_id.toString(),
      product_id: discount.product_id.toString(),
      discount_value: discount.discount_value.toString(),
      created_at: discount.created_at,
      updated_at: discount.updated_at,
    }));

    return {
      discounts: serializedDiscounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error in getMerchantDiscounts:", error);
    return {
      discounts: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};