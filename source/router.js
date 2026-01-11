import { Router } from "express";
import routes from "../utilities/data.js";

const router = Router();

router.use((req, res, next) => {
  for (const route of routes) {
    if (route.path != req.path) continue;
    if (route.method != req.method) continue;

    return res.status(200).json(route.code);
  }
  next();
});

export default router;