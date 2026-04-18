import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateOrderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, quantity, price } =
      CreateOrderItemSchema.parse(body);

    // Calculate total
    const total = quantity * price;

    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        quantity,
        price,
        total,
      },
      include: {
        product: true,
      },
    });

    // Update order total using all items for the order
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount },
    });

    return NextResponse.json(orderItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error creating order item:", error);
    return NextResponse.json(
      { error: "Failed to create order item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");
    const orderId = searchParams.get("orderId");

    if (!itemId || !orderId) {
      return NextResponse.json(
        { error: "Item ID and Order ID are required" },
        { status: 400 },
      );
    }

    // Get item before deletion
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 },
      );
    }

    // Delete order item
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Recalculate order total
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const totalAmount = remainingItems.reduce((sum, i) => sum + i.total, 0);

    await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order item:", error);
    return NextResponse.json(
      { error: "Failed to delete order item" },
      { status: 500 },
    );
  }
}
