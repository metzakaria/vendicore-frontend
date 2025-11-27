"use server";

import prisma from "@/lib/prisma";

export const getProvidersForDropdown = async () => {
  try {
    const providers = await prisma.vas_providers.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        provider_code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Serialize BigInt values to strings for JSON
    return providers.map((provider: any) => ({
      id: provider.id.toString(),
      name: provider.name,
      provider_code: provider.provider_code,
    }));
  } catch (error) {
    console.error("Error fetching providers for dropdown:", error);
    return [];
  }
};

