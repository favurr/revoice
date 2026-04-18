"use client";

import {
  useCreateOrder,
  useAddOrderItem,
  useProducts,
  useOrders,
} from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function NewOrderPage() {
  const router = useRouter();
  const createOrderMutation = useCreateOrder();
  const addItemMutation = useAddOrderItem();
  const { data: products } = useProducts(true);
  const { data: orders } = useOrders();

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Create order on page load
  useEffect(() => {
    const initializeOrder = async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const order = await res.json();
          setCurrentOrder(order);
        }
      } catch (error) {
        toast.error("Failed to create order");
      }
    };

    initializeOrder();
  }, []);

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

      // Refresh order data
      const updatedOrder = await fetch(`/api/orders`).then((r) => r.json());
      const order = updatedOrder.find((o: any) => o.id === currentOrder.id);
      setCurrentOrder(order);

      setSelectedProduct("");
      setQuantity(1);
    } catch (error) {
      toast.error("Failed to add item");
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

  if (!currentOrder) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Products Selection */}
            <div className="col-span-2">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Add Products</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Product
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select a product</option>
                      {products?.map((product: any) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price.toFixed(2)} (Stock:{" "}
                          {product.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <Button onClick={handleAddItem} className="w-full">
                    Add Item
                  </Button>
                </div>

                {/* Order Items */}
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
                          </tr>
                        </thead>
                        <tbody>
                          {currentOrder.orderItems.map((item: any) => (
                            <tr key={item.id} className="border-b">
                              <td className="py-2">{item.product?.name}</td>
                              <td className="py-2">{item.quantity}</td>
                              <td className="py-2">${item.price.toFixed(2)}</td>
                              <td className="py-2 font-semibold">
                                ${item.total.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted-foreground">
                        No items added yet
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-8">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order #</span>
                    <span className="font-medium">
                      {currentOrder.orderNumber}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">
                      {currentOrder.orderItems?.reduce(
                        (sum: number, item: any) => sum + item.quantity,
                        0,
                      ) || 0}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${currentOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCompleteOrder}
                  className="w-full"
                  size="lg"
                >
                  Complete Order
                </Button>

                <Button variant="outline" className="w-full mt-2">
                  Cancel
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
