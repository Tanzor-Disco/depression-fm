from fastapi import APIRouter

from .random import register_random_handler


def register_songs_routes(router: APIRouter):
    songs_router = APIRouter(prefix="/songs")
    register_random_handler(songs_router)
    router.include_router(songs_router)
