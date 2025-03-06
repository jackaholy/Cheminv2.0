import pytest
from app import create_app
from config import TestingConfig
from models import Chemical
from database import db
from sqlalchemy import text


@pytest.fixture(scope="session")
def app():
    """
    This fixture will create a Flask app with the testing configuration
    """
    testing_app = create_app(TestingConfig)
    with testing_app.app_context():
        #db.create_all()
        yield testing_app
