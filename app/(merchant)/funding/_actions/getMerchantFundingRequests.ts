"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GetMerchantFundingRequestsParams {
  page?: number;
  limit?: number;
  status?: "all" | "approved" | "pending" | "rejected";
  amount?: string;
  startDate?: string;
  endDate?: string;
}

export const getMerchantFundingRequests = async (params: GetMerchantFundingRequestsParams = {}) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.merchantId) {
      return {
        fundings: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: "Unauthorized",
      };
    }

    const merchantId = BigInt(session.user.merchantId);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      merchant_id: merchantId,
    };

    // Status filter
    if (params.status && params.status !== "all") {
      if (params.status === "approved") {
        where.is_approved = true;
        where.is_active = true;
      } else if (params.status === "pending") {
        where.is_approved = false;
        where.is_active = true;
      } else if (params.status === "rejected") {
        where.is_active = false;
      }
    }

    // Amount filter - exact match
    if (params.amount) {
      const amountValue = parseFloat(params.amount);
      if (!isNaN(amountValue) && amountValue > 0) {
        where.amount = amountValue;
      }
    }

    // Date range filter
    if (params.startDate || params.endDate) {
      where.created_at = {};
      if (params.startDate) {
        where.created_at.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const endDate = new Date(params.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.created_at.lte = endDate;
      }
    }

    const [fundings, total] = await Promise.all([
      prisma.vas_merchant_funding.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_users_vas_merchant_funding_created_byTovas_users: {
            select: {
              username: true,
              email: true,
            },
          },
          vas_users_vas_merchant_funding_approved_byTovas_users: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.vas_merchant_funding.count({ where }),
    ]);

    // Serialize BigInt values
    const serializedFundings = fundings.map((funding: any) => ({
      ...funding,
      id: funding.funding_ref,
      merchant_id: funding.merchant_id.toString(),
      created_by: funding.created_by?.toString() || null,
      approved_by: funding.approved_by?.toString() || null,
      amount: funding.amount.toString(),
      balance_before: funding.balance_before.toString(),
      balance_after: funding.balance_after.toString(),
    }));

    return {
      fundings: serializedFundings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching merchant funding requests:", error);
    return {
      fundings: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

