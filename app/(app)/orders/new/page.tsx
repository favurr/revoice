"use client";

import {
  useAddOrderItem,
  useProducts,
  useCustomers,
  useRemoveOrderItem,
} from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NewOrderPage() {
  const router = useRouter();
  const addItemMutation = useAddOrderItem();
  const removeItemMutation = useRemoveOrderItem();
  const { data: products } = useProducts(true);
  const { data: customers } = useCustomers(1, 50, "");

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(false);

  const fetchCurrentOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders?orderId=${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  };

  useEffect(() => {
    const initializeOrder = async () => {
      if (isInitializing || currentOrder) return;

      setIsInitializing(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const order = await res.json();
          setCurrentOrder(order);
          setDiscount(order.discount ?? 0);
          setSelectedCustomerId(order.customerId || "");
        }
      } catch (error) {
        toast.error("Failed to create order");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeOrder();
  }, [isInitializing, currentOrder]);

  const refreshOrder = async () => {
    if (!currentOrder?.id) return;
    try {
      const order = await fetchCurrentOrder(currentOrder.id);
      setCurrentOrder(order);
      setDiscount(order.discount || 0);
      setSelectedCustomerId(order.customerId || "");
    } catch {
      toast.error("Failed to refresh order");
    }
  };

  const handleAddItem = async () => {
    if (!selectedProduct || !currentOrder) {
      toast.error("Please select a product");
      return;
    }

    const product = products?.find((p: any) => p.id === selectedProduct);
    if (!product) return;

    try {
      await addItemMutation.mutateAsync({
        orderId: currentOrder.id,
        productId: selectedProduct,
        quantity,
        price: product.price,
      });

      await refreshOrder();
      setSelectedProduct("");
      setQuantity(1);
      setIsAddItemOpen(false);
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!currentOrder?.id) return;
    try {
      await removeItemMutation.mutateAsync({
        itemId,
        orderId: currentOrder.id,
      });
      await refreshOrder();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleCompleteOrder = async () => {
    if (!currentOrder?.orderItems?.length) {
      toast.error("Add items before completing order");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrder.id,
          status: "completed",
          discount,
          customerId: selectedCustomerId || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Order completed!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to complete order");
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder?.id) return;
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrder.id,
          status: "cancelled",
        }),
      });
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const subtotal = currentOrder?.orderItems?.reduce(
    (sum: number, item: any) => sum + item.total,
    0,
  ) || 0;
  const netTotal = Math.max(subtotal - discount, 0);

  if (!currentOrder) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">New Order</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <Card className="p-6">
                <div className="grid gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select customer (optional)</option>
                      {customers?.customers?.map((customer: any) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.email ? `(${customer.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">+ Add Item</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Item to Order</DialogTitle>
                        <DialogDescription>
                          Select a product, quantity, and apply any item-specific discount.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Product *</label>
                          <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                          >
                            <option value="">Select a product</option>
                            {products?.map((product: any) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                              </option>
                            ))}
                          </select>
                          {selectedProduct && (
                            <div className="mt-3 p-3 bg-secondary rounded text-sm">
                              {(() => {
                                const product = products?.find((p: any) => p.id === selectedProduct);
                                return product ? (
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">SKU:</span>
                                      <span className="font-medium">{product.sku || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Selling Price:</span>
                                      <span className="font-medium">${product.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Cost Price:</span>
                                      <span className="font-medium">${product.costPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Available Stock:</span>
                                      <span className="font-medium">{product.stock} units</span>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Quantity *</label>
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full"
                            placeholder="Enter quantity"
                          />
                        </div>

                        {selectedProduct && (
                          <div className="space-y-2">
                            <div className="rounded-lg border bg-muted p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Unit Price:</span>
                                  <span>${(products?.find((p: any) => p.id === selectedProduct)?.price || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Quantity:</span>
                                  <span>{quantity}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold">
                                  <span>Line Total:</span>
                                  <span>${((products?.find((p: any) => p.id === selectedProduct)?.price || 0) * quantity).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter className="gap-2 flex flex-row justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsAddItemOpen(false);
                            setSelectedProduct("");
                            setQuantity(1);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddItem}
                          disabled={!selectedProduct || quantity < 1}
                        >
                          Add to Order
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {currentOrder?.orderItems?.length ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Product</th>
                            <th className="text-left py-2">Qty</th>
                            <th className="text-left py-2">Price</th>
                            <th className="text-left py-2">Total</th>
                            <th className="text-left py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentOrder.orderItems.map((item: any) => (
                            <tr key={item.id} className="border-b hover:bg-muted">
                              <td className="py-2">{item.product?.name}</td>
                              <td className="py-2">{item.quantity}</td>
                              <td className="py-2">${item.price.toFixed(2)}</td>
                              <td className="py-2 font-semibold">${item.total.toFixed(2)}</td>
                              <td className="py-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted-foreground">No items added yet</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 sticky top-8">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order #</span>
                    <span className="font-medium">{currentOrder.orderNumber}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">
                      {currentOrder.orderItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Discount</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${netTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCompleteOrder} className="w-full" size="lg">
                  Complete Order
                </Button>

                <Button variant="outline" className="w-full mt-2" onClick={handleCancelOrder}>
                  Cancel Order
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
