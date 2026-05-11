"""Settings endpoints for local .env API key management."""

import os
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..deps import get_scan_manager

router = APIRouter(prefix="/api/settings", tags=["settings"])

PROJECT_ROOT = Path(__file__).resolve().parents[3]
ENV_PATH = PROJECT_ROOT / ".env"
KEY_NAME = "ANTHROPIC_API_KEY"


class ApiKeyRequest(BaseModel):
    api_key: str


def mask_key(value: str) -> str:
    if len(value) <= 10:
        return "********"
    return f"{value[:7]}...{value[-4:]}"


def read_env_lines() -> list[str]:
    if not ENV_PATH.exists():
        return []
    return ENV_PATH.read_text(encoding="utf-8").splitlines()


def write_env_key(api_key: str) -> None:
    lines = read_env_lines()
    key_pattern = re.compile(rf"^\s*{re.escape(KEY_NAME)}\s*=")
    replaced = False
    next_lines: list[str] = []

    for line in lines:
        if key_pattern.match(line):
            next_lines.append(f"{KEY_NAME}={api_key}")
            replaced = True
        else:
            next_lines.append(line)

    if not replaced:
        if next_lines and next_lines[-1].strip():
            next_lines.append("")
        next_lines.append(f"{KEY_NAME}={api_key}")

    ENV_PATH.write_text("\n".join(next_lines) + "\n", encoding="utf-8")
    os.environ[KEY_NAME] = api_key
    get_scan_manager().api_key = api_key
    load_dotenv(ENV_PATH, override=True)


def delete_env_key() -> bool:
    if not ENV_PATH.exists():
        os.environ.pop(KEY_NAME, None)
        get_scan_manager().api_key = None
        return False

    lines = read_env_lines()
    key_pattern = re.compile(rf"^\s*{re.escape(KEY_NAME)}\s*=")
    next_lines = [line for line in lines if not key_pattern.match(line)]

    if len(next_lines) == len(lines):
        os.environ.pop(KEY_NAME, None)
        get_scan_manager().api_key = None
        return False

    if any(line.strip() for line in next_lines):
        ENV_PATH.write_text("\n".join(next_lines) + "\n", encoding="utf-8")
    else:
        ENV_PATH.unlink()

    os.environ.pop(KEY_NAME, None)
    get_scan_manager().api_key = None
    return True


@router.get("/api-key")
def get_api_key_status():
    value = os.environ.get(KEY_NAME)

    if not value and ENV_PATH.exists():
        load_dotenv(ENV_PATH, override=True)
        value = os.environ.get(KEY_NAME)

    return {
        "exists": bool(value),
        "masked": mask_key(value) if value else None,
        "env_file_exists": ENV_PATH.exists(),
    }


@router.post("/api-key")
def save_api_key(payload: ApiKeyRequest):
    api_key = payload.api_key.strip()

    if not api_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")

    if any(character.isspace() for character in api_key):
        raise HTTPException(status_code=400, detail="API key has invalid whitespace")

    write_env_key(api_key)

    return {
        "exists": True,
        "masked": mask_key(api_key),
        "env_file_exists": True,
    }


@router.delete("/api-key")
def remove_api_key():
    deleted = delete_env_key()

    return {
        "deleted": deleted,
        "exists": False,
        "masked": None,
        "env_file_exists": ENV_PATH.exists(),
    }
