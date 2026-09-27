from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="Health Check")
def health_check():
    """
    Returns the operational status of the FixLoop AI backend API.
    """
    return {"status": "ok"}
