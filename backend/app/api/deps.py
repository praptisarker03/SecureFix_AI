"""
Common dependencies for FastAPI endpoints.
Shared database sessions, auth checks, and external services can be provided here.
"""

from typing import Any, Callable, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.core.security import AuthError, fetch_email_confirmed_at, verify_supabase_jwt

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: str
    email: Optional[str] = None
    # Application role from app_metadata (only the service role can change it),
    # not the Postgres `role` claim, which is always "authenticated".
    role: str = "user"
    claims: Dict[str, Any]
    token: str


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> CurrentUser:
    """Authentication: require a valid Supabase access token."""
    if credentials is None:
        raise _unauthorized("Not authenticated")

    try:
        claims = verify_supabase_jwt(credentials.credentials)
    except AuthError as exc:
        raise _unauthorized(str(exc)) from exc

    if claims.get("role") != "authenticated" or claims.get("is_anonymous"):
        raise _unauthorized("Not authenticated")

    app_metadata = claims.get("app_metadata") or {}
    return CurrentUser(
        id=claims["sub"],
        email=claims.get("email"),
        role=app_metadata.get("role") or "user",
        claims=claims,
        token=credentials.credentials,
    )


def get_verified_user(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """Verification: the user must have confirmed their email address."""
    try:
        confirmed_at = fetch_email_confirmed_at(user.token)
    except AuthError as exc:
        raise _unauthorized(str(exc)) from exc

    if not confirmed_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address has not been verified",
        )
    return user


def require_role(*roles: str) -> Callable[..., CurrentUser]:
    """Authorization: allow only verified users whose app role is in `roles`."""

    def checker(user: CurrentUser = Depends(get_verified_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return user

    return checker
