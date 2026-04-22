"use client";

import { useState, useEffect } from "react";
import { useCustomers, useCreateCustomer } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomerPreviewDialog } from "@/components/ui/customer-preview-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data, isLoading } = useCustomers(page, pageSize, debouncedSearch);
  const createCustomer = useCreateCustomer();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 600);

    return () => clearTimeout(timer);
  }, [search]);

  const customers = data?.customers || [];
  const total = data?.total || 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createCustomer.mutateAsync(form);
    setForm({ name: "", email: "", phone: "", address: "", notes: "" });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage customer records and preview customer details.</p>
          </div>
          <div className="w-full md:w-auto">
            <Input
              placeholder="Search customers"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Customer list</h2>
                <p className="text-sm text-muted-foreground">{customers.length} customers on this page.</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-sm">
                Page {page} / {totalPages}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Name</th>
                    <th className="py-2 px-2 text-left">Email</th>
                    <th className="py-2 px-2 text-left">Phone</th>
                    <th className="py-2 px-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Loading customers...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer: any) => (
                      <tr key={customer.id} className="border-b hover:bg-muted">
                        <td className="py-3 px-2">{customer.name}</td>
                        <td className="py-3 px-2">{customer.email || "—"}</td>
                        <td className="py-3 px-2">{customer.phone || "—"}</td>
                        <td className="py-3 px-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowPreview(true);
                            }}
                          >
                            Preview
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
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
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">New customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                Add Customer
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <CustomerPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        customer={selectedCustomer}
      />
    </div>
  );
}
