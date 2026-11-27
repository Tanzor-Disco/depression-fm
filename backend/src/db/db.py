from dataclasses import dataclass
from typing import Self

from psycopg import AsyncConnection
from psycopg.rows import TupleRow, class_row
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
    def __init__(self, pool: AsyncConnectionPool[AsyncConnection[TupleRow]]):
        self.pool = pool

    @classmethod
    async def connect_db(cls, db_url) -> Self:
        pool: AsyncConnectionPool[AsyncConnection[TupleRow]] = AsyncConnectionPool(
            db_url, open=False
        )
        await pool.open(wait=True)
        return cls(pool)

    async def get_random_song(self) -> SongEntry | None:
        async with self.pool.connection() as conn:
            async with conn.cursor(row_factory=class_row(SongEntry)) as cur:
                result = await cur.execute("""
                    SELECT id,spotify_id, title, artist, image_url, spotify_url, description
                    FROM songs
                    ORDER BY random()
                    LIMIT 1
                    """)
                row = await result.fetchone()
                return row
