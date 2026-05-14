"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface OrderPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    discount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    customer?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    } | null;
    orderItems?: Array<{
      id: string;
      quantity: number;
      price: number;
      total: number;
      product: {
        id: string;
        name: string;
        sku?: string;
      };
    }>;
  } | null;
}

export function OrderPreviewDialog({
  open,
  onOpenChange,
  order,
}: OrderPreviewDialogProps) {
  if (!order) return null;

  const subtotal =
    order.orderItems?.reduce((sum, item) => sum + item.total, 0) || 0;
  const finalTotal = subtotal - order.discount;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order {order.orderNumber}</DialogTitle>
          <DialogDescription>Order Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="text-sm font-medium">
                {format(new Date(order.createdAt), "PPp")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            {order.customer && (
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="text-sm font-medium">{order.customer.name}</p>
              </div>
            )}
          </div>

          {order.customer && (
            <div className="p-3 bg-secondary rounded">
              <p className="text-sm font-medium mb-2">{order.customer.name}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                {order.customer.email && (
                  <p>Email: {order.customer.email}</p>
                )}
                {order.customer.phone && (
                  <p>Phone: {order.customer.phone}</p>
                )}
              </div>
            </div>
          )}

          <div className="border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        {item.product.sku && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {item.product.sku}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-end gap-12">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-medium">${subtotal.toFixed(2)}</p>
              </div>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-end gap-12">
                <div>
                  <p className="text-sm text-muted-foreground">Discount</p>
                  <p className="font-medium text-red-600">
                    -${order.discount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-12 pt-2 border-t">
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-lg font-bold">${finalTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
