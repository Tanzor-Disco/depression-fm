from dataclasses import dataclass
from enum import StrEnum

from src.db import SongEntry as DBSongEntry
from src.fetcher import SongEntry


class SongState(StrEnum):
    Added = "added"
    Deleted = "deleted"
    Modified = "modified"


@dataclass
class ChangedSong:
    state: SongState
    spotify_id: str
    title: str
    artist: str
    image_url: str
    spotify_url: str
    needs_description: bool


def fields_differ(fetched_song: SongEntry, db_song: DBSongEntry) -> bool:
    if (
        fetched_song.artist != db_song.artist
        or fetched_song.image_url != db_song.image_url
        or fetched_song.spotify_id != db_song.spotify_id
        or fetched_song.title != db_song.title
        or fetched_song.spotify_url != db_song.spotify_url
    ):
        return True
    return False


def get_added_and_modified(
    fetched_songs: list[SongEntry], db_songs: list[DBSongEntry]
) -> list[ChangedSong]:
    db_dict = {song.spotify_id: song for song in db_songs}
    changed: list[ChangedSong] = []
    for song in fetched_songs:
        if not song.spotify_id in db_dict:
            changed_song = ChangedSong(
                state=SongState.Added,
                spotify_id=song.spotify_id,
                title=song.title,
                artist=song.artist,
                image_url=song.image_url,
                spotify_url=song.spotify_url,
                needs_description=True,
            )
            changed.append(changed_song)
            continue

        db_song = db_dict[song.spotify_id]
        if fields_differ(song, db_song):
            changed_song = ChangedSong(
                state=SongState.Modified,
                spotify_id=song.spotify_id,
                title=song.title,
                artist=song.artist,
                image_url=song.image_url,
                spotify_url=song.spotify_url,
                needs_description=(song.title, song.artist)
                != (db_song.artist, db_song.title),
            )
            changed.append(changed_song)
    return changed


def get_deleted(
    fetched_songs: list[SongEntry], db_songs: list[DBSongEntry]
) -> list[ChangedSong]:
    fetch_dict = {song.spotify_id: song for song in fetched_songs}
    deleted: list[ChangedSong] = []
    for song in db_songs:
        if song.spotify_id not in fetch_dict:
            changed_song = ChangedSong(
                state=SongState.Deleted,
                spotify_id=song.spotify_id,
                title=song.title,
                artist=song.artist,
                image_url=song.image_url,
                spotify_url=song.spotify_url,
                needs_description=False,
            )
            deleted.append(changed_song)
    return deleted


def get_changed_songs(
    fetched_songs: list[SongEntry], db_songs: list[DBSongEntry]
) -> list[ChangedSong]:
    changed: list[ChangedSong] = []
    added_and_modified = get_added_and_modified(fetched_songs, db_songs)
    deleted = get_deleted(fetched_songs, db_songs)
    changed.extend(added_and_modified)
    changed.extend(deleted)
    return changed
