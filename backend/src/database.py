import os 
import time
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy.engine import URL
from sqlalchemy.exc import DatabaseError, OperationalError

load_dotenv()

db = SQLAlchemy()

def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = URL.create(
        drivername="mysql+pymysql",
        username=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        host=os.getenv("MYSQL_HOST"),
        database=os.getenv("MYSQL_DATABASE"),
        port=os.getenv("MYSQL_PORT")
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
                print("Database not ready, retrying...")
                print(e)
                time.sleep(1)
                pass
            except KeyboardInterrupt:
                exit()
        except Exception:
            raise
    return db
    print("Database ready")