from fastapi import APIRouter

from database import TODOS_CAMPEOES

router=APIRouter(
    prefix="/champions",
    tags=["Champions"]
)


@router.get("")

def listar():

    return TODOS_CAMPEOES