import copy
from asyncio import wait
from dataclasses import asdict, dataclass
from typing import Self

from psycopg import AsyncConnection
from psycopg.rows import TupleRow, class_row
from psycopg_pool import AsyncConnectionPool

from src.compare import SongState
from src.model import SongUpdate
from src.utils.models.song_entry import SongEntry


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

    async def get_songs(self):
        async with self.pool.connection() as conn:
            async with conn.cursor(row_factory=class_row(SongEntry)) as cur:
                await cur.execute("""
                    SELECT id,spotify_id, title, artist, image_url, spotify_url, description
                    FROM songs
                    """)
                return await cur.fetchall()

    async def _process_deleted(self, deleted: list[SongUpdate]):
        spotify_ids = [song.spotify_id for song in deleted]
        async with self.pool.connection() as conn:
            await conn.execute(
                """
                DELETE FROM songs 
                WHERE spotify_id = ANY(%s::text[])
                """,
                (spotify_ids,),
            )

    async def _process_modified_and_added(self, modified_and_added: list[SongUpdate]):
        UPSERT_SONG = """
                INSERT INTO songs (spotify_id, title, artist, image_url, spotify_url, description)
                VALUES( %(spotify_id)s, %(title)s, %(artist)s,
                %(image_url)s, %(spotify_url)s, %(description)s 
                )
                ON CONFLICT(spotify_id) DO UPDATE
                SET title = EXCLUDED.title,
                    artist = EXCLUDED.artist,
                    image_url = EXCLUDED.image_url,
                    spotify_url = EXCLUDED.spotify_url,
                    description = EXCLUDED.description 
                """
        async with self.pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.executemany(
                    UPSERT_SONG, [asdict(song) for song in modified_and_added]
                )

    async def process_song_updates(
        self, song_updates: dict[SongState, list[SongUpdate]]
    ):
        await self._process_deleted(song_updates[SongState.Deleted])
        modified_and_added = (
            song_updates[SongState.Modified] + song_updates[SongState.Added]
        )
        await self._process_modified_and_added(modified_and_added)
