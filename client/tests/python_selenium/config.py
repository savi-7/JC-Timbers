from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
  base_url: str = os.getenv("E2E_BASE_URL", "http://localhost:5173")
  api_base_url: str = os.getenv("E2E_API_BASE_URL", "http://localhost:5001/api")
  headless: bool = os.getenv("E2E_HEADLESS", "true").lower() in {"1", "true", "yes"}


settings = Settings()


