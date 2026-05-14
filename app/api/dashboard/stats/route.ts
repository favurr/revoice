import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const today = new Date();
    const endDate = endDateParam ? endOfDay(new Date(endDateParam)) : endOfDay(today);
    const startDate = startDateParam
      ? startOfDay(new Date(startDateParam))
      : startOfDay(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "completed",
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const grossSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0);
    const netSales = Math.max(grossSales - totalDiscount, 0);
    const totalCost = orders.reduce(
      (sum, order) =>
        sum +
        order.orderItems.reduce(
          (itemSum, item) =>
            itemSum + item.quantity * (item.product?.costPrice ?? 0),
          0,
        ),
      0,
    );
    const profit = netSales - totalCost;
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, order) =>
        sum +
        order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    const customerIds = new Set(
      orders.filter((order) => order.customerId).map((order) => order.customerId),
    );
    const customersCount = customerIds.size;

    const dayCount = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1,
    );
    const dailyData = Array.from({ length: dayCount }, (_, index) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + index);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayOrders = orders.filter(
        (order) => order.createdAt >= dayStart && order.createdAt <= dayEnd,
      );
      const daySales = dayOrders.reduce(
        (sum, order) => sum + order.totalAmount - order.discount,
        0,
      );
      return {
        date: day.toISOString().split("T")[0],
        sales: daySales,
        orders: dayOrders.length,
      };
    });

    const productMap = new Map();
    for (const order of orders) {
      for (const item of order.orderItems) {
        const existing = productMap.get(item.productId) || {
          productId: item.productId,
          name: item.product?.name || "Unknown",
          quantity: 0,
          revenue: 0,
          cost: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.total;
        existing.cost += item.quantity * (item.product?.costPrice ?? 0);
        productMap.set(item.productId, existing);
      }
    }

    const topProducts = Array.from(productMap.values())
      .map((product: any) => ({
        ...product,
        profit: product.revenue - product.cost,
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get low stock alerts (products with stock <= 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        sku: true,
      },
      orderBy: {
        stock: "asc",
      },
    });

    // Get out of stock products
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        stock: 0,
      },
      select: {
        id: true,
        name: true,
        stock: true,
        sku: true,
      },
    });

    return NextResponse.json({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      netSales,
      grossSales,
      totalCost,
      totalDiscount,
      profit,
      totalOrders,
      totalItems,
      customersCount,
      averageOrderValue: totalOrders > 0 ? netSales / totalOrders : 0,
      averageMargin: netSales > 0 ? (profit / netSales) * 100 : 0,
      dailyData,
      topProducts,
      recentOrders: orders.slice(0, 5),
      lowStockProducts,
      outOfStockProducts,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
