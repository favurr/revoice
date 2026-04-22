import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  costPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
});

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const whereClause: any = {};
    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, costPrice, stock, sku } = CreateProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name,
        price,
        costPrice: costPrice || 0,
        stock: stock || 0,
        sku: sku || undefined,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, ...updateData } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const { name, price, costPrice, stock, sku } = UpdateProductSchema.parse(updateData);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(price && { price }),
        ...(costPrice !== undefined && { costPrice }),
        ...(stock !== undefined && { stock }),
        ...(sku && { sku }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Soft delete by marking as inactive
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
