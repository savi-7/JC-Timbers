import os
import re
import time
from pathlib import Path

import pytest
import requests
from pytest_html import extras
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

from .config import settings
from .utils import unique_email, unique_phone, random_name


@pytest.fixture(scope="function")
def driver():
  chrome_options = Options()
  chrome_options.add_argument("--window-size=1366,768")
  chrome_options.add_argument("--disable-dev-shm-usage")
  chrome_options.add_argument("--no-sandbox")
  if settings.headless:
    chrome_options.add_argument("--headless=new")

  driver_path = ChromeDriverManager().install()
  if not driver_path.lower().endswith(".exe"):
    candidate = Path(driver_path).parent / "chromedriver.exe"
    if candidate.exists():
      driver_path = str(candidate)

  service = Service(driver_path)
  driver = webdriver.Chrome(service=service, options=chrome_options)
  driver.implicitly_wait(2)
  yield driver
  driver.quit()


@pytest.fixture
def step_logger(request, driver):
  screenshots_dir = Path(__file__).resolve().parent / "screenshots"
  screenshots_dir.mkdir(exist_ok=True)
  if not hasattr(request.node, "extra"):
    request.node.extra = []

  def _log(description: str):
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", description)[:40].strip("_")
    filename = f"{request.node.name}_{timestamp}_{slug}.png"
    filepath = screenshots_dir / filename
    driver.save_screenshot(str(filepath))
    img_b64 = driver.get_screenshot_as_base64()
    request.node.extra.append(
      extras.html(
        f"<div><strong>{description}</strong><br>"
        f"<img src='data:image/png;base64,{img_b64}' "
        f"style='border:1px solid #ccc;' width='600'></div>"
      )
    )
    print(f"[STEP] {description} -- screenshot saved: {filepath}")
    return filepath

  return _log


@pytest.fixture(scope="session")
def api_client():
  session = requests.Session()
  session.headers.update({"Content-Type": "application/json"})
  return session


@pytest.fixture(scope="function")
def seeded_customer(api_client):
  """Creates a brand new customer via the REST API for login/cart/wishlist tests."""
  payload = {
    "name": random_name("Customer"),
    "email": unique_email(),
    "phone": unique_phone(),
    "password": "Tester@1234",
  }
  resp = api_client.post(f"{settings.api_base_url}/auth/register", json=payload, timeout=10)
  if resp.status_code != 201:
    raise RuntimeError(f"Failed to seed customer via API: {resp.status_code} {resp.text}")
  return {"email": payload["email"], "password": payload["password"], "name": payload["name"]}


@pytest.fixture(scope="function")
def sample_product(api_client):
  resp = api_client.get(f"{settings.api_base_url}/products?limit=1", timeout=10)
  resp.raise_for_status()
  data = resp.json()
  product = (data.get("products") or [None])[0]
  if not product:
    raise RuntimeError("No products available via API. Seed products before running Selenium tests.")
  return product


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
  outcome = yield
  rep = outcome.get_result()
  if rep.when == "call":
    extra = getattr(item, "extra", [])
    rep.extra = extra

