"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface UpdateFundingRequestData {
  amount?: number;
  description?: string;
  is_approved?: boolean;
  source?: string;
}

export const updateFundingRequest = async (
  fundingId: string,
  data: UpdateFundingRequestData
) => {
  try {
    const updatedFunding = await prisma.vas_merchant_funding.update({
      where: {
        funding_ref: fundingId,
      },
      data: {
        ...data,
        amount: data.amount ? Number(data.amount) : undefined,
      },
    });

    revalidatePath(`/admin/funding`);
    revalidatePath(`/admin/funding/${fundingId}`);

    return {
      success: true,
      funding: updatedFunding,
    };
  } catch (error) {
    console.error("Error updating funding request:", error);
    return {
      success: false,
      error: "Failed to update funding request. Please try again.",
    };
  }
};
