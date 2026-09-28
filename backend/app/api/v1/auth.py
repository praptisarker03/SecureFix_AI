from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, get_verified_user, require_role

router = APIRouter()


@router.get("/auth/me", summary="Current User")
def read_current_user(user: CurrentUser = Depends(get_verified_user)):
    """
    Returns the authenticated, email-verified user as seen by the backend.
    """
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "email_verified": True,
        "aal": user.claims.get("aal"),
    }


@router.get("/admin/overview", summary="Admin Overview")
def read_admin_overview(user: CurrentUser = Depends(require_role("admin"))):
    """
    Example admin-only endpoint.
    """
    return {"message": f"Welcome, admin {user.email}", "role": user.role}
