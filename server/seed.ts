import { db } from "./db";
import { products, machines, orders, deliveries, assemblies, maintenance_records } from "@shared/schema";

async function seed() {
  console.log("🌱 Starting database seed...");

  // Seed Products
  console.log("Adding products...");
  const productRecords = await db.insert(products).values([
    {
      name: "Classic Coca-Cola",
      category: "Beverages",
      price: "2.50",
      description: "Refreshing cola drink",
      stock: 120,
      status: "active",
    },
    {
      name: "Pepsi",
      category: "Beverages",
      price: "2.50",
      description: "Bold cola taste",
      stock: 95,
      status: "active",
    },
    {
      name: "Sprite",
      category: "Beverages",
      price: "2.50",
      description: "Lemon-lime soda",
      stock: 80,
      status: "active",
    },
    {
      name: "Bottled Water",
      category: "Beverages",
      price: "1.50",
      description: "Pure drinking water",
      stock: 150,
      status: "active",
    },
    {
      name: "Snickers Bar",
      category: "Snacks",
      price: "1.75",
      description: "Chocolate bar with peanuts",
      stock: 60,
      status: "active",
    },
    {
      name: "Lay's Classic Chips",
      category: "Snacks",
      price: "2.00",
      description: "Classic salted potato chips",
      stock: 45,
      status: "active",
    },
    {
      name: "Kit Kat",
      category: "Snacks",
      price: "1.75",
      description: "Crispy wafer chocolate bar",
      stock: 70,
      status: "active",
    },
    {
      name: "Doritos Nacho Cheese",
      category: "Snacks",
      price: "2.25",
      description: "Cheesy tortilla chips",
      stock: 35,
      status: "active",
    },
    {
      name: "Red Bull Energy Drink",
      category: "Beverages",
      price: "3.50",
      description: "Energy drink",
      stock: 25,
      status: "active",
    },
    {
      name: "Gatorade",
      category: "Beverages",
      price: "2.75",
      description: "Sports drink",
      stock: 40,
      status: "active",
    },
  ]).returning();
  console.log(`✓ Added ${productRecords.length} products`);

  // Seed Machines
  console.log("Adding machines...");
  const machineRecords = await db.insert(machines).values([
    {
      name: "VM-001",
      location: "Main Office Lobby",
      status: "online",
      stock_level: 75,
      daily_sales: "245.50",
      total_transactions: 98,
      last_maintenance: new Date("2025-09-15"),
      next_maintenance: new Date("2025-11-15"),
    },
    {
      name: "VM-002",
      location: "Factory Floor A",
      status: "online",
      stock_level: 60,
      daily_sales: "189.25",
      total_transactions: 76,
      last_maintenance: new Date("2025-09-20"),
      next_maintenance: new Date("2025-11-20"),
    },
    {
      name: "VM-003",
      location: "Break Room B",
      status: "maintenance",
      stock_level: 20,
      daily_sales: "45.00",
      total_transactions: 18,
      last_maintenance: new Date("2025-08-30"),
      next_maintenance: new Date("2025-10-30"),
    },
    {
      name: "VM-004",
      location: "Cafeteria",
      status: "online",
      stock_level: 85,
      daily_sales: "312.75",
      total_transactions: 125,
      last_maintenance: new Date("2025-09-25"),
      next_maintenance: new Date("2025-11-25"),
    },
    {
      name: "VM-005",
      location: "Gym Entrance",
      status: "online",
      stock_level: 55,
      daily_sales: "178.50",
      total_transactions: 71,
      last_maintenance: new Date("2025-09-10"),
      next_maintenance: new Date("2025-11-10"),
    },
  ]).returning();
  console.log(`✓ Added ${machineRecords.length} machines`);

  // Seed Orders
  console.log("Adding orders...");
  const orderRecords = await db.insert(orders).values([
    {
      order_number: "ORD-2025-001",
      machine_id: machineRecords[0].id,
      total_amount: "5.00",
      items_count: 2,
      status: "completed",
      payment_method: "credit_card",
      customer_info: { name: "John Smith" },
      created_at: new Date("2025-10-06T08:30:00"),
    },
    {
      order_number: "ORD-2025-002",
      machine_id: machineRecords[1].id,
      total_amount: "3.50",
      items_count: 1,
      status: "completed",
      payment_method: "cash",
      customer_info: { name: "Jane Doe" },
      created_at: new Date("2025-10-06T09:15:00"),
    },
    {
      order_number: "ORD-2025-003",
      machine_id: machineRecords[3].id,
      total_amount: "7.25",
      items_count: 3,
      status: "completed",
      payment_method: "mobile",
      customer_info: { name: "Bob Johnson" },
      created_at: new Date("2025-10-06T10:00:00"),
    },
    {
      order_number: "ORD-2025-004",
      machine_id: machineRecords[0].id,
      total_amount: "2.50",
      items_count: 1,
      status: "paid",
      payment_method: "credit_card",
      customer_info: { name: "Alice Williams" },
      created_at: new Date("2025-10-06T11:30:00"),
    },
    {
      order_number: "ORD-2025-005",
      machine_id: machineRecords[4].id,
      total_amount: "4.25",
      items_count: 2,
      status: "processing",
      payment_method: "debit_card",
      customer_info: { name: "Mike Brown" },
      created_at: new Date("2025-10-06T12:00:00"),
    },
    {
      order_number: "ORD-2025-006",
      machine_id: machineRecords[1].id,
      total_amount: "6.00",
      items_count: 3,
      status: "pending",
      payment_method: "mobile",
      customer_info: { name: "Sarah Davis" },
      created_at: new Date("2025-10-06T13:00:00"),
    },
  ]).returning();
  console.log(`✓ Added ${orderRecords.length} orders`);

  // Seed Deliveries
  console.log("Adding deliveries...");
  const deliveryRecords = await db.insert(deliveries).values([
    {
      delivery_number: "DEL-2025-001",
      machine_id: machineRecords[0].id,
      status: "delivered",
      delivery_date: new Date("2025-10-05"),
      items: [
        { product: "Coca-Cola", quantity: 24 },
        { product: "Snickers", quantity: 12 },
      ],
      notes: "Delivered on time",
      driver_name: "Tom Wilson",
      tracking_info: { signature: "Received by manager" },
    },
    {
      delivery_number: "DEL-2025-002",
      machine_id: machineRecords[1].id,
      status: "in_transit",
      delivery_date: new Date("2025-10-07"),
      items: [
        { product: "Pepsi", quantity: 20 },
        { product: "Chips", quantity: 15 },
      ],
      notes: "Expected delivery tomorrow",
      driver_name: "Emma Clark",
      tracking_info: { location: "En route to Factory Floor A" },
    },
    {
      delivery_number: "DEL-2025-003",
      machine_id: machineRecords[3].id,
      status: "pending",
      delivery_date: new Date("2025-10-08"),
      items: [
        { product: "Water", quantity: 30 },
        { product: "Gatorade", quantity: 18 },
      ],
      notes: "Scheduled for Monday",
      driver_name: "David Martinez",
      tracking_info: { warehouse: "Pending dispatch" },
    },
  ]).returning();
  console.log(`✓ Added ${deliveryRecords.length} deliveries`);

  // Seed Assemblies
  console.log("Adding assemblies...");
  const assemblyRecords = await db.insert(assemblies).values([
    {
      name: "New Vending Machine Assembly",
      type: "full_machine",
      components: [
        { name: "Display Panel", quantity: 1 },
        { name: "Payment Module", quantity: 1 },
        { name: "Product Dispensers", quantity: 12 },
        { name: "Cooling Unit", quantity: 1 },
      ],
      status: "in_progress",
      priority: "high",
      assigned_to: "Tech Team A",
      estimated_time: 480,
      notes: "For new location opening next week",
    },
    {
      name: "Replacement Payment System",
      type: "component",
      components: [
        { name: "Card Reader", quantity: 1 },
        { name: "Bill Acceptor", quantity: 1 },
        { name: "Coin Mechanism", quantity: 1 },
      ],
      status: "completed",
      priority: "urgent",
      assigned_to: "Tech Team B",
      estimated_time: 120,
      notes: "Completed for VM-003",
    },
    {
      name: "Maintenance Kit Assembly",
      type: "kit",
      components: [
        { name: "Filters", quantity: 5 },
        { name: "Belts", quantity: 3 },
        { name: "Sensors", quantity: 4 },
      ],
      status: "pending",
      priority: "normal",
      assigned_to: "Tech Team A",
      estimated_time: 90,
      notes: "Prepare for monthly maintenance",
    },
  ]).returning();
  console.log(`✓ Added ${assemblyRecords.length} assemblies`);

  // Seed Maintenance Records
  console.log("Adding maintenance records...");
  const maintenanceRecordsData = await db.insert(maintenance_records).values([
    {
      machine_id: machineRecords[0].id,
      type: "routine",
      priority: "normal",
      status: "completed",
      scheduled_date: new Date("2025-09-15"),
      completed_date: new Date("2025-09-15"),
      technician: "John Tech",
      description: "Regular maintenance check",
      notes: "All systems normal",
      cost: "125.00",
    },
    {
      machine_id: machineRecords[2].id,
      type: "repair",
      priority: "high",
      status: "in_progress",
      scheduled_date: new Date("2025-10-06"),
      technician: "Sarah Mechanic",
      description: "Payment system malfunction",
      notes: "Replacing card reader module",
      cost: "350.00",
    },
    {
      machine_id: machineRecords[1].id,
      type: "inspection",
      priority: "normal",
      status: "scheduled",
      scheduled_date: new Date("2025-10-10"),
      technician: "Mike Inspector",
      description: "Monthly safety inspection",
      notes: "Standard compliance check",
      cost: "75.00",
    },
    {
      machine_id: machineRecords[3].id,
      type: "cleaning",
      priority: "low",
      status: "scheduled",
      scheduled_date: new Date("2025-10-12"),
      technician: "Cleaning Crew",
      description: "Deep cleaning and sanitization",
      notes: "High traffic area requires thorough cleaning",
      cost: "100.00",
    },
  ]).returning();
  console.log(`✓ Added ${maintenanceRecordsData.length} maintenance records`);

  console.log("✅ Database seeding completed successfully!");
  console.log(`
  Summary:
  - ${productRecords.length} products
  - ${machineRecords.length} machines
  - ${orderRecords.length} orders
  - ${deliveryRecords.length} deliveries
  - ${assemblyRecords.length} assemblies
  - ${maintenanceRecordsData.length} maintenance records
  `);
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .then(() => {
    console.log("👋 Seeding process finished");
    process.exit(0);
  });
