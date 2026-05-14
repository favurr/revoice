import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ====== ORDERS ======

export const useOrders = (
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 10,
  status?: string,
) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (status && status !== "all") params.append("status", status);
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));

  return useQuery({
    queryKey: ["orders", startDate, endDate, page, pageSize, status],
    queryFn: async () => {
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId?: string) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });      queryClient.invalidateQueries({ queryKey: ["customers"] });      toast.success("Order created");
    },
    onError: () => {
      toast.error("Failed to create order");
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Order updated");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
};

// ====== ORDER ITEMS ======

export const useAddOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      productId,
      quantity,
      price,
    }: {
      orderId: string;
      productId: string;
      quantity: number;
      price: number;
    }) => {
      const res = await fetch("/api/order-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, productId, quantity, price }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Item added");
    },
    onError: () => {
      toast.error("Failed to add item");
    },
  });
};

export const useRemoveOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      orderId,
    }: {
      itemId: string;
      orderId: string;
    }) => {
      const res = await fetch(
        `/api/order-items?id=${itemId}&orderId=${orderId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed to remove item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Item removed");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });
};

// ====== PRODUCTS ======

export const useProducts = (isActive?: boolean) => {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.append("isActive", isActive.toString());

  return useQuery({
    queryKey: ["products", isActive],
    queryFn: async () => {
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      price,
      costPrice,
      stock,
      sku,
    }: {
      name: string;
      price: number;
      costPrice?: number;
      stock?: number;
      sku?: string;
    }) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, costPrice, stock, sku }),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
    },
    onError: () => {
      toast.error("Failed to create product");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      name,
      price,
      costPrice,
      stock,
      sku,
    }: {
      productId: string;
      name?: string;
      price?: number;
      costPrice?: number;
      stock?: number;
      sku?: string;
    }) => {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, price, costPrice, stock, sku }),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "products"
      });
      toast.success("Product deleted");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });
};

// ====== CUSTOMERS ======

export const useCustomers = (page = 1, pageSize = 10, search?: string) => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));
  if (search) params.append("search", search);

  return useQuery({
    queryKey: ["customers", page, pageSize, search],
    queryFn: async () => {
      const res = await fetch(`/api/customers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      phone,
      address,
      notes,
    }: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
    }) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address, notes }),
      });
      if (!res.ok) throw new Error("Failed to create customer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created");
    },
    onError: () => {
      toast.error("Failed to create customer");
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      name,
      email,
      phone,
      address,
      notes,
    }: {
      customerId: string;
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
    }) => {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          name,
          email,
          phone,
          address,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated");
    },
    onError: () => {
      toast.error("Failed to update customer");
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete customer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });
};

// ====== DASHBOARD ======

export const useDashboardStats = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  return useQuery({
    queryKey: ["dashboardStats", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats?${params}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 30000,
  });
};
