
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// PRODUCT DATA
// ==========================================

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2499,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 3499,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Fashion",
    price: 1999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
  },
  {
    id: 4,
    name: "Backpack",
    category: "Accessories",
    price: 1499,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
  },
  {
    id: 5,
    name: "Camera",
    category: "Electronics",
    price: 15999,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"
  },
  {
    id: 6,
    name: "Sunglasses",
    category: "Fashion",
    price: 999,
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500"
  }
];

// ==========================================
// ORDER DATA (TEMPORARY IN-MEMORY STORAGE)
// ==========================================

const orders = [];
let nextOrderId = 1;

// ==========================================
// HEALTH CHECK API
// ==========================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "ShopSphere API is running"
  });
});

// ==========================================
// PRODUCT APIs
// ==========================================

// Get all products
app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

// Get product by ID
app.get("/api/products/:id", (req, res) => {
  const product = products.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.status(200).json(product);
});

// ==========================================
// ORDER APIs
// ==========================================

// Place an order
app.post("/api/orders", (req, res) => {
  const { items, customer } = req.body;

  // Validate customer
  if (
    typeof customer !== "string" ||
    !customer.trim()
  ) {
    return res.status(400).json({
      message: "Customer name is required"
    });
  }

  // Validate cart
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Your cart is empty"
    });
  }

  let total = 0;
  const orderItems = [];

  // Validate each product and quantity
  for (const item of items) {
    const product = products.find(
      (p) => p.id === Number(item.id)
    );

    const quantity = Number(item.quantity);

    if (
      !product ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "Invalid product or quantity"
      });
    }

    // Calculate price using backend product data
    total += product.price * quantity;

    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  // Create order
  const order = {
    id: nextOrderId++,
    customer: customer.trim(),
    items: orderItems,
    total,
    status: "Placed",
    createdAt: new Date()
  };

  orders.push(order);

  res.status(201).json({
    message: "Order placed successfully",
    order
  });
});

// Get all orders
app.get("/api/orders", (req, res) => {
  res.status(200).json(orders);
});

// Get a specific order by ID
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!order) {
    return res.status(404).json({
      message: "Order not found"
    });
  }

  res.status(200).json(order);
});

// ==========================================
// SERVER CONFIGURATION
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ShopSphere API running on port ${PORT}`);
});
