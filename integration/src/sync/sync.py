from logging import getLogger

from httpx import HTTPError

from src.compare import get_changed_songs
from src.db import Database
from src.fetcher import Fetcher
from src.model import DescriptionGenerationError, ModelAPI


async def sync_songs(fetcher: Fetcher, db: Database, model: ModelAPI):
    sheet_songs = await fetcher.fetch_songs()

    db_songs = await db.get_songs()

    changed_songs = get_changed_songs(sheet_songs, db_songs)
    song_updates = await model.process_changed_songs(changed_songs)
    return song_updates
