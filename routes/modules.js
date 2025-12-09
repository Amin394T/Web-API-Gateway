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
  const { method, uri_path, cache_time, created_by } = req.body;
  const id = nanoid();
  const timestamp = nowISO();
  const route = {
    id,
    method: method || 'GET',
    uri_path,
    cache_time: cache_time || 0,
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

module.exports = router;
