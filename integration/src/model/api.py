import json
from dataclasses import asdict, dataclass
from logging import getLogger

from openai import APIError, AsyncClient, OpenAIError
from pydantic import BaseModel, ValidationError

from src.compare import ChangedSong, SongState
from src.fetcher import SongEntry

from .prompt import SYSTEM_PROMPT


class DescriptionGenerationError(Exception):
    """an error that occurs then trying to generate descriptions for songs"""


@dataclass
class SongUpdate:
    state: SongState
    spotify_id: str
    title: str
    artist: str
    image_url: str
    spotify_url: str
    description: str | None


class SongUpdates(BaseModel):
    songs: list[SongUpdate]


class ModelAPI:
    def __init__(self, api_key: str, model_name: str, base_url):
        self.client = AsyncClient(api_key=api_key, base_url=base_url)
        self.model_name = model_name

    async def _get_description_for_songs(
        self, needs_description: list[ChangedSong]
    ) -> list[SongUpdate]:
        changed_songs_json = json.dumps(
            [asdict(song) for song in needs_description],
            ensure_ascii=False,
        )
        try:
            response = await self.client.responses.parse(
                model=self.model_name,
                instructions=SYSTEM_PROMPT,
                input=[
                    {
                        "role": "user",
                        "content": changed_songs_json,
                    }
                ],
                text_format=SongUpdates,
            )
        except (OpenAIError, ValidationError) as exc:
            raise DescriptionGenerationError("error addressing model API") from exc

        parsed = response.output_parsed
        if response.status != "completed" or parsed is None:
            raise DescriptionGenerationError("invalid response from model API")

        return parsed.songs

    async def process_changed_songs(
        self, songs: list[ChangedSong]
    ) -> dict[SongState, list[SongUpdate]]:
        need_description = []
        updates: dict[SongState, list[SongUpdate]] = {
            SongState.Added: [],
            SongState.Modified: [],
            SongState.Deleted: [],
        }

        for song in songs:
            if song.needs_description:
                need_description.append(song)
                continue
            update = SongUpdate(
                state=song.state,
                spotify_id=song.spotify_id,
                title=song.title,
                artist=song.artist,
                image_url=song.image_url,
                spotify_url=song.spotify_url,
                description=None,
            )
            updates[update.state].append(update)

        processed = await self._get_description_for_songs(need_description)
        for song in processed:
            updates[song.state].append(song)
        return updates
