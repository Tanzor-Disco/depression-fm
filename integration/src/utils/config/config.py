import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass
class Config:
    csv_link: str
    model_name: str
    model_api_key: str
    db_url: str
    model_url: str


def load_config() -> Config:
    load_dotenv()
    csv_link = os.environ["TRACKS_CSV_URL"]
    model_name = os.environ["MODEL_NAME"]
    model_api_key = os.environ["MODEL_API_KEY"]
    db_url = os.environ["DATABASE_URL"]
    model_url = os.environ["MODEL_URL"]

    return Config(
        csv_link=csv_link,
        model_name=model_name,
        model_api_key=model_api_key,
        db_url=db_url,
        model_url=model_url,
    )
