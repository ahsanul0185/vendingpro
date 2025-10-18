import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCategorySchema,
  insertSubcategorySchema,
  insertProductSchema, 
  insertOrderSchema,
  insertDeliverySchema,
  insertAssemblySchema,
  insertMaintenanceRecordSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {

// health checkup
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
  // Setup authentication (creates /api/register, /api/login, /api/logout, /api/user, /api/forgot-password)
  setupAuth(app);

  // Reset password endpoint
  app.post("/api/reset-password", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resetPasswordSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      });

      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.errors 
        });
      }

      const { currentPassword, newPassword } = validation.data;

      const { hashPassword, comparePasswords } = await import("./auth");
      const dbUser = await storage.getUserByUsername(user.username);
      
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // comparePasswords(plain, hash) - correct order
      const isValid = await comparePasswords(currentPassword, dbUser.password);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Notifications endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock notifications for now
      const notifications = [
        {
          id: "1",
          title: "Order Confirmed",
          message: "Your order #ORD-001 has been confirmed",
          type: "success",
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "New Product Available",
          message: "Check out our new products in the catalog",
          type: "info",
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    try {
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      let productData = insertProductSchema.parse(req.body);
      
      // Automatically set status to out_of_stock if stock is 0
      if (productData.stock === 0) {
        productData = { ...productData, status: "out_of_stock" };
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let productData = insertProductSchema.parse(req.body);
      
      // Automatically set status to out_of_stock if stock is 0
      if (productData.stock === 0) {
        productData = { ...productData, status: "out_of_stock" };
      }
      
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Subcategories routes
  app.get("/api/subcategories", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const subcategories = categoryId 
        ? await storage.getSubcategoriesByCategoryId(categoryId)
        : await storage.getAllSubcategories();
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  app.post("/api/subcategories", async (req, res) => {
    try {
      const subcategoryData = insertSubcategorySchema.parse(req.body);
      const subcategory = await storage.createSubcategory(subcategoryData);
      res.status(201).json(subcategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subcategory data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create subcategory" });
      }
    }
  });

  app.put("/api/subcategories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const subcategoryData = insertSubcategorySchema.parse(req.body);
      const subcategory = await storage.updateSubcategory(id, subcategoryData);
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      res.json(subcategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subcategory data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update subcategory" });
      }
    }
  });

  app.delete("/api/subcategories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubcategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subcategory" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const user = req.user as any;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      // If customer, only return their own orders
      if (user && user.role === "customer") {
        const allOrders = await storage.getAllOrders(limit);
        const userOrders = allOrders.filter(order => order.user_id === user.id);
        res.json(userOrders);
      } else {
        // Admin sees all orders
        const orders = await storage.getAllOrders(limit);
        res.json(orders);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.updateOrder(id, orderData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update order" });
      }
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const validStatuses = ["pending", "paid", "processing", "completed", "failed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Schedule assembly for an order (admin only)
  app.post("/api/orders/:id/assembly", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { assembly_scheduled_date } = req.body;

      if (!assembly_scheduled_date) {
        return res.status(400).json({ message: "Assembly scheduled date is required" });
      }

      const order = await storage.scheduleAssembly(id, new Date(assembly_scheduled_date));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to schedule assembly" });
    }
  });

  // Update assembly status (admin only)
  app.patch("/api/orders/:id/assembly", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { assembly_status } = req.body;

      if (!assembly_status) {
        return res.status(400).json({ message: "Assembly status is required" });
      }

      const validStatuses = ["scheduled", "completed"];
      if (!validStatuses.includes(assembly_status)) {
        return res.status(400).json({ message: "Invalid assembly status value" });
      }

      const order = await storage.updateAssemblyStatus(id, assembly_status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update assembly status" });
    }
  });

  // Checkout endpoint
  app.post("/api/checkout", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { product_id, quantity, total_amount, payment_method, payment_amount, payment_transfer_id, payment_transfer_date, customer_info } = req.body;

      if (!product_id || !quantity || !total_amount) {
        return res.status(400).json({ message: "Product ID, quantity, and total amount are required" });
      }

      // Get product to verify it exists and check stock
      const product = await storage.getProductById(product_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if product is in stock
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock available" });
      }

      // Reduce product stock
      const newStock = product.stock - quantity;
      const updatedProductData = {
        name: product.name,
        price: product.price,
        stock: newStock,
        status: newStock === 0 ? "out_of_stock" : product.status,
        category: product.category,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
        description: product.description,
        image: product.image,
        specifications: product.specifications as any,
      };
      await storage.updateProduct(product_id, updatedProductData);

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const orderData = {
        order_number: orderNumber,
        user_id: user.id,
        total_amount: total_amount.toString(),
        items_count: quantity,
        status: payment_transfer_id ? "paid" : "pending",
        payment_method: payment_method || null,
        payment_amount: payment_amount ? payment_amount.toString() : null,
        payment_transfer_id: payment_transfer_id || null,
        payment_transfer_date: payment_transfer_date ? new Date(payment_transfer_date) : null,
        customer_info: customer_info || null,
      };

      const order = await storage.createOrder(orderData);

      // Create order item
      const orderItemData = {
        order_id: order.id,
        product_id: product_id,
        quantity: quantity,
        price: product.price,
      };

      await storage.createOrderItem(orderItemData);

      res.status(201).json(order);
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: "Failed to process checkout" });
    }
  });

  // Deliveries routes
  app.get("/api/deliveries", async (req, res) => {
    try {
      const deliveries = await storage.getAllDeliveries();
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid delivery data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create delivery" });
      }
    }
  });

  app.put("/api/deliveries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.updateDelivery(id, deliveryData);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid delivery data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update delivery" });
      }
    }
  });

  // Assemblies routes
  app.get("/api/assemblies", async (req, res) => {
    try {
      const assemblies = await storage.getAllAssemblies();
      res.json(assemblies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assemblies" });
    }
  });

  app.post("/api/assemblies", async (req, res) => {
    try {
      const assemblyData = insertAssemblySchema.parse(req.body);
      const assembly = await storage.createAssembly(assemblyData);
      res.status(201).json(assembly);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assembly data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create assembly" });
      }
    }
  });

  app.put("/api/assemblies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const assemblyData = insertAssemblySchema.parse(req.body);
      const assembly = await storage.updateAssembly(id, assemblyData);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }
      res.json(assembly);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assembly data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update assembly" });
      }
    }
  });

  // Helper to create API schema for maintenance records that accepts date strings
  const createMaintenanceApiSchema = () => {
    return insertMaintenanceRecordSchema.extend({
      scheduled_date: z.union([
        z.date(),
        z.string().refine((val) => !isNaN(new Date(val).getTime()), {
          message: "Invalid date string"
        }).transform(val => new Date(val))
      ]),
      completed_date: z.union([
        z.date(),
        z.string().refine((val) => !isNaN(new Date(val).getTime()), {
          message: "Invalid date string"
        }).transform(val => new Date(val)),
        z.null()
      ]).optional(),
    });
  };

  // Maintenance records routes
  app.get("/api/maintenance", async (req, res) => {
    try {
      const records = await storage.getAllMaintenanceRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance records" });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const apiSchema = createMaintenanceApiSchema();
      const recordData = apiSchema.parse(req.body);
      const record = await storage.createMaintenanceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid maintenance record data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create maintenance record" });
      }
    }
  });

  app.put("/api/maintenance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const apiSchema = createMaintenanceApiSchema();
      const recordData = apiSchema.parse(req.body);
      const record = await storage.updateMaintenanceRecord(id, recordData);
      if (!record) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid maintenance record data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update maintenance record" });
      }
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Monitoring - Delivered products with customer details
  app.get("/api/monitoring/delivered", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const deliveredOrders = await storage.getDeliveredOrdersWithDetails();
      res.json(deliveredOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delivered orders" });
    }
  });

  // Categories with subcategories endpoint
  app.get("/api/categories-with-subcategories", async (req, res) => {
    try {
      const categoriesWithSubs = await storage.getCategoriesWithSubcategories();
      res.json(categoriesWithSubs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories with subcategories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
