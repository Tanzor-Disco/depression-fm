from dataclasses import dataclass

from psycopg.rows import class_row
from psycopg_pool import AsyncConnectionPool


@dataclass
class SongEntry:
    id: int
    spotify_id: str
    title: str
    artist: str
    image_url: str
    spotify_url: str
    description: str


class Database:
    def __init__(self, db_url: str):
        self.pool = AsyncConnectionPool(db_url, open=True)

    async def get_songs(self):
        async with self.pool.connection() as conn:
            async with conn.cursor(row_factory=class_row(SongEntry)) as cur:
                await cur.execute("""
                    SELECT id,spotify_id, title, artist, image_url, spotify_url, description
                    FROM songs
                    """)
                return await cur.fetchall()
