from flask import Flask
from sqlalchemy import URL, Table
from sqlalchemy.orm import DeclarativeBase
from flask_sqlalchemy import SQLAlchemy
from flask_oidc import OpenIDConnect
import os
print("Starting up")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = URL.create(
    drivername="mysql+mysqlconnector",
    username=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    host="mysql",
    database=os.getenv("MYSQL_DATABASE")
)

app.config['SECRET_KEY'] = os.getenv("CHEMINV_SECRET_KEY")

# Minimal OIDC configuration using environment variables.
# When the issuer supports discovery, Flask‑OIDC will automatically retrieve the metadata
# from: <OIDC_ISSUER> + "/.well-known/openid-configuration"
app.config['OIDC_CLIENT_SECRETS'] = {
    "web": {
        "client_id": os.environ.get("CHEMINV_OIDC_CLIENT_ID"),
        "client_secret": os.environ.get("CHEMINV_OIDC_CLIENT_SECRET"),
        "issuer": os.environ.get("CHEMINV_OIDC_ISSUER"),  # e.g. "https://your-idp.example.com"
        "redirect_uris": [
            os.environ.get("CHEMINV_OIDC_REDIRECT_URI")
        ]
    }
}

# Additional settings
app.config['OIDC_SCOPES'] = "openid email profile"
app.config.setdefault("OIDC_COOKIE_SECURE", False)


db = SQLAlchemy(app)
oidc = OpenIDConnect(app)

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
@oidc.require_login
def get_users():
    return "<br/>".join([user.User_Name for user in db.session.query(User).all()])

if __name__ == '__main__':
    app.run()