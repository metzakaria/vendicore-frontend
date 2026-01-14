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
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log(`Fetching activity data for merchant with ID: ${merchant.id}`);
    console.log(`Date range: ${start.toISOString()} to ${end.toISOString()}`);
    
    // Check total transactions
    const totalTransactions = await prisma.vas_transactions.count({
      where: {
        merchant_id: merchant.id,
      },
    });
    
    console.log(`Total transactions for merchant: ${totalTransactions}`);
    
    // Get transactions in the date range
    const transactions = await prisma.vas_transactions.findMany({
      where: {
        merchant_id: merchant.id,
        created_at: {
          gte: start,
          lte: end,
        },
      },
      select: {
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`Transactions found in range: ${transactions.length}`);
    
    if (transactions.length > 0) {
      console.log('Sample transaction dates:', transactions.slice(0, 3).map(t => t.created_at?.toISOString()));
    }

    // Calculate number of days
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Determine if we should aggregate by week or month for large ranges
    const shouldAggregateByWeek = daysDiff > 60;
    const shouldAggregateByMonth = daysDiff > 180;

    // Generate date array
    const dateArray: Date[] = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count transactions per day
    const dailyCounts = new Map<string, number>();
    
    transactions.forEach(transaction => {
      if (transaction.created_at) {
        const txDate = new Date(transaction.created_at);
        const year = txDate.getFullYear();
        const month = String(txDate.getMonth() + 1).padStart(2, '0');
        const day = String(txDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);
      }
    });

    console.log('Daily counts map:', Object.fromEntries(dailyCounts));

    // Map date array to activity data
    let activityData = dateArray.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const count = dailyCounts.get(dateKey) || 0;
      
      return {
        date: date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
        fullDate: dateKey,
        timestamp: date.getTime(),
        count: count,
      };
    });

    // Aggregate by week if needed
    if (shouldAggregateByWeek && !shouldAggregateByMonth) {
      const weeklyData: typeof activityData = [];
      for (let i = 0; i < activityData.length; i += 7) {
        const weekData = activityData.slice(i, i + 7);
        const weekCount = weekData.reduce((sum, d) => sum + d.count, 0);
        const startOfWeek = weekData[0];
        const endOfWeek = weekData[weekData.length - 1];
        
        weeklyData.push({
          date: `${startOfWeek.date} - ${endOfWeek.date}`,
          fullDate: startOfWeek.fullDate,
          timestamp: startOfWeek.timestamp,
          count: weekCount,
        });
      }
      activityData = weeklyData;
    }
    
    // Aggregate by month if needed
    if (shouldAggregateByMonth) {
      const monthlyData = new Map<string, { date: string; count: number; timestamp: number }>();
      
      activityData.forEach(d => {
        const date = new Date(d.timestamp);
        const monthKey = date.toLocaleDateString("en-US", { month: 'short', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            date: monthKey,
            count: 0,
            timestamp: date.getTime(),
          });
        }
        
        const existing = monthlyData.get(monthKey)!;
        existing.count += d.count;
      });
      
      activityData = Array.from(monthlyData.values()).sort((a, b) => a.timestamp - b.timestamp);
    }

    console.log("Generated activityData sample:", activityData.slice(0, 5));
    console.log("Activity data with counts:", activityData.filter(d => d.count > 0));

    const maxCount = Math.max(...activityData.map((d) => d.count), 1);

    // Clean up the data but keep necessary fields
    const cleanedData = activityData.map(({ timestamp, fullDate, ...rest }) => rest);
    
    console.log("Cleaned data sample:", cleanedData.slice(0, 5));
    console.log("Cleaned data with counts:", cleanedData.filter(d => d.count > 0));

    const result = { 
      activityData: cleanedData,
      maxCount,
      totalTransactions,
      transactionsInRange: transactions.length,
      aggregationType: shouldAggregateByMonth ? 'monthly' : shouldAggregateByWeek ? 'weekly' : 'daily'
    };
    
    console.log("Returning result:", JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error("Error fetching merchant activity data:", error);
    return {
      activityData: [],
      maxCount: 1,
      totalTransactions: 0,
      transactionsInRange: 0,
      aggregationType: 'daily',
      error: (error as Error).message,
    };
  }
};