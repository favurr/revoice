import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // Get date range for today or specified date
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all orders for the day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "completed",
      },
      include: {
        orderItems: true,
      },
    });

    // Calculate stats
    const totalSales = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, order) =>
        sum +
        order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    // Group by hour for chart data
    const hourlyData = Array(24)
      .fill(0)
      .map((_, hour) => {
        const hourStart = new Date(startOfDay);
        hourStart.setHours(hour, 0, 0, 0);

        const hourEnd = new Date(startOfDay);
        hourEnd.setHours(hour, 59, 59, 999);

        const hourOrders = orders.filter(
          (order) => order.createdAt >= hourStart && order.createdAt <= hourEnd,
        );

        const hourTotal = hourOrders.reduce(
          (sum, order) => sum + order.totalAmount,
          0,
        );

        return {
          hour,
          sales: hourTotal,
          orders: hourOrders.length,
        };
      });

    return NextResponse.json({
      date: targetDate.toISOString().split("T")[0],
      totalSales,
      totalOrders,
      totalItems,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      hourlyData,
      recentOrders: orders.slice(0, 10),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
