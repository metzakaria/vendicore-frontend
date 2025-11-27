"use server";

import prisma from "@/lib/prisma";

interface GetProvidersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
}

export const getProviders = async (params: GetProvidersParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const search = params.search || "";
    const status = params.status || "all";

    const where: any = {};

    if (search) {
      where.OR = [
        { provider_code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.is_active = status === "active";
    }

    const [providers, total] = await Promise.all([
      prisma.vas_providers.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          _count: {
            select: {
              vas_provider_accounts: true,
            },
          },
        },
      }),
      prisma.vas_providers.count({ where }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serializedProviders = providers.map((provider: any) => ({
      ...provider,
      id: provider.id.toString(),
      accounts_count: provider._count.vas_provider_accounts,
    }));

    return {
      providers: serializedProviders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return {
      providers: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

