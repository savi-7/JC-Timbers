import random
import string
import time


def unique_email() -> str:
  suffix = int(time.time() * 1000)
  return f"selenium.user.{suffix}@example.com"


def unique_phone() -> str:
  return "9" + "".join(random.choices(string.digits, k=9))


def random_name(prefix: str = "Test") -> str:
  letters = "".join(random.choices(string.ascii_letters, k=5))
  return f"{prefix}{letters}"


