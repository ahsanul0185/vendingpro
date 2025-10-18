import { 
  users,
  categories,
  subcategories,
  products,
  orders,
  order_items,
  deliveries,
  assemblies,
  maintenance_records,
  type Category,
  type InsertCategory,
  type Subcategory,
  type InsertSubcategory,
  type Product, 
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Delivery,
  type InsertDelivery,
  type Assembly,
  type InsertAssembly,
  type MaintenanceRecord,
  type InsertMaintenanceRecord,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: InsertCategory): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;
  getCategoriesWithSubcategories(): Promise<any[]>;

  // Subcategory methods
  getAllSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]>;
  getSubcategoryById(id: string): Promise<Subcategory | undefined>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: string, subcategory: InsertSubcategory): Promise<Subcategory | undefined>;
  deleteSubcategory(id: string): Promise<void>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Order methods
  getAllOrders(limit?: number): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: InsertOrder): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  scheduleAssembly(id: string, scheduledDate: Date): Promise<Order | undefined>;
  updateAssemblyStatus(id: string, status: string): Promise<Order | undefined>;
  getDeliveredOrdersWithDetails(): Promise<any[]>;

  // Order item methods
  getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Delivery methods
  getAllDeliveries(): Promise<Delivery[]>;
  getDeliveryById(id: string): Promise<Delivery | undefined>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, delivery: InsertDelivery): Promise<Delivery | undefined>;

  // Assembly methods
  getAllAssemblies(): Promise<Assembly[]>;
  getAssemblyById(id: string): Promise<Assembly | undefined>;
  createAssembly(assembly: InsertAssembly): Promise<Assembly>;
  updateAssembly(id: string, assembly: InsertAssembly): Promise<Assembly | undefined>;

  // Maintenance methods
  getAllMaintenanceRecords(): Promise<MaintenanceRecord[]>;
  getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | undefined>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: string, record: InsertMaintenanceRecord): Promise<MaintenanceRecord | undefined>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  }>;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: string, category: InsertCategory): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getCategoriesWithSubcategories(): Promise<any[]> {
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    const allSubcategories = await db.select().from(subcategories).orderBy(subcategories.name);

    return allCategories.map(category => ({
      ...category,
      subcategories: allSubcategories.filter(sub => sub.category_id === category.id)
    }));
  }

  // Subcategory methods
  async getAllSubcategories(): Promise<Subcategory[]> {
    return await db.select().from(subcategories).orderBy(subcategories.name);
  }

  async getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]> {
    return await db.select().from(subcategories).where(eq(subcategories.category_id, categoryId)).orderBy(subcategories.name);
  }

  async getSubcategoryById(id: string): Promise<Subcategory | undefined> {
    const [subcategory] = await db.select().from(subcategories).where(eq(subcategories.id, id));
    return subcategory || undefined;
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const [newSubcategory] = await db
      .insert(subcategories)
      .values(subcategory)
      .returning();
    return newSubcategory;
  }

  async updateSubcategory(id: string, subcategory: InsertSubcategory): Promise<Subcategory | undefined> {
    const [updatedSubcategory] = await db
      .update(subcategories)
      .set(subcategory)
      .where(eq(subcategories.id, id))
      .returning();
    return updatedSubcategory || undefined;
  }

  async deleteSubcategory(id: string): Promise<void> {
    await db.delete(subcategories).where(eq(subcategories.id, id));
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, product: InsertProduct): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order methods
  async getAllOrders(limit?: number): Promise<Order[]> {
    let query = db.select().from(orders).orderBy(desc(orders.created_at));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrder(id: string, order: InsertOrder): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set(order)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updated_at: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async scheduleAssembly(id: string, scheduledDate: Date): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        assembly_scheduled_date: scheduledDate,
        assembly_status: 'scheduled',
        updated_at: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async updateAssemblyStatus(id: string, status: string): Promise<Order | undefined> {
    const updateData: any = { 
      assembly_status: status,
      updated_at: new Date() 
    };
    
    if (status === 'completed') {
      updateData.assembly_completed_date = new Date();
    }
    
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async getDeliveredOrdersWithDetails(): Promise<any[]> {
    const deliveredOrders = await db
      .select({
        order_id: orders.id,
        order_number: orders.order_number,
        total_amount: orders.total_amount,
        items_count: orders.items_count,
        payment_method: orders.payment_method,
        created_at: orders.created_at,
        customer_info: orders.customer_info,
        user_id: orders.user_id,
        username: users.username,
        email: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.user_id, users.id))
      .where(eq(orders.status, 'completed'))
      .orderBy(desc(orders.created_at));

    return deliveredOrders;
  }

  // Order item methods
  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(order_items).where(eq(order_items.order_id, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(order_items)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  // Delivery methods
  async getAllDeliveries(): Promise<Delivery[]> {
    return await db.select().from(deliveries).orderBy(desc(deliveries.created_at));
  }

  async getDeliveryById(id: string): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery || undefined;
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    const [newDelivery] = await db
      .insert(deliveries)
      .values(delivery)
      .returning();
    return newDelivery;
  }

  async updateDelivery(id: string, delivery: InsertDelivery): Promise<Delivery | undefined> {
    const [updatedDelivery] = await db
      .update(deliveries)
      .set(delivery)
      .where(eq(deliveries.id, id))
      .returning();
    return updatedDelivery || undefined;
  }

  // Assembly methods
  async getAllAssemblies(): Promise<Assembly[]> {
    return await db.select().from(assemblies).orderBy(desc(assemblies.created_at));
  }

  async getAssemblyById(id: string): Promise<Assembly | undefined> {
    const [assembly] = await db.select().from(assemblies).where(eq(assemblies.id, id));
    return assembly || undefined;
  }

  async createAssembly(assembly: InsertAssembly): Promise<Assembly> {
    const [newAssembly] = await db
      .insert(assemblies)
      .values(assembly)
      .returning();
    return newAssembly;
  }

  async updateAssembly(id: string, assembly: InsertAssembly): Promise<Assembly | undefined> {
    const [updatedAssembly] = await db
      .update(assemblies)
      .set(assembly)
      .where(eq(assemblies.id, id))
      .returning();
    return updatedAssembly || undefined;
  }

  // Maintenance methods
  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenance_records).orderBy(desc(maintenance_records.created_at));
  }

  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenance_records).where(eq(maintenance_records.id, id));
    return record || undefined;
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db
      .insert(maintenance_records)
      .values(record)
      .returning();
    return newRecord;
  }

  async updateMaintenanceRecord(id: string, record: InsertMaintenanceRecord): Promise<MaintenanceRecord | undefined> {
    const [updatedRecord] = await db
      .update(maintenance_records)
      .set(record)
      .where(eq(maintenance_records.id, id))
      .returning();
    return updatedRecord || undefined;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  }> {
    const [productCount] = await db.select().from(products);
    const allOrders = await db.select().from(orders);

    const totalProducts = await db.select().from(products).then(rows => rows.length);
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(order => 
      ['pending', 'paid', 'processing'].includes(order.status)
    ).length;
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + parseFloat(order.total_amount), 0
    );

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    };
  }
}

export const storage = new DatabaseStorage();
