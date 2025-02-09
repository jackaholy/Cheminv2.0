from flask import g, Flask
from sqlalchemy import URL, Table,  Column, Integer, String, Float, Date, ForeignKey, Boolean
from sqlalchemy.exc import DatabaseError
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
from flask_oidc import OpenIDConnect
import os
from dotenv import load_dotenv
import time
import waitress
print("Initializing app")
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    host=os.getenv("MYSQL_HOST"),
    database=os.getenv("MYSQL_DATABASE"),
    port=os.getenv("MYSQL_PORT")
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
Base = declarative_base()

class Chemical(Base):
    __tablename__ = 'Chemical'
    
    Chemical_ID = Column(Integer, primary_key=True, autoincrement=True)
    Chemical_Name = Column(String(90), nullable=False)
    Chemical_Formula = Column(String(70), nullable=True)
    Storage_Class_ID = Column(Integer, ForeignKey('Storage_Class.Storage_Class_ID'), nullable=False)
    Alphabetical_Name = Column(String(65), nullable=False)
    Order_More = Column(Boolean, nullable=True)
    Order_Description = Column(String(70), nullable=True)
    Who_Requested = Column(String(20), nullable=True)
    When_Requested = Column(Date, nullable=True)
    Date_Ordered = Column(Date, nullable=True)
    Who_Ordered = Column(String(20), nullable=True)
    Minimum_On_Hand = Column(Float, nullable=True)
    Minimum_Unit_ID = Column(Integer, ForeignKey('Unit.Unit_ID'), nullable=True)
    
    storage_class = relationship("StorageClass", back_populates="chemicals")
    minimum_unit = relationship("Unit", back_populates="chemicals")

class StorageClass(Base):
    __tablename__ = 'Storage_Class'
    
    Storage_Class_ID = Column(Integer, primary_key=True)
    chemicals = relationship("Chemical", back_populates="storage_class")

class Unit(Base):
    __tablename__ = 'Unit'
    
    Unit_ID = Column(Integer, primary_key=True)
    chemicals = relationship("Chemical", back_populates="minimum_unit")

# There's probably a better way to do this: https://stackoverflow.com/questions/39955521/sqlalchemy-existing-database-query



@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/chemicals')
@oidc.require_login
def get_chemicals():
    return "You signed in as "+g.oidc_user.name+"<br/>"+"<br/>".join([chemical.Chemical_Name for chemical in db.session.query(Chemical).all()])

if __name__ == '__main__':
    if os.getenv("CHEMINV_EVN") == "development":
        app.run(debug=True)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)