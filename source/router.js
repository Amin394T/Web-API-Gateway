import { Router } from "express";
import routes from "../utilities/data.js";
import { match } from 'path-to-regexp';

const router = Router();

const compiledRoutes = routes.map(route => ({
  ...route,
  matcher: match(route.path, { decode: decodeURIComponent })
}));

console.log("Compiled Routes:", compiledRoutes);


router.use((req, res, next) => {
  for (const route of compiledRoutes) {
    if (route.method !== req.method) continue;

    const result = route.matcher(req.path);
    if (!result) continue;

    req.params = result.params;

    const { status = 200, body, headers } = route.response;

    if (headers) {
      Object.entries(headers).forEach(([k, v]) =>
        res.setHeader(k, v)
      );
    }

    return res.status(status).json(body);
  }

  next();
});

export default router;