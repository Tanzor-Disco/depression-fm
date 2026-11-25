from csv import DictReader
from dataclasses import dataclass
from io import StringIO

import httpx


@dataclass
class SongEntry:
    spotify_id: str
    title: str
    artist: str
    cover_url: str
    spotify_link: str


def get_spotify_id(spotify_link: str) -> str:
    parts = spotify_link.split("/")
    id_and_param = parts[4]
    id = id_and_param.split("?")[0]
    return id


def create_entries(song_dicts: list[dict[str, str]]) -> list[SongEntry]:
    entries: list[SongEntry] = []
    for song_dict in song_dicts:
        entry = SongEntry(
            get_spotify_id(song_dict["spotify_link"]),
            song_dict["title"],
            song_dict["artist"],
            song_dict["cover_url"],
            song_dict["spotify_link"],
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
