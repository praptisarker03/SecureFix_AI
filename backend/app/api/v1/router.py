from fastapi import APIRouter
from app.api.v1 import auth, health

api_router = APIRouter()

# Register health check router under /api/v1
api_router.include_router(health.router, tags=["Health"])

# Authenticated, email-verified and role-protected endpoints
api_router.include_router(auth.router, tags=["Auth"])
