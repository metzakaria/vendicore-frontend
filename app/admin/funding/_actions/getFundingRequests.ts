"use server";

import prisma from "@/lib/prisma";

interface GetFundingRequestsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "pending" | "approved" | "rejected";
  merchant_id?: string;
  is_approved?: boolean;
  is_credited?: boolean;
}

export const getFundingRequests = async (params: GetFundingRequestsParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const search = params.search || "";
    const status = params.status || "all";
    const merchantId = params.merchant_id;
    const isApproved = params.is_approved;
    const isCredited = params.is_credited;

    const where: any = {};

    if (search) {
      const searchConditions: any[] = [];
      
      // UUID pattern: 8-4-4-4-12 hexadecimal characters with dashes
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Only search by UUID if the search term matches UUID format
      if (uuidPattern.test(search.trim())) {
        searchConditions.push({ funding_ref: search.trim() });
      }
      
      // For text fields, always use contains
      searchConditions.push(
        { description: { contains: search, mode: "insensitive" } },
        { source: { contains: search, mode: "insensitive" } },
        { vas_merchants: { business_name: { contains: search, mode: "insensitive" } } },
        { vas_merchants: { merchant_code: { contains: search, mode: "insensitive" } } }
      );
      
      where.OR = searchConditions;
    }

    if (status !== "all") {
      if (status === "pending") {
        where.is_approved = false;
      } else if (status === "approved") {
        where.is_approved = true;
      }
    }

    if (isApproved !== undefined) {
      where.is_approved = isApproved;
    }

    if (isCredited !== undefined) {
      where.is_credited = isCredited;
    }

    if (merchantId && merchantId !== "all") {
      where.merchant_id = BigInt(merchantId);
    }

    const [fundingRequests, total] = await Promise.all([
      prisma.vas_merchant_funding.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          vas_merchants: {
            select: {
              id: true,
              merchant_code: true,
              business_name: true,
              current_balance: true,
            },
          },
          vas_users_vas_merchant_funding_created_byTovas_users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          vas_users_vas_merchant_funding_approved_byTovas_users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.vas_merchant_funding.count({ where }),
    ]);

    // Serialize BigInt and Decimal values to strings for JSON
    const serializedFundingRequests = fundingRequests.map((funding: any) => ({
      ...funding,
      merchant_id: funding.merchant_id.toString(),
      created_by: funding.created_by.toString(),
      approved_by: funding.approved_by?.toString() || null,
      amount: funding.amount.toString(),
      balance_before: funding.balance_before.toString(),
      balance_after: funding.balance_after.toString(),
      vas_merchants: {
        ...funding.vas_merchants,
        id: funding.vas_merchants.id.toString(),
        current_balance: funding.vas_merchants.current_balance.toString(),
      },
      vas_users_vas_merchant_funding_created_byTovas_users: {
        ...funding.vas_users_vas_merchant_funding_created_byTovas_users,
        id: funding.vas_users_vas_merchant_funding_created_byTovas_users.id.toString(),
      },
      vas_users_vas_merchant_funding_approved_byTovas_users: funding.vas_users_vas_merchant_funding_approved_byTovas_users
        ? {
            ...funding.vas_merchant_funding_approved_byTovas_users,
            id: funding.vas_users_vas_merchant_funding_approved_byTovas_users.id.toString(),
          }
        : null,
    }));

    return {
      fundingRequests: serializedFundingRequests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching funding requests:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      fundingRequests: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

