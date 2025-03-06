import os
import time
import logging
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy.exc import DatabaseError, OperationalError

load_dotenv()
logger = logging.getLogger(__name__)

db = SQLAlchemy()


def init_db(app):
    logger.info("Initializing database")
    db.init_app(app)

    ready = False
    while not ready:
        try:
            with app.app_context():
                db.engine.connect()
            ready = True
        except (DatabaseError, OperationalError) as e:
            try:
                logger.info("Database not ready, retrying...")
                time.sleep(1)
            except KeyboardInterrupt:
                exit()
        except Exception:
            raise
    logger.info("Database ready")
    return db
