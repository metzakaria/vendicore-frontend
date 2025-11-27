"use server";

import prisma from "@/lib/prisma";

interface QuickUpdateProductData {
  is_active?: boolean;
  preferred_provider_account_id?: string | null;
}

export const quickUpdateProduct = async (
  productId: string,
  data: QuickUpdateProductData
) => {
  try {
    const existingProduct = await prisma.vas_products.findUnique({
      where: {
        id: BigInt(productId),
      },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }

    if (data.preferred_provider_account_id !== undefined) {
      updateData.preferred_provider_account_id = data.preferred_provider_account_id
        ? BigInt(data.preferred_provider_account_id)
        : null;
    }

    const product = await prisma.vas_products.update({
      where: {
        id: BigInt(productId),
      },
      data: updateData,
    });

    return {
      success: true,
      product: {
        ...product,
        id: product.id.toString(),
        category_id: product.category_id.toString(),
        preferred_provider_account_id: product.preferred_provider_account_id?.toString() || null,
        backup_provider_account_id: product.backup_provider_account_id?.toString() || null,
      },
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

