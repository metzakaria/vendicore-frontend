"use server";

import prisma from "@/lib/prisma";

export const getProviderAccountById = async (id: string) => {
  try {
    // Validate ID
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid provider account ID:", id);
      return null;
    }

    const accountId = BigInt(id);

    const account = await prisma.vas_provider_accounts.findUnique({
      where: {
        id: accountId,
      },
      include: {
        vas_providers: {
          select: {
            id: true,
            name: true,
            provider_code: true,
            description: true,
            is_active: true,
            config_schema: true,
          },
        },
        _count: {
          select: {
            vas_transactions: true,
          },
        },
      },
    });

    if (!account) {
      return null;
    }

    // Serialize BigInt values to strings for JSON
    return {
      ...account,
      id: account.id.toString(),
      provider_id: account.provider_id.toString(),
      config: account.config || {},
      vas_providers: {
        ...account.vas_providers,
        id: account.vas_providers.id.toString(),
        config_schema: account.vas_providers.config_schema || {},
      },
    };
  } catch (error) {
    console.error("Error fetching provider account:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

