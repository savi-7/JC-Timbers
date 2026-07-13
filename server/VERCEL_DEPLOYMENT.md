# Deploying JC Timbers Backend to Vercel

This guide covers deploying the Express backend to Vercel.

## Prerequisites

- MongoDB Atlas (or another cloud MongoDB) - **Vercel has no persistent storage**
- Vercel account
- All environment variables configured

## Deployment Steps

### 1. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository
4. **Set Root Directory** to `server` (important!)
5. Framework Preset: **Other** (Vercel auto-detects Express)
6. Add environment variables (see below)
7. Deploy

### 2. Deploy via CLI

```bash
cd server
vercel
```

Follow the prompts. For first-time setup, link to a Vercel project or create one.

### 3. Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string (use MongoDB Atlas for cloud) |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `CLIENT_ORIGIN` | Yes | Your frontend URL, e.g. `https://your-app.vercel.app` |
| `BASE_URL` | Recommended | Your backend URL, e.g. `https://your-api.vercel.app` |
| `RAZORPAY_KEY_ID` | If using payments | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | If using payments | Razorpay API secret |
| Email config | If using emails | See `ENV_TEMPLATE.txt` for email variables |

**Important:** Use MongoDB Atlas (or similar) - `localhost` MongoDB will not work on Vercel.

**MongoDB Atlas Network Access:** Vercel uses dynamic IPs. In Atlas → Network Access, add `0.0.0.0/0` to allow connections from anywhere. Without this, you may see "buffering timed out" errors.

### 4. Update Your Frontend

After deployment, set your frontend's API base URL to the Vercel backend URL, e.g.:
- `https://your-project-name.vercel.app`

## Vercel-Specific Notes

### Static Files (`/uploads`)

Vercel **ignores** `express.static()` - files in `uploads/` are not served. This project stores:
- **Product images** in MongoDB (base64) - served via `/api/images/:productId/:imageIndex` ✅
- **Blog images** as base64 in MongoDB ✅
- **Order images** from product data ✅

Legacy `/uploads/` paths will not work on Vercel. Ensure products use the MongoDB image format.

### File Uploads

Uploads use `/tmp` on Vercel (ephemeral). Files are processed during the request (e.g. converted to base64 and stored in MongoDB) then discarded. This works for product/blog image uploads.

### Function Limits

- **Memory:** 1024 MB (set in `vercel.json`)
- **Max duration:** 30 seconds
- **Payload:** 4.5 MB request body (Vercel default)

## Health Check

After deployment, verify:

```
GET https://your-api.vercel.app/api/health
```

Should return: `{"status":"ok"}`
