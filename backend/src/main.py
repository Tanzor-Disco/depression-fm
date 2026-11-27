import asyncio
import os

import uvicorn
from dotenv import load_dotenv
from src.app import create_app
from src.db import Database


async def main():
    load_dotenv()
    db_url = os.environ["DATABASE_URL"]
    database = await Database.connect_db(db_url)
    app = create_app(database)

    server_config = uvicorn.Config(app, host="0.0.0.0", port=8080, access_log=False)
    server = uvicorn.Server(server_config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
