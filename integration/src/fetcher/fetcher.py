from csv import DictReader
from dataclasses import dataclass
from io import StringIO
from logging import getLogger

import httpx

logger = getLogger(__name__)


@dataclass
class SongEntry:
    spotify_id: str
    title: str
    artist: str
    image_url: str
    spotify_url: str


def get_spotify_id(spotify_link: str) -> str | None:
    parts = spotify_link.split("/")
    try:
        id_and_param = parts[4]
        id = id_and_param.split("?")[0]
    except IndexError:
        logger.exception("invalid spotify_link encountered: %s", spotify_link)
        return None
    return id


def create_entries(song_dicts: list[dict[str, str]]) -> list[SongEntry]:
    entries: list[SongEntry] = []
    for song_dict in song_dicts:
        spotify_id = get_spotify_id(song_dict["spotify_url"])
        if spotify_id is None:
            continue

        entry = SongEntry(
            spotify_id=spotify_id,
            title=song_dict["title"],
            artist=song_dict["artist"],
            image_url=song_dict["image_url"],
            spotify_url=song_dict["spotify_url"],
        )
        entries.append(entry)
    return entries


class Fetcher:
    def __init__(self, csv_link: str):
        self.csv_link = csv_link

    async def fetch_songs(self):
        async with httpx.AsyncClient(follow_redirects=True) as client:
            r = await client.get(self.csv_link)
            songs = list(DictReader(StringIO(r.text)))
            return create_entries(songs)
