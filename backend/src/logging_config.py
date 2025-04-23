import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging(app):
    """
    Configure logging for the application
    """
    # Create logs directory as a sibling to src/ if it doesn't exist
    logs_dir = os.path.join(os.path.dirname(__file__), '../logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)

    # Set up file handler for general logs
    file_handler = RotatingFileHandler(
        os.path.join(logs_dir, 'app.log'),
        maxBytes=1024 * 1024,  # 1MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s [%(name)s] %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)

    # Set up console handler for development
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    console_handler.setLevel(logging.DEBUG if app.debug else logging.INFO)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # Set SQLAlchemy logging level to WARNING
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)

    # Log application startup
    app.logger.info('Application startup')
    return app.logger
