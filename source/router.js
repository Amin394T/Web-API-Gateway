import { Router } from "express";
import routes from "../utilities/data.js";

const router = Router();

router.use((req, res, next) => {
  for (const route of routes) {
    if (route.path != req.path) continue;
    if (route.method != req.method) continue;
    
    const response = new Function('req', route.code)(req);
    return res.status(response.status).json(response.data);
  }
  next();
});

export default router;