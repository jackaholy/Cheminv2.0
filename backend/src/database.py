import os
import time
import logging
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy.engine import URL
from sqlalchemy.exc import DatabaseError, OperationalError

load_dotenv()
logger = logging.getLogger(__name__)

db = SQLAlchemy()


def init_db(app):
    logger.info("Initializing database")
    app.config["SQLALCHEMY_DATABASE_URI"] = URL.create(
        drivername="mysql+pymysql",
        username=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        host=os.getenv("MYSQL_HOST"),
        database=os.getenv("MYSQL_DATABASE"),
        port=os.getenv("MYSQL_PORT"),
    )
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
    return db
    logger.info("Database ready")
