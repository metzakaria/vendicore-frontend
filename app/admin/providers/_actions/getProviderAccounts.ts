"use server";

import prisma from "@/lib/prisma";

interface GetProviderAccountsParams {
  page?: number;
  limit?: number;
  search?: string;
  provider_id?: string;
}

export const getProviderAccounts = async (params: GetProviderAccountsParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const search = params.search || "";
    const providerId = params.provider_id;

    const where: any = {};

    if (search) {
      where.OR = [
        { account_name: { contains: search, mode: "insensitive" } },
        { vending_sim: { contains: search, mode: "insensitive" } },
      ];
    }

    if (providerId && providerId !== "all") {
      try {
        where.provider_id = BigInt(providerId);
      } catch (error) {
        console.error("Invalid provider ID:", providerId);
        // If providerId is invalid, don't filter by it
      }
    }

    console.log("Fetching provider accounts with where clause:", JSON.stringify(where, null, 2));

    const [accounts, total] = await Promise.all([
      prisma.vas_provider_accounts.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            created_at: "desc",
          },
          {
            id: "desc",
          },
        ],
        include: {
          vas_providers: {
            select: {
              id: true,
              name: true,
              provider_code: true,
            },
          },
        },
      }),
      prisma.vas_provider_accounts.count({ where }),
    ]);

    console.log(`Found ${accounts.length} provider accounts (total: ${total})`);

    // Serialize BigInt values to strings for JSON
    const serializedAccounts = accounts.map((account: any) => ({
      ...account,
      id: account.id.toString(),
      provider_id: account.provider_id.toString(),
      vas_providers: {
        ...account.vas_providers,
        id: account.vas_providers.id.toString(),
      },
    }));

    return {
      accounts: serializedAccounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching provider accounts:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      accounts: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

