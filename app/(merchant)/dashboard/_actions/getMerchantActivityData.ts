"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ActivityDataParams {
  startDate: string;
  endDate: string;
}

export const getMerchantActivityData = async (params: ActivityDataParams) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const merchant = await prisma.vas_merchants.findUnique({
      where: { user_id: BigInt(session.user.id) },
      select: { id: true },
    });

    if (!merchant) {
      throw new Error("Merchant not found");
    }

    const { startDate, endDate } = params;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const numDays = dayDiff > 0 ? dayDiff : 1;

    const dateArray = Array.from({ length: numDays }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });

    const transactionsByDay = await prisma.vas_transactions.groupBy({
      by: ['created_at'],
      where: {
        merchant_id: merchant.id,
        created_at: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const activityData = dateArray.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const found = transactionsByDay.find(t => t.created_at?.toISOString().split('T')[0] === dateString);
      
      return {
        date: date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
        count: found ? found._count.id : 0,
      };
    });

    const maxCount = Math.max(...activityData.map((d) => d.count), 1);

    return { activityData, maxCount };
  } catch (error) {
    console.error("Error fetching merchant activity data:", error);
    return {
      activityData: [],
      maxCount: 1,
      error: (error as Error).message,
    };
  }
};
