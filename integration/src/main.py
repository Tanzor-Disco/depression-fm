import os
from asyncio import run

from dotenv import load_dotenv

from src.fetcher import Fetcher


async def main():
    load_dotenv()
    csv_link = os.environ["TRACKS_CSV_URL"]

    fetcher = Fetcher(csv_link)
    sheet_info = await fetcher.fetch_songs()
    print(sheet_info)


if __name__ == "__main__":
    run(main())
