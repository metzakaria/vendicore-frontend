"use server";

import prisma from "@/lib/prisma";
import type { CreateDataPackageFormData } from "@/lib/validations/dataPackage";

export const createDataPackage = async (data: CreateDataPackageFormData) => {
  try {
    // Check if data code already exists
    const existingPackage = await prisma.vas_data_packages.findFirst({
      where: {
        data_code: data.data_code,
      },
    });

    if (existingPackage) {
      return {
        success: false,
        error: "Data code already exists. Please choose a different code.",
      };
    }

    const productId = BigInt(data.product_id);
    const amount = parseFloat(data.amount);

    // Create data package
    const dataPackage = await prisma.vas_data_packages.create({
      data: {
        data_code: data.data_code,
        tariff_id: data.tariff_id || null,
        amount: amount,
        description: data.description,
        duration: data.duration,
        value: data.value,
        product_id: productId,
        is_active: data.is_active,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Serialize BigInt values to strings for JSON
    return {
      success: true,
      package: {
        ...dataPackage,
        id: dataPackage.id.toString(),
        product_id: dataPackage.product_id.toString(),
        amount: dataPackage.amount.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating data package:", error);
    
    // Handle Prisma unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "Data code already exists. Please choose a different code.",
      };
    }
    
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

