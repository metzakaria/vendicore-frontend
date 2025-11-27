"use server";

import prisma from "@/lib/prisma";

interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
  category_id?: string;
}

export const getProducts = async (params: GetProductsParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const search = params.search || "";
    const status = params.status || "all";
    const categoryId = params.category_id;

    const where: any = {};

    if (search) {
      where.OR = [
        { product_name: { contains: search, mode: "insensitive" } },
        { product_code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.is_active = status === "active";
    }

    if (categoryId && categoryId !== "all") {
      where.category_id = BigInt(categoryId);
    }

    const [products, total] = await Promise.all([
      prisma.vas_products.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_product_categories: {
            select: {
              id: true,
              name: true,
              category_code: true,
            },
          },
          vas_provider_accounts_vas_products_preferred_provider_account_idTovas_provider_accounts: {
            select: {
              id: true,
              account_name: true,
              vas_providers: {
                select: {
                  name: true,
                  provider_code: true,
                },
              },
            },
          },
        },
      }),
      prisma.vas_products.count({ where }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serializedProducts = products.map((product: any) => ({
      ...product,
      id: product.id.toString(),
      category_id: product.category_id.toString(),
      preferred_provider_account_id: product.preferred_provider_account_id?.toString() || null,
      backup_provider_account_id: product.backup_provider_account_id?.toString() || null,
      vas_product_categories: {
        ...product.vas_product_categories,
        id: product.vas_product_categories.id.toString(),
      },
      preferred_provider_account: product.vas_provider_accounts_vas_products_preferred_provider_account_idTovas_provider_accounts
        ? {
            ...product.vas_provider_accounts_vas_products_preferred_provider_account_idTovas_provider_accounts,
            id: product.vas_provider_accounts_vas_products_preferred_provider_account_idTovas_provider_accounts.id.toString(),
          }
        : null,
    }));

    return {
      products: serializedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

