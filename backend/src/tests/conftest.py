import pytest
from app import create_app
from config import TestingConfig
from testdata import init_test_data


@pytest.fixture(scope="session")
def app():
    """
    This fixture will create a Flask app with the testing configuration
    """
    testing_app = create_app(TestingConfig)
    init_test_data(testing_app)
    with testing_app.app_context():
        # db.create_all()
        yield testing_app
