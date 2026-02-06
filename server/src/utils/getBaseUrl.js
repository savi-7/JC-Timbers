/**
 * Base URL for the API (used for full image URLs in JSON responses).
 * Set BASE_URL in .env for production, e.g. http://192.168.1.5:5000
 * Example image URL: http://192.168.1.5:5000/uploads/products/chair.jpg
 * Or product image: http://192.168.1.5:5000/api/images/:productId/:imageIndex
 */
export function getBaseUrl(req = null) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  if (req && req.get && req.protocol) {
    const host = req.get('host');
    if (host) return `${req.protocol}://${host}`;
  }
  const port = process.env.PORT || 5001;
  const host = process.env.HOST || 'localhost';
  return `http://${host}:${port}`;
}
