import prisma from "@/lib/prisma";

async function main() {
  console.log("Seeding database...");

  // Clear existing products
  await prisma.product.deleteMany();

  // Seed products
  const products = [
    { name: "Coffee", price: 3.99, stock: 100, sku: "COFFEE-001" },
    { name: "Tea", price: 2.99, stock: 80, sku: "TEA-001" },
    { name: "Sandwich", price: 7.99, stock: 50, sku: "SAND-001" },
    { name: "Salad", price: 5.99, stock: 60, sku: "SALAD-001" },
    { name: "Pastry", price: 4.99, stock: 40, sku: "PAST-001" },
    { name: "Juice", price: 2.49, stock: 90, sku: "JUICE-001" },
    { name: "Water", price: 1.99, stock: 120, sku: "WATER-001" },
    { name: "Smoothie", price: 4.49, stock: 30, sku: "SMOOTH-001" },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Database seeded!");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
