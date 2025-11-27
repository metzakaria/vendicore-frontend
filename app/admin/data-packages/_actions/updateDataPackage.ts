"use server";

import prisma from "@/lib/prisma";
import type { UpdateDataPackageFormData } from "@/lib/validations/dataPackage";

export const updateDataPackage = async (packageId: string, data: UpdateDataPackageFormData) => {
  try {
    // Check if package exists
    const existingPackage = await prisma.vas_data_packages.findUnique({
      where: {
        id: BigInt(packageId),
      },
    });

    if (!existingPackage) {
      return {
        success: false,
        error: "Data package not found",
      };
    }

    // Check if data code already exists (and it's not the current package)
    if (data.data_code !== existingPackage.data_code) {
      const packageWithSameCode = await prisma.vas_data_packages.findFirst({
        where: {
          data_code: data.data_code,
        },
      });

      if (packageWithSameCode) {
        return {
          success: false,
          error: "Data code already exists. Please choose a different code.",
        };
      }
    }

    const productId = BigInt(data.product_id);
    const amount = parseFloat(data.amount);

    // Update data package
    const dataPackage = await prisma.vas_data_packages.update({
      where: {
        id: BigInt(packageId),
      },
      data: {
        data_code: data.data_code,
        tariff_id: data.tariff_id || null,
        amount: amount,
        description: data.description,
        duration: data.duration,
        value: data.value,
        product_id: productId,
        is_active: data.is_active,
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
    console.error("Error updating data package:", error);
    
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

