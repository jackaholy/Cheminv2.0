from flask import Flask
from sqlalchemy import URL, Table
from sqlalchemy.orm import DeclarativeBase
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# HACK: Wait for MySQL to be ready
import time
time.sleep(5)

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = URL.create(
    drivername="mysql+mysqlconnector",
    username=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    host="mysql",
    database=os.getenv("MYSQL_DATABASE")
)
db = SQLAlchemy(app)

# There's probably a better way to do this: https://stackoverflow.com/questions/39955521/sqlalchemy-existing-database-query
class Base(DeclarativeBase):
    pass
with app.app_context():
    class User(Base):
        __table__ = Table('User', Base.metadata, autoload_with=db.engine)


@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/users')
def get_users():
    return "<br/>".join([user.User_Name for user in db.session.query(User).all()])

if __name__ == '__main__':
    app.run()