"use server";

import prisma from "@/lib/prisma";

interface DataPackageRow {
  data_code: string;
  tariff_id?: string;
  amount: string;
  description: string;
  duration: string;
  value: string;
  product_id: string;
  is_active: boolean;
}

export const bulkImportDataPackages = async (packages: DataPackageRow[]) => {
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const pkg of packages) {
      try {
        // Check if data code already exists
        const existing = await prisma.vas_data_packages.findFirst({
          where: {
            data_code: pkg.data_code,
          },
        });

        if (existing) {
          results.failed++;
          results.errors.push(`Data code ${pkg.data_code} already exists`);
          continue;
        }

        const productId = BigInt(pkg.product_id);
        const amount = parseFloat(pkg.amount);

        await prisma.vas_data_packages.create({
          data: {
            data_code: pkg.data_code,
            tariff_id: pkg.tariff_id || null,
            amount: amount,
            description: pkg.description,
            duration: pkg.duration,
            value: pkg.value,
            product_id: productId,
            is_active: pkg.is_active,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Failed to import ${pkg.data_code}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error("Error bulk importing data packages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

