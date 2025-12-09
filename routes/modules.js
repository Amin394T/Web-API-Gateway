const express = require('express');
const { nanoid } = require('nanoid');
const { db, init } = require('../db');

const router = express.Router();

// Initialize DB on load
init();

function nowISO() {
  return new Date().toISOString();
}

router.get('/', (req, res) => {
  res.redirect('/modules');
});

// List modules
router.get('/modules', async (req, res) => {
  await db.read();
  res.render('modules/list', { modules: db.data.modules });
});

// New module form
router.get('/modules/new', (req, res) => {
  res.render('modules/new');
});

// Create module
router.post('/modules', async (req, res) => {
  await db.read();
  const { name, base_path, status, created_by } = req.body;
  const id = nanoid();
  const timestamp = nowISO();
  const module = {
    id,
    name,
    base_path,
    status: status || 'active',
    created_by: created_by || 'system',
    created_on: timestamp,
    updated_by: created_by || 'system',
    updated_on: timestamp,
    routes: []
  };
  db.data.modules.push(module);
  await db.write();
  res.redirect(`/modules/${id}`);
});

// Show module and its routes
router.get('/modules/:id', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  res.render('modules/show', { module: mod });
});

// Edit module form
router.get('/modules/:id/edit', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  res.render('modules/edit', { module: mod });
});

// Update module
router.post('/modules/:id/edit', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  const { name, base_path, status, updated_by } = req.body;
  mod.name = name || mod.name;
  mod.base_path = base_path || mod.base_path;
  mod.status = status || mod.status;
  mod.updated_by = updated_by || 'system';
  mod.updated_on = nowISO();
  await db.write();
  res.redirect(`/modules/${mod.id}`);
});

// Delete module
router.post('/modules/:id/delete', async (req, res) => {
  await db.read();
  const idx = db.data.modules.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).send('Module not found');
  db.data.modules.splice(idx, 1);
  await db.write();
  res.redirect('/modules');
});

// New route form inside module
router.get('/modules/:id/routes/new', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  res.render('routes/new', { module: mod });
});

// Create route inside module
router.post('/modules/:id/routes', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  const { method, uri_path, cache_time, code, created_by } = req.body;
  const id = nanoid();
  const timestamp = nowISO();
  const route = {
    id,
    method: method || 'GET',
    uri_path,
    cache_time: cache_time || 0,
    code: code || '',
    created_by: created_by || 'system',
    created_on: timestamp,
    updated_by: created_by || 'system',
    updated_on: timestamp
  };
  mod.routes.push(route);
  mod.updated_on = nowISO();
  await db.write();
  res.redirect(`/modules/${mod.id}`);
});

// Edit route form inside module
router.get('/modules/:id/routes/:rid/edit', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  const route = mod.routes.find(r => r.id === req.params.rid);
  if (!route) return res.status(404).send('Route not found');
  res.render('routes/edit', { module: mod, route });
});

// Update route inside module
router.post('/modules/:id/routes/:rid/edit', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  const route = mod.routes.find(r => r.id === req.params.rid);
  if (!route) return res.status(404).send('Route not found');
  const { method, uri_path, cache_time, code, updated_by } = req.body;
  route.method = method || route.method;
  route.uri_path = uri_path || route.uri_path;
  route.cache_time = cache_time || route.cache_time;
  route.code = code || route.code;
  route.updated_by = updated_by || 'system';
  route.updated_on = nowISO();
  mod.updated_on = nowISO();
  await db.write();
  res.redirect(`/modules/${mod.id}`);
});

// Delete route inside module
router.post('/modules/:id/routes/:rid/delete', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  const idx = mod.routes.findIndex(r => r.id === req.params.rid);
  if (idx === -1) return res.status(404).send('Route not found');
  mod.routes.splice(idx, 1);
  mod.updated_on = nowISO();
  await db.write();
  res.redirect(`/modules/${mod.id}`);
});

// Simple API endpoints (JSON)
router.get('/api/modules', async (req, res) => {
  await db.read();
  res.json(db.data.modules);
});

router.get('/api/modules/:id', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  res.json(mod);
});

// Dynamic route handler - executes route code
// Match any HTTP method and path to dynamic routes
router.all('*', async (req, res, next) => {
  // Skip if already handled by UI/info routes above (only skip /modules and /api/modules paths)
  if (req.path.startsWith('/modules') || req.path === '/api/modules' || req.path.startsWith('/api/modules/')) {
    return next();
  }

  await db.read();
  
  // Find matching module by base_path
  for (const mod of db.data.modules) {
    if (!req.path.startsWith(mod.base_path)) continue;
    if (mod.status !== 'active') continue;
    
    // Get the remaining path after base_path
    const remainingPath = req.path.slice(mod.base_path.length) || '/';
    
    // Find matching route by method and uri_path
    const route = mod.routes.find(r => 
      r.method === req.method && r.uri_path === remainingPath
    );
    
    if (!route) continue;
    
    // Execute the route code
    try {
      if (!route.code || route.code.trim() === '') {
        return res.json({ message: 'Route exists but has no code' });
      }
      
      // Create an async function from the code string
      // Users' code has access to: req, res, query, body, params
      // Wrap code in an IIFE to allow multiple statements
      const wrappedCode = `
        return (async function() {
          ${route.code}
        })()
      `;
      
      const fn = new Function('req', 'res', 'query', 'body', 'params', wrappedCode);
      
      // Execute the function with req, res, query, body, and params
      fn(req, res, req.query, req.body, req.params);
      return; // Exit after handling
    } catch (err) {
      console.error('Route execution error:', err);
      return res.status(500).json({ error: 'Route execution failed', message: err.message });
    }
  }
  
  // No matching route found
  next();
});

module.exports = router;
