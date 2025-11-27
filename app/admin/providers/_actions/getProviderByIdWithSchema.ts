"use server";

import prisma from "@/lib/prisma";

export const getProviderByIdWithSchema = async (id: string) => {
  try {
    if (!id || id === "undefined" || id === "null") {
      return null;
    }

    const providerId = BigInt(id);

    const provider = await prisma.vas_providers.findUnique({
      where: {
        id: providerId,
      },
      select: {
        id: true,
        name: true,
        provider_code: true,
        config_schema: true,
      },
    });

    if (!provider) {
      return null;
    }

    return {
      id: provider.id.toString(),
      name: provider.name,
      provider_code: provider.provider_code,
      config_schema: provider.config_schema,
    };
  } catch (error) {
    console.error("Error fetching provider with schema:", error);
    return null;
  }
};

