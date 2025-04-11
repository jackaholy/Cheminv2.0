import pytest
from app import create_app
from config import TestingConfig
from models import Chemical
from database import db
from sqlalchemy import text
from datetime import date
from app.models import (
    Chemical,
    Chemical_Manufacturer,
    Inventory,
    Manufacturer,
    Storage_Class,
    Location,
    Sub_Location,
    Unit,
    Permissions,
    User,
)
from sqlalchemy.orm import Session


@pytest.fixture(scope="session")
def app():
    """
    This fixture will create a Flask app with the testing configuration
    """
    testing_app = create_app(TestingConfig)
    with testing_app.app_context():
        # db.create_all()
        yield testing_app


