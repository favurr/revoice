import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateOrderSchema = z.object({
  userId: z.string().optional(),
  customerId: z.string().optional(),
});

const UpdateOrderSchema = z.object({
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  discount: z.number().nonnegative().optional(),
  customerId: z.string().optional(),
  totalAmount: z.number().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          customer: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(order);
    }

    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.findMany({
        where: whereClause,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          customer: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({ orders, total, page, pageSize });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, customerId } = CreateOrderSchema.parse(body);

    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || undefined,
        customerId: customerId || undefined,
        status: "pending",
      },
      include: {
        orderItems: true,
        user: true,
        customer: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, ...updateData } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const { status, discount, customerId, totalAmount } =
      UpdateOrderSchema.parse(updateData);

    // Get current order to check if status is changing to completed
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // If status is changing to completed, reduce stock
    if (status === "completed" && currentOrder.status !== "completed") {
      // Use a transaction to ensure stock reduction is atomic
      await prisma.$transaction(async (tx) => {
        for (const item of currentOrder.orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: product.stock - item.quantity,
            },
          });
        }
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(discount !== undefined && { discount }),
        ...(customerId !== undefined && { customerId }),
        ...(totalAmount !== undefined && { totalAmount }),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
        customer: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
