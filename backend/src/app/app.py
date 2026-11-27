from fastapi import APIRouter, FastAPI
from src.app.routers.songs.songs import register_songs_routes
from src.db import Database


def create_app(db: Database) -> FastAPI:
    app = FastAPI()
    app.state.db = db

    router = APIRouter(prefix="/api")
    register_songs_routes(router)

    app.include_router(router)

    return app
