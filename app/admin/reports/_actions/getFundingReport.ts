"use server";

import prisma from "@/lib/prisma";

interface FundingReportParams {
  startDate?: string;
  endDate?: string;
  merchantId?: string;
  status?: "all" | "approved" | "pending" | "rejected";
}

export const getFundingReport = async (params: FundingReportParams = {}) => {
  try {
    const where: any = {};

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

    // Merchant filter
    if (params.merchantId) {
      where.merchant_id = BigInt(params.merchantId);
    }

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

    const [fundings, summary] = await Promise.all([
      prisma.vas_merchant_funding.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_merchants: {
            select: {
              merchant_code: true,
              business_name: true,
            },
          },
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
      prisma.vas_merchant_funding.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: true,
      }),
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
      summary: {
        totalAmount: summary._sum.amount?.toString() || "0",
        totalCount: summary._count,
      },
    };
  } catch (error) {
    console.error("Error fetching funding report:", error);
    return {
      fundings: [],
      summary: {
        totalAmount: "0",
        totalCount: 0,
      },
    };
  }
};

