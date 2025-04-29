import express, { Request, Response, NextFunction } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

// Define interfaces for our data structures
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface Order {
  id: string;
  productId: string;
  customerId: string;
  quantity: number;
  orderDate: string;
  status: string;
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set of valid bearer tokens
const validTokens = new Set([
  'valid_token_123',
  'client_abc_token'
]);

// Authentication middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!validTokens.has(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Initialize data
let products: Product[] = [];
let orders: Order[] = [];

// Function to load data from files
async function loadData() {
  try {
    // Check if data directory exists, create if it doesn't
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR);
    }

    // Check and load products
    try {
      const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
      products = JSON.parse(productsData);
    } catch {
      // If file doesn't exist, create it with sample data
      const sampleProducts: Product[] = [
        {
          id: 'p1',
          name: 'Cloud Widget',
          category: 'Widgets',
          price: 99.99
        },
        {
          id: 'p2',
          name: 'Data Analyzer',
          category: 'Analytics',
          price: 199.99
        }
      ];
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(sampleProducts, null, 2));
      products = sampleProducts;
    }

    // Check and load orders
    try {
      const ordersData = await fs.readFile(ORDERS_FILE, 'utf-8');
      orders = JSON.parse(ordersData);
    } catch {
      // If file doesn't exist, create it with sample data
      const sampleOrders: Order[] = [
        {
          id: 'o101',
          productId: 'p1',
          customerId: 'cust_abc',
          quantity: 2,
          orderDate: '2023-10-26T10:00:00Z',
          status: 'shipped'
        }
      ];
      await fs.writeFile(ORDERS_FILE, JSON.stringify(sampleOrders, null, 2));
      orders = sampleOrders;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
}

// Health check endpoint (no authentication required)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Products endpoints
app.get('/products', authenticateToken, (req: Request, res: Response) => {
  res.json(products);
});

app.get('/products/:productId', authenticateToken, (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Orders endpoints
app.get('/orders', authenticateToken, (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  if (customerId) {
    const customerOrders = orders.filter(order => order.customerId === customerId);
    return res.json(customerOrders);
  }
  res.json(orders);
});

app.get('/orders/:orderId', authenticateToken, (req: Request, res: Response) => {
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Start server
async function startServer() {
  await loadData();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer(); 