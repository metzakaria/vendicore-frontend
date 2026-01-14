"use server";

import prisma from "@/lib/prisma";

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "all" | "admin" | "superadmin" | "merchant";
  is_active?: boolean | "all";
}

export const getUsers = async (params: GetUsersParams = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const search = params.search || "";
    const role = params.role;
    const isActive = params.is_active;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { phone_number: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role && role !== "all") {
      if (role === "merchant") {
        // Check if user is associated with a merchant
        where.vas_merchants = {
          isNot: null,
        };
      } else if (role === "superadmin") {
        where.is_superuser = true;
      } else if (role === "admin") {
        where.is_staff = true;
        where.is_superuser = false;
        // Also exclude merchants - users who are not associated with a merchant
        where.vas_merchants = {
          is: null,
        };
      }
    }

    if (isActive !== undefined && isActive !== "all") {
      where.is_active = isActive === true;
    }

    const [users, total] = await Promise.all([
      prisma.vas_users.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        skip,
        take: limit,
        orderBy: {
          date_joined: "desc",
        },
        include: {
          vas_merchants: {
            select: {
              id: true,
              merchant_code: true,
              business_name: true,
            },
          },
        },
      }),
      prisma.vas_users.count({ where: Object.keys(where).length > 0 ? where : undefined }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serializedUsers = users.map((user: any) => ({
      ...user,
      id: user.id.toString(),
      vas_merchants: user.vas_merchants
        ? {
            ...user.vas_merchants,
            id: user.vas_merchants.id.toString(),
          }
        : null,
      last_login: user.last_login?.toISOString() || null,
    }));

    const result = {
      users: serializedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    console.log("getUsers returning:", {
      usersCount: result.users.length,
      total: result.total,
      firstUser: result.users[0] || null,
    });

    return result;
  } catch (error) {
    console.error("Error fetching users:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

