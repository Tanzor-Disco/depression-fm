from dataclasses import dataclass


@dataclass
class SongEntry:
    id: int
    spotify_id: str
    title: str
    artist: str
    image_url: str
    spotify_url: str
    description: str
