"""
Supabase access-token verification.

Supabase issues a JWT to the browser after login. The frontend sends it as
`Authorization: Bearer <token>` and the backend verifies it here before
trusting any claim inside it.
"""

from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

import httpx
import jwt
from jwt import PyJWKClient

from app.core.config import settings

ASYMMETRIC_ALGORITHMS = ["RS256", "ES256", "EdDSA"]


class AuthError(Exception):
    """Raised when a token is missing, malformed, expired or not signed by Supabase."""


@lru_cache
def _jwks_client() -> PyJWKClient:
    # PyJWKClient caches the public keys and refetches when an unknown `kid` appears.
    return PyJWKClient(f"{settings.supabase_auth_url}/.well-known/jwks.json", cache_keys=True)


def _signing_key(token: str) -> Tuple[Any, List[str]]:
    try:
        header = jwt.get_unverified_header(token)
    except jwt.InvalidTokenError as exc:
        raise AuthError("Malformed token") from exc

    alg = header.get("alg")
    if alg == "HS256":
        if not settings.SUPABASE_JWT_SECRET:
            raise AuthError("HS256 tokens are not accepted: SUPABASE_JWT_SECRET is not configured")
        return settings.SUPABASE_JWT_SECRET, ["HS256"]

    if alg in ASYMMETRIC_ALGORITHMS:
        try:
            return _jwks_client().get_signing_key_from_jwt(token).key, [alg]
        except jwt.PyJWKClientError as exc:
            raise AuthError("Unable to resolve token signing key") from exc

    # Rejects alg=none and anything unexpected
    raise AuthError("Unsupported token algorithm")


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """Verify signature, expiry, audience and issuer; return the token claims."""
    if not settings.SUPABASE_URL:
        raise AuthError("SUPABASE_URL is not configured on the server")

    key, algorithms = _signing_key(token)
    try:
        return jwt.decode(
            token,
            key,
            algorithms=algorithms,
            audience=settings.SUPABASE_JWT_AUDIENCE,
            issuer=settings.supabase_auth_url,
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthError("Token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthError("Invalid token") from exc


def fetch_email_confirmed_at(token: str) -> Optional[str]:
    """
    Ask Supabase for the user's authoritative `email_confirmed_at`.

    The JWT's user_metadata is editable by the user, so it must not be trusted
    for verification status. This call also fails for sessions that were
    revoked (e.g. after logout), which a signature check alone cannot detect.
    """
    if not settings.SUPABASE_ANON_KEY:
        raise AuthError("SUPABASE_ANON_KEY is not configured on the server")

    try:
        resp = httpx.get(
            f"{settings.supabase_auth_url}/user",
            headers={"apikey": settings.SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
            timeout=5.0,
        )
    except httpx.HTTPError as exc:
        raise AuthError("Could not reach Supabase to confirm email status") from exc

    if resp.status_code != 200:
        raise AuthError("Session is no longer valid")
    return resp.json().get("email_confirmed_at")
