"use server";

import prisma from "@/lib/prisma";

export const getProviderById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid provider ID:", id);
      return null;
    }

    const providerId = BigInt(id);

    const provider = await prisma.vas_providers.findUnique({
      where: {
        id: providerId,
      },
      include: {
        vas_provider_accounts: {
          select: {
            id: true,
            account_name: true,
            available_balance: true,
            balance_at_provider: true,
            vending_sim: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
        _count: {
          select: {
            vas_provider_accounts: true,
          },
        },
      },
    });

    if (!provider) {
      return null;
    }

    // Serialize BigInt values to strings for JSON
    return {
      ...provider,
      id: provider.id.toString(),
      vas_provider_accounts: provider.vas_provider_accounts.map((account: any) => ({
        ...account,
        id: account.id.toString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching provider:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

