"use server";

import prisma from "@/lib/prisma";

export const getProductById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid product ID:", id);
      return null;
    }

    const productId = BigInt(id);

    const product = await prisma.vas_products.findUnique({
      where: {
        id: productId,
      },
      include: {
        vas_product_categories: {
          select: {
            id: true,
            name: true,
            category_code: true,
            description: true,
          },
        },
        vas_provider_accounts_vas_products_preferred_provider_account_idTovas_provider_accounts: {
          select: {
            id: true,
            account_name: true,
            vas_providers: {
              select: {
                id: true,
                name: true,
                provider_code: true,
              },
            },
          },
        },
        vas_provider_accounts_vas_products_backup_provider_account_idTovas_provider_accounts: {
          select: {
            id: true,
            account_name: true,
            vas_providers: {
              select: {
                id: true,
                name: true,
                provider_code: true,
              },
            },
          },
        },
        _count: {
          select: {
            vas_merchant_discount: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Serialize BigInt values to strings for JSON
    return {
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
      backup_provider_account: product.vas_provider_accounts_vas_products_backup_provider_account_idTovas_provider_accounts
        ? {
            ...product.vas_provider_accounts_vas_products_backup_provider_account_idTovas_provider_accounts,
            id: product.vas_provider_accounts_vas_products_backup_provider_account_idTovas_provider_accounts.id.toString(),
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

