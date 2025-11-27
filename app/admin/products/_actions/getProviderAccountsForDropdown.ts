"use server";

import prisma from "@/lib/prisma";

export const getProviderAccountsForDropdown = async () => {
  try {
    const accounts = await prisma.vas_provider_accounts.findMany({
      where: {
        vas_providers: {
          is_active: true,
        },
      },
      select: {
        id: true,
        account_name: true,
        vas_providers: {
          select: {
            id: true,
            name: true,
            provider_code: true,
          },
        },
      },
      orderBy: {
        account_name: "asc",
      },
    });

    // Serialize BigInt values to strings for JSON
    return accounts.map((account) => ({
      ...account,
      id: account.id.toString(),
      vas_providers: {
        ...account.vas_providers,
        id: account.vas_providers.id.toString(),
      },
    }));
  } catch (error) {
    console.error("Error fetching provider accounts:", error);
    return [];
  }
};

