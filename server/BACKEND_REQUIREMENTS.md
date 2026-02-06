# Backend Requirements (Node API)

## 1. Return JSON

All API responses use `res.json()` so clients receive JSON. Error responses use `res.status(code).json({ message: '...' })`.

## 2. JWT Authentication

- **Login**: `POST /api/auth/login` returns `{ token, user }`. The `token` is a JWT.
- **Protected routes**: Send header `Authorization: Bearer <token>`.
- **Middleware**: `src/middleware/auth.js` – `authenticateToken` verifies the JWT and sets `req.user`.

## 3. Serve Images as Full URLs

- **Base URL**: Set `BASE_URL` in `.env` for production (e.g. `http://192.168.1.5:5000`). Otherwise the server builds it from `req` (protocol + host).
- **Product images**: Responses include an `imageUrls` array with full URLs, e.g.  
  `http://192.168.1.5:5000/api/images/:productId/:imageIndex`
- **Static uploads**: Files under `uploads/` are served at `/uploads/...`.  
  Example full URL: **`http://192.168.1.5:5000/uploads/products/chair.jpg`**
- **Product images**: `GET /api/images/:productId/:imageIndex` – list/detail responses include `imageUrls[]`.
- **Marketplace listing image**: `GET /api/marketplace/listings/:id/image` – list/detail responses include `imageUrl`.
- **Utility**: `src/utils/getBaseUrl.js` – use `getBaseUrl(req)` or `req.baseUrl` (set by middleware in `server.js`).
