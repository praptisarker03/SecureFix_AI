import time

import jwt
import pytest
from fastapi.testclient import TestClient

from app.api import deps
from app.core.config import settings
from app.main import app

SUPABASE_URL = "https://test-project.supabase.co"
SECRET = "test-secret-at-least-32-bytes-long-000"


@pytest.fixture(autouse=True)
def supabase_settings(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_URL", SUPABASE_URL)
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", SECRET)
    monkeypatch.setattr(settings, "SUPABASE_ANON_KEY", "anon")
    monkeypatch.setattr(deps, "fetch_email_confirmed_at", lambda token: "2026-01-01T00:00:00Z")


client = TestClient(app)


def make_token(secret=SECRET, alg="HS256", **overrides):
    claims = {
        "sub": "user-123",
        "email": "dev@example.com",
        "aud": "authenticated",
        "iss": f"{SUPABASE_URL}/auth/v1",
        "role": "authenticated",
        "exp": int(time.time()) + 3600,
        "app_metadata": {"provider": "email"},
    }
    claims.update(overrides)
    return jwt.encode(claims, secret, algorithm=alg)


def get(path, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return client.get(f"/api/v1{path}", headers=headers)


def test_health_is_public():
    assert get("/health").status_code == 200


def test_me_requires_token():
    assert get("/auth/me").status_code == 401


def test_me_with_valid_token():
    resp = get("/auth/me", make_token())
    assert resp.status_code == 200
    assert resp.json()["id"] == "user-123"
    assert resp.json()["role"] == "user"


@pytest.mark.parametrize(
    "token",
    [
        "not-a-jwt",
        make_token(secret="wrong-secret-at-least-32-bytes-long-0"),
        make_token(exp=int(time.time()) - 10),
        make_token(aud="something-else"),
        make_token(iss="https://evil.example.com/auth/v1"),
        make_token(role="anon"),
        jwt.encode({"sub": "user-123"}, key=None, algorithm="none"),
    ],
    ids=["garbage", "bad-signature", "expired", "bad-audience", "bad-issuer", "anon-role", "alg-none"],
)
def test_me_rejects_bad_tokens(token):
    assert get("/auth/me", token).status_code == 401


def test_unverified_email_is_forbidden(monkeypatch):
    monkeypatch.setattr(deps, "fetch_email_confirmed_at", lambda token: None)
    assert get("/auth/me", make_token()).status_code == 403


def test_admin_route_forbidden_for_regular_user():
    assert get("/admin/overview", make_token()).status_code == 403


def test_role_in_user_metadata_is_ignored():
    # user_metadata is writable by the user, so it must never grant a role
    token = make_token(user_metadata={"role": "admin"})
    assert get("/admin/overview", token).status_code == 403


def test_admin_route_allowed_for_admin():
    token = make_token(app_metadata={"provider": "email", "role": "admin"})
    resp = get("/admin/overview", token)
    assert resp.status_code == 200
    assert resp.json()["role"] == "admin"
