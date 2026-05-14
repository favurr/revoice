"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CustomerPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    orders?: any[];
  } | null;
}

export function CustomerPreviewDialog({
  open,
  onOpenChange,
  customer,
}: CustomerPreviewDialogProps) {
  if (!customer) return null;

  const totalOrders = customer.orders?.length || 0;
  const totalSpent =
    customer.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{customer.name}</DialogTitle>
          <DialogDescription>Customer Information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            {customer.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium break-all">{customer.email}</p>
              </div>
            )}
            {customer.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{customer.phone}</p>
              </div>
            )}
            {customer.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{customer.address}</p>
              </div>
            )}
          </div>

          {customer.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <p className="text-sm bg-secondary p-2 rounded">
                {customer.notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="bg-secondary p-3 rounded">
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold">{totalOrders}</p>
            </div>
            <div className="bg-secondary p-3 rounded">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-lg font-bold">${totalSpent.toFixed(2)}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>Created: {format(new Date(customer.createdAt), "PPp")}</p>
            <p>Updated: {format(new Date(customer.updatedAt), "PPp")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
