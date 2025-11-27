"use server";

import prisma from "@/lib/prisma";

interface GetMerchantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
}

export const getMerchants = async (params: GetMerchantsParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const search = params.search || "";
    const status = params.status || "all";

    const where: any = {};

    if (search) {
      where.OR = [
        { business_name: { contains: search, mode: "insensitive" } },
        {
          vas_users: {
            email: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (status !== "all") {
      where.is_active = status === "active";
    }

    const [merchants, total] = await Promise.all([
      prisma.vas_merchants.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_users: {
            select: {
              email: true,
              username: true,
            },
          },
        },
      }),
      prisma.vas_merchants.count({ where }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serializedMerchants = merchants.map((merchant: any) => ({
      ...merchant,
      id: merchant.id.toString(),
      user_id: merchant.user_id?.toString() || null,
      current_balance: merchant.current_balance.toString(),
      balance_before: merchant.balance_before.toString(),
    }));

    return {
      merchants: serializedMerchants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return {
      merchants: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

