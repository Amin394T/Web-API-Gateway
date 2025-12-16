# API Gateway (Simple)

This is a minimal API Gateway management app built with Node.js, Express and EJS. It stores data in a small JSON file using `lowdb`.

Features:
- Create API modules (name, base path, status, created_by, created_on, updated_by, updated_on)
- Create API routes inside a module (method, uri_path, cache_time, code, created_by, created_on, updated_by, updated_on)
- Each route can execute custom JavaScript code
- Basic web UI using EJS templates
- Edit and delete modules and routes

Quick start

1. Install dependencies:

```bash
cd "API Gateway"
npm install
```

2. Run the app:

```bash
npm start
# or for development with auto-reload
npm run dev
```

3. Open http://localhost:3000/modules

## Creating Routes

1. Create a module with a base path (e.g., `/api/v1`)
2. Inside the module, create routes with:
   - HTTP method (GET, POST, PUT, DELETE, PATCH)
   - URI path (e.g., `/users`)
   - Cache time (in seconds)
   - JavaScript code to execute

## Writing Route Code

Routes have access to these variables:
- `req` - Express request object
- `res` - Express response object
- `query` - Query parameters object
- `body` - Request body object
- `params` - URL path parameters object

Example route code:

```javascript
// Simple JSON response
res.json({ message: 'Hello World!', timestamp: new Date() })

// Using query parameters
res.json({ 
  greeting: `Hello ${query.name || 'Guest'}!`
})

// Echo the request body
res.json({ received: body })
```

Data is persisted to `db.json` in the project root.
