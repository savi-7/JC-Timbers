/**
 * Base URL for the API (used for full image URLs in JSON responses).
 * Set BASE_URL in .env for production, e.g. https://your-api.vercel.app
 * On Vercel: uses VERCEL_URL or BASE_URL
 */
export function getBaseUrl(req = null) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  // Vercel provides VERCEL_URL (e.g. "your-project.vercel.app")
  if (process.env.VERCEL && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (req && req.get && req.protocol) {
    const host = req.get('host');
    if (host) return `${req.protocol}://${host}`;
  }
  const port = process.env.PORT || 5001;
  const host = process.env.HOST || 'localhost';
  return `http://${host}:${port}`;
}
