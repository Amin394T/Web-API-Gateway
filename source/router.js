import { Router } from "express";
import { db } from "../app.js";

const router = Router();

router.use(async (req, res, next) => {
  try {
    const query = `
      SELECT id, description, module_id, path, method, cache, active, code
      FROM api_routes
      WHERE active = true AND path = $1 AND method = $2
      LIMIT 1
    `;

    const { rows } = await db.query(query, [req.path, req.method]);

    if (!rows || rows.length == 0) return next();

    const route = rows[0];
    if (!route.code) return next();

    const response = new Function('req', route.code)(req);
    return res.status(response.status).json(response.data);
  }
  catch(err) {
    next(err);
  }
});


export default router;