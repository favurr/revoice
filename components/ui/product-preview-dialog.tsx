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

interface ProductPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    sku?: string;
    price: number;
    costPrice: number;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export function ProductPreviewDialog({
  open,
  onOpenChange,
  product,
}: ProductPreviewDialogProps) {
  if (!product) return null;

  const profit = product.price - product.costPrice;
  const profitMargin = (
    ((product.price - product.costPrice) / product.price) *
    100
  ).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Product Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="text-sm font-medium">{product.sku || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock</p>
              <p className="text-sm font-medium">{product.stock} units</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Selling Price</span>
              <span className="font-medium">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost Price</span>
              <span className="font-medium">${product.costPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between bg-secondary p-2 rounded">
              <span className="text-sm text-muted-foreground">Profit per Unit</span>
              <span className="font-medium">${profit.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit Margin</span>
              <span className="font-medium">{profitMargin}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={product.isActive ? "default" : "secondary"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>Created: {format(new Date(product.createdAt), "PPp")}</p>
            <p>Updated: {format(new Date(product.updatedAt), "PPp")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
