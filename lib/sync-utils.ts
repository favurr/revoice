import { createClient } from "@supabase/supabase-js";
import prisma from "./prisma";

const supabaseUrl = process.env.SUPABASE_SYNC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SYNC_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase sync environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Sync Orders to Supabase
 * This is a utility function for syncing local SQLite data to Supabase
 */
export async function syncOrdersToSupabase() {
  try {
    // Get all completed orders from local database
    const orders = await prisma.order.findMany({
      where: { status: "completed" },
      include: { orderItems: { include: { product: true } } },
    });

    if (orders.length === 0) return;

    // Prepare data for Supabase
    const ordersForSupabase = orders.map((order) => ({
      id: order.id,
      order_number: order.orderNumber,
      total_amount: order.totalAmount,
      status: order.status,
      created_at: order.createdAt.toISOString(),
      user_id: order.userId,
    }));

    // Upsert orders to Supabase
    const { error: ordersError } = await supabase
      .from("orders")
      .upsert(ordersForSupabase, { onConflict: "id" });

    if (ordersError) {
      console.error("Error syncing orders:", ordersError);
      return false;
    }

    // Sync order items
    const orderItemsForSupabase = orders
      .flatMap((order) =>
        order.orderItems.map((item) => ({
          id: item.id,
          order_id: item.orderId,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          created_at: order.createdAt.toISOString(),
        })),
      )
      .filter(Boolean);

    if (orderItemsForSupabase.length > 0) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .upsert(orderItemsForSupabase, { onConflict: "id" });

      if (itemsError) {
        console.error("Error syncing order items:", itemsError);
        return false;
      }
    }

    // Sync products
    const products = await prisma.product.findMany();
    const productsForSupabase = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      is_active: product.isActive,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    }));

    const { error: productsError } = await supabase
      .from("products")
      .upsert(productsForSupabase, { onConflict: "id" });

    if (productsError) {
      console.error("Error syncing products:", productsError);
      return false;
    }

    console.log("Sync completed successfully");
    return true;
  } catch (error) {
    console.error("Sync error:", error);
    return false;
  }
}

/**
 * Pull remote data from Supabase to local database
 * This can be useful for initial setup or periodic updates
 */
export async function pullRemoteData() {
  try {
    // Fetch products from Supabase
    const { data: remoteProducts, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return false;
    }

    // Update local products
    if (remoteProducts) {
      for (const product of remoteProducts) {
        await prisma.product.upsert({
          where: { id: product.id },
          update: {
            name: product.name,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            isActive: product.is_active,
          },
          create: {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            isActive: product.is_active,
          },
        });
      }
    }

    console.log("Pull completed successfully");
    return true;
  } catch (error) {
    console.error("Pull error:", error);
    return false;
  }
}
