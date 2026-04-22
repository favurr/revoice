"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useOrders } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderPreviewDialog } from "@/components/ui/order-preview-dialog";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OrdersPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data, isLoading } = useOrders(startDate, endDate, page, pageSize, status);
  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">Browse orders with filters and preview details.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/orders/new">
              <Button>New Order</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setStatus("all");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Order list</h2>
                <p className="text-sm text-muted-foreground">
                  Showing {orders.length} of {total} orders.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-muted px-3 py-1 text-sm">
                  Page {page} / {totalPages}
                </span>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2 text-left">Order #</th>
                    <th className="py-3 px-2 text-left">Customer</th>
                    <th className="py-3 px-2 text-left">Status</th>
                    <th className="py-3 px-2 text-left">Items</th>
                    <th className="py-3 px-2 text-left">Total</th>
                    <th className="py-3 px-2 text-left">Date</th>
                    <th className="py-3 px-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order: any) => {
                      const netTotal = Math.max(order.totalAmount - (order.discount || 0), 0);
                      return (
                        <tr key={order.id} className="border-b hover:bg-muted">
                          <td className="py-3 px-2">{order.orderNumber}</td>
                          <td className="py-3 px-2">{order.customer?.name || order.user?.name || "—"}</td>
                          <td className="py-3 px-2">
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-2">{order.orderItems?.length || 0}</td>
                          <td className="py-3 px-2 font-semibold">${netTotal.toFixed(2)}</td>
                          <td className="py-3 px-2">{format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</td>
                          <td className="py-3 px-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowPreview(true);
                              }}
                            >
                              Preview
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="inline-flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <OrderPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        order={selectedOrder}
      />
    </div>
  );
}