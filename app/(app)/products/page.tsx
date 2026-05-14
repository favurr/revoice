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
import { ProductPreviewDialog } from "@/components/ui/product-preview-dialog";
import Link from "next/link";
import { useState } from "react";
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

export default function ProductsPage() {
  const { data: products } = useProducts(true); // Only show active products
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    costPrice: "",
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
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
          stock: formData.stock ? parseInt(formData.stock) : undefined,
          sku: formData.sku || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          price: parseFloat(formData.price),
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
          stock: formData.stock ? parseInt(formData.stock) : 0,
          sku: formData.sku || undefined,
        });
      }

      setFormData({ name: "", price: "", costPrice: "", stock: "", sku: "" });
      setEditingId(null);
      setShowAddDialog(false);
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || "0",
      stock: product.stock.toString(),
      sku: product.sku || "",
    });
    setEditingId(product.id);
    setShowAddDialog(true);
  };

  const handleAdd = () => {
    setFormData({ name: "", price: "", costPrice: "", stock: "", sku: "" });
    setEditingId(null);
    setShowAddDialog(true);
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
      <header className="bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <nav className="flex gap-4">
            <Button onClick={handleAdd}>
              Add Product
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Products Table */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Product List</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">SKU</th>
                    <th className="text-left py-2 px-2">Cost</th>
                    <th className="text-left py-2 px-2">Price</th>
                    <th className="text-left py-2 px-2">Profit</th>
                    <th className="text-left py-2 px-2">Stock</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product: any) => (
                    <tr key={product.id} className="border-b hover:bg-muted">
                      <td className="py-3 px-2">{product.name}</td>
                      <td className="py-3 px-2">{product.sku || "-"}</td>
                      <td className="py-3 px-2">${product.costPrice?.toFixed(2) || "0.00"}</td>
                      <td className="py-3 px-2 font-semibold">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={product.price - (product.costPrice || 0) > 0 ? "text-green-600" : "text-red-600"}>
                          ${(product.price - (product.costPrice || 0)).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-2">{product.stock}</td>
                      <td className="py-3 px-2 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowPreview(true);
                          }}
                        >
                          Preview
                        </Button>
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "Update product information" : "Create a new product in your inventory"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Selling Price *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cost Price
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ProductPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        product={selectedProduct}
      />
    </div>
  );
}
