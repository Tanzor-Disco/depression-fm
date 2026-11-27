import asyncio
import logging
from asyncio import run, sleep

from src.db import Database
from src.fetcher import Fetcher
from src.model import ModelAPI
from src.sync import sync_songs
from src.utils.config import load_config

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpx2").setLevel(logging.WARNING)


async def launch_songs_sync(
    csv_link: str, model_api_key: str, model_name: str, db_url: str, model_url: str
):
    fetcher = Fetcher(csv_link)
    database = await Database.connect_db(db_url)
    model = ModelAPI(model_api_key, model_name, model_url)
    while True:
        logger.info("syncing songs")
        try:
            synced_amount = await sync_songs(fetcher, database, model)
            logger.info("successfully found and synced %s songs", synced_amount)
        except Exception as exc:
            logger.exception("song sync didn't complete successfully: %s", exc)

        await sleep(5 * 60)


async def main():
    config = load_config()

    async with asyncio.TaskGroup() as workers:
        workers.create_task(
            launch_songs_sync(
                csv_link=config.csv_link,
                model_api_key=config.model_api_key,
                model_name=config.model_name,
                db_url=config.db_url,
                model_url=config.model_url,
            )
        )


if __name__ == "__main__":
    run(main())
