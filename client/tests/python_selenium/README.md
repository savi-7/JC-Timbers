# Python Selenium E2E Tests

This lightweight test suite covers the four customer-facing flows you asked for (registration, login, cart, wishlist) using **pytest + Selenium**.

## Prerequisites

1. **Backend** running locally (defaults to `http://localhost:5001`):
   ```bash
   cd server
   npm start
   ```
2. **Frontend** running (defaults to `http://localhost:5173`). You can use `npm run dev` or serve the production build.
3. **Python 3.10+** available on your PATH.

> If you run on different ports/hosts, set `E2E_BASE_URL` and `E2E_API_BASE_URL` before running pytest.

## Install dependencies

```bash
cd client/tests/python_selenium
python -m venv .venv
.venv\Scripts\activate  # (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
```

## Run the tests + HTML report

```bash
pytest tests --html=report.html --self-contained-html
```

The report (`report.html`) will be saved in the same folder. Each test spins up its own Chrome session using `webdriver-manager` and tears it down automatically.

## Environment variables (optional)

| Variable            | Default                     | Description                      |
|---------------------|-----------------------------|----------------------------------|
| `E2E_BASE_URL`      | `http://localhost:5173`      | Frontend base URL (SPA)          |
| `E2E_API_BASE_URL`  | `http://localhost:5001/api`  | Backend API base URL             |

Create a `.env` file or export the vars in your shell if you need different values.

## What’s covered

1. **Registration (UI)** – Fills the sign-up form and checks redirect to login.
2. **Login (UI)** – Uses an API-seeded user and validates redirect to customer home.
3. **Add to Cart (UI)** – Logs in via UI, opens a product detail page, adds it to cart, and verifies it shows up there.
4. **Add to Wishlist (UI)** – Same as cart but checks the wishlist page instead.

Each non-registration test seeds its own temporary customer via the REST API to keep cart/wishlist states isolated. If no products exist, the tests will fail early with a helpful message.


