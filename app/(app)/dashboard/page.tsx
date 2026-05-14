"use client";

import { useDashboardStats } from "@/lib/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderPreviewDialog } from "@/components/ui/order-preview-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-2))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-3))",
  },
  cost: {
    label: "Cost",
    color: "hsl(var(--chart-4))",
  },
};

export default function Dashboard() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: format(subDays(today, 30), "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderPreview, setShowOrderPreview] = useState(false);

  const { data: stats } = useDashboardStats(
    dateRange.startDate,
    dateRange.endDate,
  );

  // Prepare chart data
  const salesChartData = stats?.dailyData?.map((day: any) => ({
    date: format(new Date(day.date), "MMM dd"),
    sales: day.sales,
    orders: day.orders,
  })) || [];

  const profitChartData = stats?.dailyData?.map((day: any) => {
    const dayOrders = stats?.recentOrders?.filter((order: any) =>
      format(new Date(order.createdAt), "yyyy-MM-dd") === day.date
    ) || [];
    const dayCost = dayOrders.reduce((sum: number, order: any) =>
      sum + order.orderItems.reduce((itemSum: number, item: any) =>
        itemSum + item.quantity * (item.product?.costPrice ?? 0), 0
      ), 0);
    return {
      date: format(new Date(day.date), "MMM dd"),
      profit: day.sales - dayCost,
      cost: dayCost,
    };
  }) || [];

  const topProductsChartData = stats?.topProducts?.slice(0, 5).map((product: any) => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name,
    sales: product.revenue,
    profit: product.profit,
  })) || [];

  const profitBreakdownData = [
    { name: "Net Sales", value: stats?.netSales || 0, fill: "hsl(var(--chart-1))" },
    { name: "Cost", value: stats?.totalCost || 0, fill: "hsl(var(--chart-2))" },
    { name: "Discount", value: stats?.totalDiscount || 0, fill: "hsl(var(--chart-3))" },
  ];

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Business Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive business analytics and insights
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/orders/new">
                <Button>New Order</Button>
              </Link>
              <Link href="/customers">
                <Button variant="outline">Customers</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Date Range Filters */}
          <div className="grid gap-4 md:grid-cols-[0.5fr_0.5fr_1fr] items-end">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start date
              </label>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End date</label>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing data from {format(new Date(dateRange.startDate), "MMM dd, yyyy")} to {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.netSales?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">
                  Gross: ${stats?.grossSales?.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.profit?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">
                  Margin: {stats?.averageMargin?.toFixed(1) || "0.0"}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: ${stats?.averageOrderValue?.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.customersCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--color-sales)"
                      fill="var(--color-sales)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit vs Cost</CardTitle>
                <CardDescription>Daily profit and cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={profitChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="var(--color-profit)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="var(--color-cost)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Sales</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={topProductsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Sales, costs, and discounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={profitBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {profitBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tables Section */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best-selling products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.topProducts?.map((product: any) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${product.profit.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products running low (≤5 units)</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.lowStockProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.lowStockProducts.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                        <Badge variant={product.stock <= 2 ? "destructive" : "secondary"}>
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No low stock alerts</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest completed orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentOrders?.slice(0, 5).map((order: any) => (
                    <div
                      key={order.id}
                      className="rounded-lg border p-4 cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderPreview(true);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {order.orderNumber}
                          </p>
                          <p className="font-medium">
                            {order.customer?.name || "Guest"}
                          </p>
                        </div>
                        <Badge variant="secondary">{order.status}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </span>
                        <span className="font-semibold">
                          $
                          {Math.max(
                            order.totalAmount - (order.discount || 0),
                            0,
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/orders" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    View all orders →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Detailed financial breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Gross Sales</p>
                  <p className="text-2xl font-bold">${stats?.grossSales?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Discount</p>
                  <p className="text-2xl font-bold text-red-600">-${stats?.totalDiscount?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Cost</p>
                  <p className="text-2xl font-bold text-orange-600">${stats?.totalCost?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Net Profit</p>
                  <p className="text-2xl font-bold text-green-600">${stats?.profit?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <OrderPreviewDialog
        open={showOrderPreview}
        onOpenChange={setShowOrderPreview}
        order={selectedOrder}
      />
    </div>
  );
}
