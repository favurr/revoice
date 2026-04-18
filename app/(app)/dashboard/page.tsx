"use client";

import { useDashboardStats, useOrders } from "@/lib/hooks";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const { data: stats, isLoading: statsLoading } =
    useDashboardStats(selectedDate);
  const { data: orders, isLoading: ordersLoading } = useOrders();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">POS Dashboard</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/orders/new">
              <Button>New Order</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">Products</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Date Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Sales
              </h3>
              <p className="text-3xl font-bold mt-2">
                ${stats?.totalSales?.toFixed(2) || "0.00"}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Orders
              </h3>
              <p className="text-3xl font-bold mt-2">
                {stats?.totalOrders || 0}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Items Sold
              </h3>
              <p className="text-3xl font-bold mt-2">
                {stats?.totalItems || 0}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Avg Order Value
              </h3>
              <p className="text-3xl font-bold mt-2">
                ${stats?.averageOrderValue?.toFixed(2) || "0.00"}
              </p>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Order #</th>
                    <th className="text-left py-2 px-2">Time</th>
                    <th className="text-left py-2 px-2">Items</th>
                    <th className="text-left py-2 px-2">Total</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.slice(0, 10).map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-muted">
                      <td className="py-3 px-2">{order.orderNumber}</td>
                      <td className="py-3 px-2">
                        {format(new Date(order.createdAt), "HH:mm:ss")}
                      </td>
                      <td className="py-3 px-2">
                        {order.orderItems?.length || 0}
                      </td>
                      <td className="py-3 px-2 font-semibold">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
