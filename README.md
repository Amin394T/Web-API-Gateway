# API Gateway (Simple)

This is a minimal API Gateway management app built with Node.js, Express and EJS. It stores data in a small JSON file using `lowdb`.

Features:
- Create API modules (name, base path, status, created_by, created_on, updated_by, updated_on)
- Create API routes inside a module (method, uri_path, cache_time, created_by, created_on, updated_by, updated_on)
- Basic web UI using EJS templates

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

Data is persisted to `db.json` in the project root.
