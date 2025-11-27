"use server";

import prisma from "@/lib/prisma";
import type { CreateProductFormData } from "@/lib/validations/product";

export const createProduct = async (data: CreateProductFormData) => {
  try {
    // Check if product code already exists
    const existingProduct = await prisma.vas_products.findFirst({
      where: {
        product_code: data.product_code,
      },
    });

    if (existingProduct) {
      return {
        success: false,
        error: "Product code already exists. Please choose a different code.",
      };
    }

    const categoryId = BigInt(data.category_id);
    const preferredProviderAccountId = data.preferred_provider_account_id
      ? BigInt(data.preferred_provider_account_id)
      : null;
    const backupProviderAccountId = data.backup_provider_account_id
      ? BigInt(data.backup_provider_account_id)
      : null;

    // Create product
    const product = await prisma.vas_products.create({
      data: {
        product_name: data.product_name,
        product_code: data.product_code,
        description: data.description,
        category_id: categoryId,
        preferred_provider_account_id: preferredProviderAccountId,
        backup_provider_account_id: backupProviderAccountId,
        is_active: data.is_active,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Serialize BigInt values to strings for JSON
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
    console.error("Error creating product:", error);
    
    // Handle Prisma unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "Product code already exists. Please choose a different code.",
      };
    }
    
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

