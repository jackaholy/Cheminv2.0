from flask import g, Flask
<<<<<<< HEAD
from sqlalchemy import URL, Table,  Column, Integer, String, Float, Date, ForeignKey, Boolean
=======
from flask_cors import CORS
from sqlalchemy import URL, Table
>>>>>>> main
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

    manufacturers = relationship("ChemicalManufacturer", back_populates="chemical")
    storage_class = relationship("StorageClass", back_populates="chemicals")
    minimum_unit = relationship("Unit", back_populates="chemicals")
class ChemicalManufacturer(Base):
    __tablename__ = 'Chemical_Manufacturer'

    Chemical_Manufacturer_ID = Column(Integer, primary_key=True, autoincrement=True)
    Chemical_ID = Column(Integer, ForeignKey('Chemical.Chemical_ID'), nullable=False)
    Manufacturer_ID = Column(Integer, ForeignKey('Manufacturer.Manufacturer_ID'), nullable=False)
    Product_Number = Column(String(20), nullable=True)
    CAS_Number = Column(String(20), nullable=True)
    MSDS = Column(String(200), nullable=True)
    Barcode = Column(String(200), nullable=True)
    Comment = Column(String(50), nullable=True)

    # Define relationships if needed
    chemical = relationship("Chemical", back_populates="manufacturers")
    manufacturer = relationship("Manufacturer", back_populates="chemicals")
class Inventory(Base):
    __tablename__ = 'Inventory'

    Inventory_ID = Column(Integer, primary_key=True, autoincrement=True)
    Sticker_Number = Column(Integer, unique=True, nullable=False)
    Chemical_Manufacturer_ID = Column(Integer, ForeignKey('Chemical_Manufacturer.Chemical_Manufacturer_ID'), nullable=False)
    Sub_Location_ID = Column(Integer, ForeignKey('Sub_Location.Sub_Location_ID'), nullable=False)
    Quantity = Column(Float, default=1)
    Unit_ID = Column(Integer, ForeignKey('Unit.Unit_ID'), default=1)
    Last_Updated = Column(Date, nullable=True)
    Who_Updated = Column(String(30), nullable=True)
    Is_Dead = Column(Boolean, default=False)
    Comment = Column(String(50), nullable=True)
    Product_Number = Column(String(20), nullable=True)
    CAS_Number = Column(String(20), nullable=True)
    MSDS = Column(String(200), nullable=True)
    Barcode = Column(String(200), nullable=True)

    chemical_manufacturer = relationship("ChemicalManufacturer", back_populates="inventory")
    sub_location = relationship("SubLocation", back_populates="inventory")
    unit = relationship("Unit", back_populates="inventory")

class Location(Base):
    __tablename__ = 'Location'
    Location_ID = Column(Integer, primary_key=True, autoincrement=True)
    Room = Column(String(20), nullable=False)
    Building = Column(String(20), nullable=False)
class SubLocation(Base):
    __tablename__ = 'Sub_Location'
    Sub_Location_ID = Column(Integer, primary_key=True, autoincrement=True)
    Sub_Location_Name = Column(String(35), nullable=False)
    Location_ID = Column(Integer, ForeignKey('Location.Location_ID'), nullable=False)
    
    location = relationship("Location", back_populates="sub_locations")
    inventory = relationship("Inventory", back_populates="sub_location")
class Manufacturer(Base):
    __tablename__ = 'Manufacturer'
    Manufacturer_ID = Column(Integer, primary_key=True, autoincrement=True)
    Manufacturer_Name = Column(String(30), nullable=False)
    chemicals = relationship("ChemicalManufacturer", back_populates="manufacturer")

class StorageClass(Base):
    __tablename__ = 'Storage_Class'
    
    Storage_Class_ID = Column(Integer, primary_key=True)
    chemicals = relationship("Chemical", back_populates="storage_class")


class Unit(Base):
    __tablename__ = 'Unit'
    Unit_ID = Column(Integer, primary_key=True, autoincrement=True)
    Unit_Name = Column(String(30), unique=True, nullable=False)
    Multiply_By = Column(Float, nullable=True)
    to_conversion_unit = relationship("Unit", remote_side=[Unit_ID])

    
    inventory = relationship("Inventory", back_populates="unit")
    chemicals = relationship("Chemical", back_populates="minimum_unit")



cors = CORS(app)


@app.route('/')
def hello_world():
    return 'Hello World!'
@app.route('/api/example')
def get_example():
    return {
        "message": "Hello! This data came from the backend!"
    }
@app.route('/chemicals')
@oidc.require_login
def get_chemicals():
    return "You signed in as "+g.oidc_user.name+"<br/>"+"<br/>".join([chemical.Chemical_Name for chemical in db.session.query(Chemical).all()])

if __name__ == '__main__':
    if os.getenv("CHEMINV_EVN") == "development":
        app.run(debug=True)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)