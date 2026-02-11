import { Router } from "express";
import { db } from "../app.js";

const router = Router();

router.use(async (req, res, next) => {
  const callTime = new Date();
  
  try {
    const query = `
      SELECT id, description, module_id, path, method, cache, active, code
      FROM api_routes
      WHERE active = true AND path = $1 AND method = $2
      LIMIT 1
    `;

    const { rows } = await db.query(query, [req.path, req.method]); // should be url_base + url_path

    if (!rows || rows.length == 0) return next();

    const route = rows[0];
    if (!route.code) return next();

    const response = new Function('req', route.code)(req);
    const sendTime = new Date();

    // Log the request
    await db.query(`
      INSERT INTO api_logs (module_id, route_id, call_time, send_time, method, url, request_type, response_type, request_body, response_body, ip_address, user_agent, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      route.module_id,
      route.id,
      callTime,
      sendTime,
      req.method,
      req.originalUrl,
      req.get('content-type'),
      'application/json',
      JSON.stringify(req.body),
      JSON.stringify(response.data),
      req.ip,
      req.get('user-agent'),
      response.status
    ]);

    return res.status(response.status).json(response.data);
  }
  catch(err) {
    next(err);
  }
});

export default router;