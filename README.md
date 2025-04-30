# MCP Demo App

A simple Node.js/Express API server using TypeScript for managing products and orders, with Model Context Protocol (MCP) integration.

## Features
- RESTful API for products and orders
- Bearer token authentication
- Data stored in JSON files
- MCP server exposing tools for product/order queries
- TypeScript for type safety

## Project Structure
```
├── src/
│   ├── server.ts         # Main Express API server
│   ├── mcpServer.ts      # MCP server exposing tools
│   └── data/
│       ├── products.json # Product data
│       └── orders.json   # Order data
├── dist/                 # Compiled JS output
├── package.json          # Project metadata and scripts
├── tsconfig.json         # TypeScript config
└── .gitignore            # Ignored files
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Install Dependencies
```bash
npm install
```

### Build the Project
```bash
npm run build
```

### Run the API Server
```bash
npm run dev   # For development (with nodemon)
npm start     # For production (after build)
```

### Run the MCP Server
```bash
npm run mcp
```

## Authentication
All API endpoints (except `/health`) require a Bearer token. Example valid tokens:
- `valid_token_123`
- `client_abc_token`

Include the token in the `Authorization` header:
```
Authorization: Bearer valid_token_123
```

## API Endpoints

### Health Check
- `GET /health` — Returns `{ status: 'ok' }`

### Products
- `GET /products` — List all products
- `GET /products/:productId` — Get product by ID

### Orders
- `GET /orders` — List all orders (optionally filter by `customerId`)
- `GET /orders/:orderId` — Get order by ID

## MCP Server Tools
The MCP server (src/mcpServer.ts) exposes the following tools:
- `getProductInfo(productId)` — Get product details and related orders
- `listProducts()` — List all products
- `getProductOrders(productId)` — Get all orders for a product
- `searchProducts(query)` — Search products by name or category

## Example Data

### Products (`src/data/products.json`)
```json
[
  { "id": "p1", "name": "Cloud Widget", "category": "Widgets", "price": 99.99 },
  { "id": "p2", "name": "Data Analyzer", "category": "Analytics", "price": 199.99 },
  { "id": "p3", "name": "API Gateway", "category": "Infrastructure", "price": 149.99 }
]
```

### Orders (`src/data/orders.json`)
```json
[
  { "id": "o101", "productId": "p1", "customerId": "cust_abc", "quantity": 2, "orderDate": "2023-10-26T10:00:00Z", "status": "shipped" },
  { "id": "o102", "productId": "p2", "customerId": "cust_xyz", "quantity": 1, "orderDate": "2023-10-27T15:30:00Z", "status": "processing" },
  { "id": "o103", "productId": "p3", "customerId": "cust_abc", "quantity": 3, "orderDate": "2023-10-28T09:15:00Z", "status": "delivered" }
]
```

## Development Notes
- TypeScript config: see `tsconfig.json`
- Ignored files: `dist/`, `node_modules/`
- Data is persisted in JSON files in `src/data/`

## License
MIT
