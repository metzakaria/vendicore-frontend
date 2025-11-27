"use server";

import prisma from "@/lib/prisma";

interface GetDataPackagesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
  product_id?: string;
}

export const getDataPackages = async (params: GetDataPackagesParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const search = params.search || "";
    const status = params.status || "all";
    const productId = params.product_id;

    const where: any = {};

    if (search) {
      where.OR = [
        { data_code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tariff_id: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.is_active = status === "active";
    }

    if (productId && productId !== "all") {
      where.product_id = BigInt(productId);
    }

    const [packages, total] = await Promise.all([
      prisma.vas_data_packages.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_products: {
            select: {
              id: true,
              product_name: true,
              product_code: true,
            },
          },
        },
      }),
      prisma.vas_data_packages.count({ where }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serializedPackages = packages.map((pkg: any) => ({
      ...pkg,
      id: pkg.id.toString(),
      product_id: pkg.product_id.toString(),
      amount: pkg.amount.toString(),
      vas_products: {
        ...pkg.vas_products,
        id: pkg.vas_products.id.toString(),
      },
    }));

    return {
      packages: serializedPackages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching data packages:", error);
    return {
      packages: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

