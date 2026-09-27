"""
Common dependencies for FastAPI endpoints.
Shared database sessions, auth checks, and external services can be provided here.
"""

from typing import Generator


def get_db() -> Generator:
    """
    Placeholder dependency for database sessions.
    Will be updated when Supabase / database client is configured.
    """
    try:
        yield
    finally:
        pass
