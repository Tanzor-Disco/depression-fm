import os
from asyncio import run

from dotenv import load_dotenv

from src.compare import get_changed_songs
from src.db import Database
from src.fetcher import Fetcher
from src.model import ModelAPI
from src.sync import sync_songs


async def main():
    load_dotenv()
    csv_link = os.environ["TRACKS_CSV_URL"]
    model_name = os.environ["MODEL_NAME"]
    model_api_key = os.environ["MODEL_API_KEY"]
    db_url = os.environ["DATABASE_URL"]
    model_url = os.environ["MODEL_URL"]

    fetcher = Fetcher(csv_link)
    database = Database(db_url)
    model = ModelAPI(model_api_key, model_name, model_url)
    synced = await sync_songs(fetcher, database, model)
    print(synced)


if __name__ == "__main__":
    run(main())
