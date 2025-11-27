"use server";

import prisma from "@/lib/prisma";
import type { CreateProviderFormData } from "@/lib/validations/provider";

export const createProvider = async (data: CreateProviderFormData) => {
  try {
    // Check if provider_code already exists
    const existingProvider = await prisma.vas_providers.findUnique({
      where: {
        provider_code: data.provider_code,
      },
    });

    if (existingProvider) {
      return {
        success: false,
        error: "Provider code already exists",
      };
    }

    // Create provider with default config_schema
    const provider = await prisma.vas_providers.create({
      data: {
        name: data.name,
        provider_code: data.provider_code,
        description: data.description || null,
        config_schema: {}, // Default empty JSON object
        is_active: data.is_active,
        created_at: new Date(),
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
    console.error("Error creating provider:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

