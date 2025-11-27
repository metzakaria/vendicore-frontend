"use server";

import prisma from "@/lib/prisma";
import type { CreateDiscountFormData } from "@/lib/validations/discount";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const createDiscount = async (data: CreateDiscountFormData) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if discount already exists for this merchant-product combination
    const existingDiscount = await prisma.vas_merchant_discount.findFirst({
      where: {
        merchant_id: BigInt(data.merchant_id),
        product_id: BigInt(data.product_id),
      },
    });

    if (existingDiscount) {
      return {
        success: false,
        error: "A discount already exists for this merchant and product combination.",
      };
    }

    const merchantId = BigInt(data.merchant_id);
    const productId = BigInt(data.product_id);
    const discountValue = parseFloat(data.discount_value);
    const userId = BigInt(session.user.id);

    // Validate discount value based on type
    if (data.discount_type === "percentage" && discountValue > 100) {
      return {
        success: false,
        error: "Percentage discount cannot exceed 100%",
      };
    }

    // Create discount
    const discount = await prisma.vas_merchant_discount.create({
      data: {
        merchant_id: merchantId,
        product_id: productId,
        discount_type: data.discount_type,
        discount_value: discountValue,
        is_active: data.is_active,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Serialize BigInt values to strings for JSON
    return {
      success: true,
      discount: {
        ...discount,
        id: discount.id.toString(),
        merchant_id: discount.merchant_id.toString(),
        product_id: discount.product_id.toString(),
        discount_value: discount.discount_value.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating discount:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

