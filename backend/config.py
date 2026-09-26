from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "YatraAI API"
    debug: bool = False
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    ai_base_url: str = ""
    ai_api_key: str = ""
    ai_model: str = "gpt-4o-mini"
    ai_timeout_seconds: float = 45.0
    max_image_bytes: int = 5 * 1024 * 1024

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def ai_configured(self) -> bool:
        if not self.ai_base_url or not self.ai_model:
            return False
        # Local OpenAI-compatible servers commonly do not require a key.
        if self.ai_api_key:
            return True
        return not self.ai_base_url.lower().startswith("https://api.openai.com")


@lru_cache
def get_settings() -> Settings:
    return Settings()
