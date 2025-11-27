"use server";

import prisma from "@/lib/prisma";
import type { UpdateDiscountFormData } from "@/lib/validations/discount";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const updateDiscount = async (discountId: string, data: UpdateDiscountFormData) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if discount exists
    const existingDiscount = await prisma.vas_merchant_discount.findUnique({
      where: {
        id: BigInt(discountId),
      },
    });

    if (!existingDiscount) {
      return {
        success: false,
        error: "Discount not found",
      };
    }

    // Check if discount already exists for this merchant-product combination (and it's not the current discount)
    const merchantId = BigInt(data.merchant_id);
    const productId = BigInt(data.product_id);
    
    if (existingDiscount.merchant_id !== merchantId || existingDiscount.product_id !== productId) {
      const duplicateDiscount = await prisma.vas_merchant_discount.findFirst({
        where: {
          merchant_id: merchantId,
          product_id: productId,
          id: { not: BigInt(discountId) },
        },
      });

      if (duplicateDiscount) {
        return {
          success: false,
          error: "A discount already exists for this merchant and product combination.",
        };
      }
    }

    const discountValue = parseFloat(data.discount_value);
    const userId = BigInt(session.user.id);

    // Validate discount value based on type
    if (data.discount_type === "percentage" && discountValue > 100) {
      return {
        success: false,
        error: "Percentage discount cannot exceed 100%",
      };
    }

    // Update discount
    const discount = await prisma.vas_merchant_discount.update({
      where: {
        id: BigInt(discountId),
      },
      data: {
        merchant_id: merchantId,
        product_id: productId,
        discount_type: data.discount_type,
        discount_value: discountValue,
        is_active: data.is_active,
        updated_by: userId,
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
    console.error("Error updating discount:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

