"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GetMerchantDiscountsParams {
  page?: number;
  limit?: number;
  productId?: string;
  discountType?: "percentage" | "fixed";
}

export const getMerchantDiscounts = async (params: GetMerchantDiscountsParams = {}) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        discounts: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const productId = params.productId;
    const discountType = params.discountType;

    const where: any = {
      merchant_id: merchantId,
    };

    // Product filter
    if (productId) {
      where.product_id = BigInt(productId);
    }

    // Discount type filter
    if (discountType) {
      where.discount_type = discountType;
    }

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
              id: true,
              product_name: true,
              product_code: true,
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
      discount_value: discount.discount_value.toString(),
      vas_products: {
        ...discount.vas_products,
        id: discount.vas_products.id.toString(),
      },
    }));

    return {
      discounts: serializedDiscounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching merchant discounts:", error);
    return {
      discounts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

