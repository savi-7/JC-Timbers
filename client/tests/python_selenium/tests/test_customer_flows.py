import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from ..config import settings
from ..utils import unique_email, unique_phone, random_name


def api_login(api_client, email: str, password: str) -> str:
  resp = api_client.post(
    f"{settings.api_base_url}/auth/login",
    json={"email": email, "password": password},
    timeout=10,
  )
  resp.raise_for_status()
  return resp.json().get("token")


def cart_contains(api_client, token: str, product_id: str) -> bool:
  resp = api_client.get(
    f"{settings.api_base_url}/cart",
    headers={"Authorization": f"Bearer {token}"},
    timeout=10,
  )
  resp.raise_for_status()
  items = resp.json().get("items") or []
  return any(item.get("productId") == product_id for item in items)


def wishlist_contains(api_client, token: str, product_id: str) -> bool:
  resp = api_client.get(
    f"{settings.api_base_url}/wishlist",
    headers={"Authorization": f"Bearer {token}"},
    timeout=10,
  )
  resp.raise_for_status()
  items = resp.json().get("items") or []
  return any(item.get("productId") == product_id for item in items)


class Waits:
  @staticmethod
  def wait_for_url(driver, fragment: str, timeout: int = 20):
    WebDriverWait(driver, timeout).until(EC.url_contains(fragment))

  @staticmethod
  def wait_for_text(driver, locator, text: str, timeout: int = 20):
    WebDriverWait(driver, timeout).until(
      EC.text_to_be_present_in_element(locator, text)
    )


def fill_registration_form(driver, email: str, password: str, log_step):
  driver.get(f"{settings.base_url}/register")
  log_step("Opened registration page")
  first_name = random_name("First")
  last_name = random_name("Last")
  phone = unique_phone()
  driver.find_element(By.NAME, "firstName").send_keys(first_name)
  driver.find_element(By.NAME, "lastName").send_keys(last_name)
  driver.find_element(By.NAME, "email").send_keys(email)
  driver.find_element(By.NAME, "phone").send_keys(phone)
  driver.find_element(By.NAME, "password").send_keys(password)
  driver.find_element(By.NAME, "confirmPassword").send_keys(password)
  checkbox = driver.find_element(By.NAME, "agreeToTerms")
  driver.execute_script("arguments[0].scrollIntoView({block:'center'});", checkbox)
  if not checkbox.is_selected():
    checkbox.click()
  log_step(
    f"Registration data: Name={first_name} {last_name}, "
    f"Email={email}, Phone={phone}, Password={password}"
  )
  driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()


def login_via_ui(driver, email: str, password: str, log_step):
  driver.get(f"{settings.base_url}/login")
  log_step("Opened login page")
  driver.find_element(By.NAME, "email").send_keys(email)
  driver.find_element(By.NAME, "password").send_keys(password)
  log_step(f"Entered login credentials: email={email}, password={password}")
  driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
  Waits.wait_for_url(driver, "/customer-home")
  log_step("Login success")


def open_product_detail(driver, product_id: str, log_step):
  driver.get(f"{settings.base_url}/product/{product_id}")
  WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Add to Cart')]"))
  )
  log_step(f"Opened product page for {product_id}")


def test_register_customer_ui(driver, step_logger):
  email = unique_email()
  password = "Tester@1234"
  print("==== Starting Registration Test ====")
  fill_registration_form(driver, email, password, step_logger)
  Waits.wait_for_url(driver, "/login")
  step_logger("Redirected to login page after registration")
  print("==== Registration Test PASSED ====")


def test_login_customer_ui(driver, seeded_customer, step_logger):
  print("==== Starting Login Test ====")
  login_via_ui(driver, seeded_customer["email"], seeded_customer["password"], step_logger)
  assert "/customer-home" in driver.current_url
  print("==== Login Test PASSED ====")


def test_add_to_cart_ui(driver, api_client, seeded_customer, sample_product, step_logger):
  print("==== Starting Add-To-Cart Test ====")
  login_via_ui(driver, seeded_customer["email"], seeded_customer["password"], step_logger)
  open_product_detail(driver, sample_product["_id"], step_logger)

  add_button = WebDriverWait(driver, 20).until(
    EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Add to Cart')]"))
  )
  driver.execute_script("arguments[0].scrollIntoView({block:'center'});", add_button)
  add_button.click()
  step_logger(f"Clicked Add to Cart for {sample_product['name']}")
  WebDriverWait(driver, 5).until(lambda d: True)  # brief pause for toast

  driver.get(f"{settings.base_url}/cart")
  Waits.wait_for_text(driver, (By.TAG_NAME, "h1"), "Your Shopping Cart")
  step_logger("Viewed cart page")

  token = api_login(api_client, seeded_customer["email"], seeded_customer["password"])
  assert cart_contains(api_client, token, sample_product["_id"])
  print("==== Add-To-Cart Test PASSED ====")


def test_add_to_wishlist_ui(driver, api_client, seeded_customer, sample_product, step_logger):
  print("==== Starting Add-To-Wishlist Test ====")
  login_via_ui(driver, seeded_customer["email"], seeded_customer["password"], step_logger)
  open_product_detail(driver, sample_product["_id"], step_logger)

  wishlist_button = WebDriverWait(driver, 20).until(
    EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Add to Wishlist')]"))
  )
  driver.execute_script("arguments[0].scrollIntoView({block:'center'});", wishlist_button)
  wishlist_button.click()
  step_logger(f"Clicked Add to Wishlist for {sample_product['name']}")
  WebDriverWait(driver, 5).until(lambda d: True)

  driver.get(f"{settings.base_url}/wishlist")
  Waits.wait_for_text(driver, (By.TAG_NAME, "h1"), "My Wishlist")
  step_logger("Viewed wishlist page")

  token = api_login(api_client, seeded_customer["email"], seeded_customer["password"])
  assert wishlist_contains(api_client, token, sample_product["_id"])
  print("==== Add-To-Wishlist Test PASSED ====")

