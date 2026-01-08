"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma client types

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
    const search = params.search || "";
    const status = params.status || "all";
    const discountType = params.discount_type || "all";
    const merchantId = params.merchant_id;
    const productId = params.product_id;

    const where: Prisma.vas_merchant_discountWhereInput = {};

    if (search) {
      where.OR = [
        { vas_merchants: { business_name: { contains: search, mode: "insensitive" } } },
        { vas_merchants: { merchant_code: { contains: search, mode: "insensitive" } } },
        { vas_products: { product_name: { contains: search, mode: "insensitive" } } },
        { vas_products: { product_code: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Filter by status (is_active)
    if (status === "active") {
      where.is_active = true;
    } else if (status === "inactive") {
      where.is_active = false;
    }

    // Always filter by merchant_id if provided (required for merchant-specific views)
    if (merchantId && merchantId !== "all") {
      where.merchant_id = BigInt(merchantId);
    }

    if (discountType !== "all") {
      where.discount_type = discountType;
    }

    if (productId && productId !== "all") {
      where.product_id = BigInt(productId);
    }

    type DiscountWithIncludes = Prisma.vas_merchant_discountGetPayload<{
      include: {
        vas_merchants: {
          select: {
            id: true;
            merchant_code: true;
            business_name: true;
          };
        };
        vas_products: {
          select: {
            id: true;
            product_name: true;
            product_code: true;
          };
        };
        vas_users_vas_merchant_discount_updated_byTovas_users: {
          select: {
            id: true;
            username: true;
            email: true;
          };
        };
      };
    }>;

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
    const serializedDiscounts = discounts.map((discount: DiscountWithIncludes) => ({
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

