"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface DiscountUpdate {
  product_id: string;
  discount_type?: "percentage" | "flat";
  discount_value?: string;
  is_active?: boolean;
  action: "create" | "update" | "delete";
  discount_id?: string;
}

export const bulkUpdateDiscounts = async (
  merchantId: string,
  updates: DiscountUpdate[]
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = BigInt(session.user.id);
    const merchantIdBigInt = BigInt(merchantId);
    const results = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [] as string[],
    };

    for (const update of updates) {
      try {
        const productId = BigInt(update.product_id);

        if (update.action === "delete" && update.discount_id) {
          // Delete discount
          await prisma.vas_merchant_discount.delete({
            where: {
              id: BigInt(update.discount_id),
            },
          });
          results.deleted++;
        } else if (update.action === "create" && update.discount_type && update.discount_value) {
          // Check if discount already exists
          const existing = await prisma.vas_merchant_discount.findFirst({
            where: {
              merchant_id: merchantIdBigInt,
              product_id: productId,
            },
          });

          if (existing) {
            // Update instead of create
            const discountValue = parseFloat(update.discount_value);
            if (update.discount_type === "percentage" && discountValue > 100) {
              results.errors.push(`Product ${update.product_id}: Percentage cannot exceed 100%`);
              continue;
            }

            await prisma.vas_merchant_discount.update({
              where: {
                id: existing.id,
              },
              data: {
                discount_type: update.discount_type,
                discount_value: discountValue,
                is_active: update.is_active ?? true,
                updated_by: userId,
                updated_at: new Date(),
              },
            });
            results.updated++;
          } else {
            // Create new discount
            const discountValue = parseFloat(update.discount_value);
            if (update.discount_type === "percentage" && discountValue > 100) {
              results.errors.push(`Product ${update.product_id}: Percentage cannot exceed 100%`);
              continue;
            }

            await prisma.vas_merchant_discount.create({
              data: {
                merchant_id: merchantIdBigInt,
                product_id: productId,
                discount_type: update.discount_type,
                discount_value: discountValue,
                is_active: update.is_active ?? true,
                created_by: userId,
                updated_by: userId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            });
            results.created++;
          }
        } else if (update.action === "update" && update.discount_id && update.discount_type && update.discount_value) {
          // Update existing discount
          const discountValue = parseFloat(update.discount_value);
          if (update.discount_type === "percentage" && discountValue > 100) {
            results.errors.push(`Product ${update.product_id}: Percentage cannot exceed 100%`);
            continue;
          }

          await prisma.vas_merchant_discount.update({
            where: {
              id: BigInt(update.discount_id),
            },
            data: {
              discount_type: update.discount_type,
              discount_value: discountValue,
              is_active: update.is_active ?? true,
              updated_by: userId,
              updated_at: new Date(),
            },
          });
          results.updated++;
        }
      } catch (error) {
        results.errors.push(
          `Product ${update.product_id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error("Error bulk updating discounts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

