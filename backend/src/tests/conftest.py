import pytest
from app import create_app
from config import TestingConfig
from testdata import init_test_data

@pytest.fixture(scope="function")
def app():
    """
    This fixture will create a Flask app with the testing configuration
    """
    testing_app = create_app(TestingConfig)
    init_test_data(testing_app)
    with testing_app.app_context():
        yield testing_app
