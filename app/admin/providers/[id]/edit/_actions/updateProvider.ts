"use server";

import prisma from "@/lib/prisma";
import type { UpdateProviderFormData } from "@/lib/validations/provider";

export const updateProvider = async (providerId: string, data: UpdateProviderFormData) => {
  try {
    // Check if provider exists
    const existingProvider = await prisma.vas_providers.findUnique({
      where: {
        id: BigInt(providerId),
      },
    });

    if (!existingProvider) {
      return {
        success: false,
        error: "Provider not found",
      };
    }

    // Check if provider_code is being changed and if new code already exists
    if (data.provider_code !== existingProvider.provider_code) {
      const codeExists = await prisma.vas_providers.findUnique({
        where: {
          provider_code: data.provider_code,
        },
      });

      if (codeExists) {
        return {
          success: false,
          error: "Provider code already exists",
        };
      }
    }

    // Update provider
    const provider = await prisma.vas_providers.update({
      where: {
        id: BigInt(providerId),
      },
      data: {
        name: data.name,
        provider_code: data.provider_code,
        description: data.description || null,
        is_active: data.is_active,
        updated_at: new Date(),
      },
    });

    // Serialize BigInt values to strings for JSON
    return {
      success: true,
      provider: {
        ...provider,
        id: provider.id.toString(),
      },
    };
  } catch (error) {
    console.error("Error updating provider:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

