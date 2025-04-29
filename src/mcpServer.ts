import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from 'axios';
import { z } from "zod";

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

interface ServerConfig {
  name: string;
  description: string;
  version: string;
  authToken?: string;
}

// Create MCP server with configurable options
const createServer = (config: ServerConfig) => {
  const server = new McpServer({
    name: config.name,
    description: config.description,
    version: config.version
  });

  // API base URL
  const API_BASE_URL = 'http://localhost:3000';

  // Get auth token from config or environment variable
  const getAuthToken = () => {
    return config.authToken || process.env.MCP_AUTH_TOKEN;
  };

  // Helper function to make authenticated API requests
  async function makeAuthenticatedRequest<T>(endpoint: string): Promise<T> {
    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error('Authentication token is required. Please provide it through config or MCP_AUTH_TOKEN environment variable.');
    }

    try {
      const response = await axios.get<T>(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Register tools for different types of queries
  server.tool('getProductInfo', 
    { productId: z.string() },
    async ({ productId }) => {
      try {
        const product = await makeAuthenticatedRequest<Product>(`/products/${productId}`);
        const orders = await makeAuthenticatedRequest<Order[]>(`/orders?productId=${productId}`);
        return {
          content: [{ type: "text", text: JSON.stringify({ product, relatedOrders: orders }) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Failed to fetch product information" }]
        };
      }
    }
  );

  server.tool('listProducts',
    {},
    async () => {
      try {
        const products = await makeAuthenticatedRequest<Product[]>('/products');
        return {
          content: [{ type: "text", text: JSON.stringify({ products, total: products.length }) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Failed to fetch products" }]
        };
      }
    }
  );

  server.tool('getProductOrders',
    { productId: z.string() },
    async ({ productId }) => {
      try {
        const orders = await makeAuthenticatedRequest<Order[]>(`/orders?productId=${productId}`);
        return {
          content: [{ type: "text", text: JSON.stringify({ orders, total: orders.length }) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Failed to fetch product orders" }]
        };
      }
    }
  );

  server.tool('searchProducts',
    { query: z.string() },
    async ({ query }) => {
      try {
        const products = await makeAuthenticatedRequest<Product[]>('/products');
        const searchResults = products.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        );
        return {
          content: [{ type: "text", text: JSON.stringify({ results: searchResults, total: searchResults.length }) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Failed to search products" }]
        };
      }
    }
  );

  return server;
};

// Start the server
async function startServer() {
  const transport = new StdioServerTransport();
  const server = createServer({
    name: "Product Information Server",
    description: "Provides information about products and orders",
    version: "1.0.0"
  });
  await server.connect(transport);
  console.log('MCP Server is running');
  console.log('Available tools:');
  console.log('- getProductInfo: Get detailed information about a specific product');
  console.log('- listProducts: List all available products');
  console.log('- getProductOrders: Get all orders for a specific product');
  console.log('- searchProducts: Search products by name or category');
}

startServer(); 