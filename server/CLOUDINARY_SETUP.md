# Cloudinary setup – step-by-step

Follow these steps to store product images in Cloudinary and save only the image URL in MongoDB.

---

## Step 1: Create a Cloudinary account (if you don’t have one)

1. Open: **https://cloudinary.com**
2. Click **Sign up for free**.
3. Enter your email and a password (or sign up with Google).
4. Confirm your email if asked.

---

## Step 2: Get your Cloudinary credentials

1. Log in to Cloudinary: **https://cloudinary.com/users/login**
2. You should see the **Dashboard**.
3. On the Dashboard you’ll see a box that says something like **“Product environment credentials”** or **“API Keys”**. It shows:
   - **Cloud name**
   - **API Key**
   - **API Secret** (you may need to click **“Reveal”** to see it)

4. Copy these three values and keep them handy:
   - **Cloud name** (e.g. `dxxxxxxxx`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcdefghijklmnopqrstuvwxyz123`)

If you don’t see them on the main page:

- Click **Settings** (gear icon) in the top menu.
- Open the **Access** or **API Keys** tab.
- Copy **Cloud name**, **API Key**, and **API Secret**.

---

## Step 3: Add the credentials to your project

1. Open your project folder: `JC-Timbers1/server/`
2. Open the file **`.env`** in a text editor (e.g. Notepad, VS Code, Cursor).  
   - If you don’t see `.env`, it may be hidden. In Cursor/VS Code you can open it from the file list or use **File → Open File** and type `.env`.
3. At the **bottom** of `.env`, add these three lines (replace the placeholders with your real values):

```env
# Cloudinary (product images)
CLOUDINARY_CLOUD_NAME=paste_your_cloud_name_here
CLOUDINARY_API_KEY=paste_your_api_key_here
CLOUDINARY_API_SECRET=paste_your_api_secret_here
```

**Example** (with fake values – use yours from Step 2):

```env
# Cloudinary (product images)
CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

4. **Save** the `.env` file (Ctrl+S).

Important:

- No spaces around the `=` sign.
- No quotes around the values (unless your secret has spaces, then use quotes).
- Do **not** share your `.env` or commit it to Git (it should already be in `.gitignore`).

---

## Step 4: Restart your server

1. If your Node server is running (e.g. `npm run dev`), stop it: press **Ctrl+C** in the terminal.
2. Start it again:

```bash
cd server
npm run dev
```

The server reads `.env` when it starts, so it needs a restart to pick up the new Cloudinary variables.

---

## Step 5: Test that it works

1. Open your app (e.g. admin or wherever you add products).
2. **Create a new product** and **upload at least one image**.
3. After saving:
   - In MongoDB (or your admin UI), the product’s images should have a **URL** (and no long base64 string).
   - In Cloudinary: go to **https://console.cloudinary.com** → **Media Library**. You should see the new image in a folder like **jc-timbers/products**.

If the image appears in the Cloudinary Media Library and the product shows the image on the site, setup is correct.

---

## If something goes wrong

**Images still save as base64 in MongoDB**

- Check that the three variables in `.env` are spelled exactly:  
  `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Make sure there are no extra spaces or typos in the values.
- Restart the server after changing `.env`.

**“Cloudinary not configured” or upload fails**

- Confirm all three values are in `.env` and that you restarted the server.
- In Cloudinary Dashboard → **Settings** → **Security**, check that **Allowed fetch endpoints** (if any) don’t block your server.

**Server won’t start after adding .env**

- Make sure there are no syntax errors: each line should be `KEY=value` with no spaces around `=`.
- If a value contains a special character, try putting it in double quotes:  
  `CLOUDINARY_API_SECRET="your-secret-here"`

---

## Summary checklist

- [ ] Cloudinary account created
- [ ] Cloud name, API Key, and API Secret copied from Dashboard (or Settings → API Keys)
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` added to `server/.env`
- [ ] `.env` saved
- [ ] Server restarted
- [ ] New product with image created and image seen in Cloudinary Media Library

Once all steps are done, new product images will be stored in Cloudinary and only the URL will be saved in MongoDB.
