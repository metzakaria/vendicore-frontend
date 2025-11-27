"use server";

import prisma from "@/lib/prisma";
import type { UpdateProviderAccountFormData } from "@/lib/validations/providerAccount";

export const updateProviderAccount = async (accountId: string, data: UpdateProviderAccountFormData) => {
  try {
    // Check if account exists
    const existingAccount = await prisma.vas_provider_accounts.findUnique({
      where: {
        id: BigInt(accountId),
      },
    });

    if (!existingAccount) {
      return {
        success: false,
        error: "Provider account not found",
      };
    }

    // Check if account name already exists (and it's not the current account)
    if (data.account_name !== existingAccount.account_name) {
      const accountWithSameName = await prisma.vas_provider_accounts.findFirst({
        where: {
          account_name: data.account_name,
        },
      });

      if (accountWithSameName) {
        return {
          success: false,
          error: "Account name already exists. Please choose a different name.",
        };
      }
    }

    const providerId = BigInt(data.provider_id);
    const availableBalance = parseFloat(data.available_balance || "0");
    const balanceAtProvider = parseFloat(data.balance_at_provider || "0");

    // Update provider account
    const account = await prisma.vas_provider_accounts.update({
      where: {
        id: BigInt(accountId),
      },
      data: {
        account_name: data.account_name,
        provider_id: providerId,
        available_balance: availableBalance,
        balance_at_provider: balanceAtProvider,
        vending_sim: data.vending_sim || null,
        config: data.config || {}, // Config JSON from form
        updated_at: new Date(),
      },
    });

    // Serialize BigInt values to strings for JSON
    return {
      success: true,
      account: {
        ...account,
        id: account.id.toString(),
        provider_id: account.provider_id.toString(),
      },
    };
  } catch (error) {
    console.error("Error updating provider account:", error);
    
    // Handle Prisma unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "Account name already exists. Please choose a different name.",
      };
    }
    
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

