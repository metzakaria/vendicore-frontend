import prisma from "@/lib/prisma";

export const getActivityData = async () => {
  try {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const activityData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.vas_transactions.count({
          where: {
            created_at: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        return {
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        };
      })
    );

    const maxCount = Math.max(...activityData.map((d) => d.count), 1);

    return { activityData, maxCount };
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return {
      activityData: [],
      maxCount: 1,
    };
  }
};

