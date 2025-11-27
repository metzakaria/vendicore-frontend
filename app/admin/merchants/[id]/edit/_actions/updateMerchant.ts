"use server";

import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import type { UpdateMerchantFormData } from "@/lib/validations/merchant";

export const updateMerchant = async (merchantId: string, data: UpdateMerchantFormData) => {
  try {
    // Check if merchant exists
    const existingMerchant = await prisma.vas_merchants.findUnique({
      where: {
        id: BigInt(merchantId),
      },
      include: {
        vas_users: true,
      },
    });

    if (!existingMerchant) {
      return {
        success: false,
        error: "Merchant not found",
      };
    }

    // Check if email is being changed and if new email already exists
    if (data.email !== existingMerchant.vas_users?.email) {
      const existingUser = await prisma.vas_users.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Email already exists",
        };
      }
    }

    // Prepare user update data
    const userUpdateData: any = {
      email: data.email,
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      phone_number: data.phone_number || null,
      is_active: data.is_active,
    };

    // Only update password if provided
    if (data.password && data.password.trim() !== "") {
      userUpdateData.password = await hash(data.password, 10);
    }

    // Update user
    if (existingMerchant.user_id) {
      await prisma.vas_users.update({
        where: {
          id: existingMerchant.user_id,
        },
        data: userUpdateData,
      });
    }

    // Update merchant
    const merchant = await prisma.vas_merchants.update({
      where: {
        id: BigInt(merchantId),
      },
      data: {
        business_name: data.business_name,
        business_description: data.business_description || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        website: data.website || null,
        account_type: data.account_type,
        daily_tranx_limit: data.daily_tranx_limit || null,
        api_access_ip: data.api_access_ip || null,
        is_active: data.is_active,
        updated_at: new Date(),
      },
    });

    // Serialize BigInt values to strings for JSON
    return {
      success: true,
      merchant: {
        ...merchant,
        id: merchant.id.toString(),
        user_id: merchant.user_id?.toString() || null,
        current_balance: merchant.current_balance.toString(),
        balance_before: merchant.balance_before.toString(),
      },
    };
  } catch (error) {
    console.error("Error updating merchant:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

