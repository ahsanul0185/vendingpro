import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // admin, customer
  created_at: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

export const subcategories = pgTable("subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category_id: varchar("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category"),
  category_id: varchar("category_id"),
  subcategory_id: varchar("subcategory_id"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  image: text("image"),
  stock: integer("stock").notNull().default(0),
  specifications: jsonb("specifications"),
  status: text("status").notNull().default("active"), // active, inactive, out_of_stock
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  order_number: text("order_number").notNull().unique(),
  user_id: varchar("user_id"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  items_count: integer("items_count").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, processing, completed, failed, cancelled
  payment_method: text("payment_method"), // bank_transfer, cashapp, venmo, western_union
  payment_amount: decimal("payment_amount", { precision: 10, scale: 2 }),
  payment_transfer_id: text("payment_transfer_id"), // transfer proof/ID
  payment_transfer_date: timestamp("payment_transfer_date"),
  customer_info: jsonb("customer_info"), // includes shipping_address, billing_address, contact info
  assembly_scheduled_date: timestamp("assembly_scheduled_date"), // date when assembly is scheduled
  assembly_status: text("assembly_status"), // null, scheduled, completed
  assembly_completed_date: timestamp("assembly_completed_date"), // date when assembly was completed
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const order_items = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  order_id: varchar("order_id").notNull(),
  product_id: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  delivery_number: text("delivery_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, in_transit, delivered, cancelled
  delivery_date: timestamp("delivery_date"),
  items: jsonb("items").notNull(),
  notes: text("notes"),
  driver_name: text("driver_name"),
  tracking_info: jsonb("tracking_info"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const assemblies = pgTable("assemblies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // component, kit, full_machine
  components: jsonb("components").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  assigned_to: text("assigned_to"),
  estimated_time: integer("estimated_time"), // in minutes
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const maintenance_records = pgTable("maintenance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // routine, repair, inspection, cleaning
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  scheduled_date: timestamp("scheduled_date").notNull(),
  completed_date: timestamp("completed_date"),
  technician: text("technician"),
  description: text("description"),
  notes: text("notes"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  products: many(products),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.category_id],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategory_id],
    references: [subcategories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  orderItems: many(order_items),
}));

export const orderItemsRelations = relations(order_items, ({ one }) => ({
  order: one(orders, {
    fields: [order_items.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [order_items.product_id],
    references: [products.id],
  }),
}));


// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  created_at: true 
});
export const insertCategorySchema = createInsertSchema(categories).omit({ 
  id: true, 
  created_at: true 
});
export const insertSubcategorySchema = createInsertSchema(subcategories).omit({ 
  id: true, 
  created_at: true 
});
export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});
export const insertOrderItemSchema = createInsertSchema(order_items).omit({ 
  id: true, 
  created_at: true 
});
export const insertDeliverySchema = createInsertSchema(deliveries).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});
export const insertAssemblySchema = createInsertSchema(assemblies).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});
export const insertMaintenanceRecordSchema = createInsertSchema(maintenance_records).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof order_items.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

export type Assembly = typeof assemblies.$inferSelect;
export type InsertAssembly = z.infer<typeof insertAssemblySchema>;

export type MaintenanceRecord = typeof maintenance_records.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
