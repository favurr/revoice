"use client";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const { data: products } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    sku: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Name and price are required");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          productId: editingId,
          name: formData.name,
          price: parseFloat(formData.price),
          stock: formData.stock ? parseInt(formData.stock) : undefined,
          sku: formData.sku || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          price: parseFloat(formData.price),
          stock: formData.stock ? parseInt(formData.stock) : 0,
          sku: formData.sku || undefined,
        });
      }

      setFormData({ name: "", price: "", stock: "", sku: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      sku: product.sku || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/orders/new">
              <Button>New Order</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ name: "", price: "", stock: "", sku: "" });
              }}
            >
              {showForm ? "Cancel" : "Add Product"}
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">
                {editingId ? "Edit Product" : "New Product"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"}
                </Button>
              </form>
            </Card>
          )}

          {/* Products Table */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Product List</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">SKU</th>
                    <th className="text-left py-2 px-2">Price</th>
                    <th className="text-left py-2 px-2">Stock</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product: any) => (
                    <tr key={product.id} className="border-b hover:bg-muted">
                      <td className="py-3 px-2">{product.name}</td>
                      <td className="py-3 px-2">{product.sku || "-"}</td>
                      <td className="py-3 px-2 font-semibold">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">{product.stock}</td>
                      <td className="py-3 px-2 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </Button>
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
