from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
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
    
    # Relationships matching the DB column names/casing
    Storage_Class = relationship("Storage_Class", back_populates="Chemicals")
    Minimum_Unit = relationship(
        "Unit",
        back_populates="Chemicals",
        foreign_keys=[Minimum_Unit_ID]
    )
    Chemical_Manufacturers = relationship("Chemical_Manufacturer", back_populates="Chemical")

class Chemical_Manufacturer(Base):
    __tablename__ = 'Chemical_Manufacturer'
    Chemical_Manufacturer_ID = Column(Integer, primary_key=True, autoincrement=True)
    Chemical_ID = Column(Integer, ForeignKey('Chemical.Chemical_ID'), nullable=False)
    Manufacturer_ID = Column(Integer, ForeignKey('Manufacturer.Manufacturer_ID'), nullable=False)
    Product_Number = Column(String(20), nullable=True)
    CAS_Number = Column(String(20), nullable=True)
    MSDS = Column(String(200), nullable=True)
    Barcode = Column(String(200), nullable=True)
    Comment = Column(String(50), nullable=True)
    
    Chemical = relationship("Chemical", back_populates="Chemical_Manufacturers")
    Manufacturer = relationship("Manufacturer", back_populates="Chemical_Manufacturers")
    Inventory = relationship("Inventory", back_populates="Chemical_Manufacturer")

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
    
    Chemical_Manufacturer = relationship("Chemical_Manufacturer", back_populates="Inventory")
    Sub_Location = relationship("Sub_Location", back_populates="Inventory")
    Unit = relationship("Unit", back_populates="Inventory")

class Location(Base):
    __tablename__ = 'Location'
    Location_ID = Column(Integer, primary_key=True, autoincrement=True)
    Room = Column(String(20), nullable=False)
    Building = Column(String(20), nullable=False)
    
    Sub_Locations = relationship("Sub_Location", back_populates="Location")

class Manufacturer(Base):
    __tablename__ = 'Manufacturer'
    Manufacturer_ID = Column(Integer, primary_key=True, autoincrement=True)
    Manufacturer_Name = Column(String(30), nullable=False)
    
    Chemical_Manufacturers = relationship("Chemical_Manufacturer", back_populates="Manufacturer")

class Storage_Class(Base):
    __tablename__ = 'Storage_Class'
    Storage_Class_ID = Column(Integer, primary_key=True, autoincrement=True)
    Storage_Class_Name = Column(String(20), nullable=False)
    
    # One Storage_Class can be associated with many Chemical records.
    Chemicals = relationship("Chemical", back_populates="Storage_Class")

class Sub_Location(Base):
    __tablename__ = 'Sub_Location'
    Sub_Location_ID = Column(Integer, primary_key=True, autoincrement=True)
    Sub_Location_Name = Column(String(35), nullable=False)
    Location_ID = Column(Integer, ForeignKey('Location.Location_ID'), nullable=False)
    
    Location = relationship("Location", back_populates="Sub_Locations")
    Inventory = relationship("Inventory", back_populates="Sub_Location")

class Unit(Base):
    __tablename__ = 'Unit'
    Unit_ID = Column(Integer, primary_key=True, autoincrement=True)
    Unit_Name = Column(String(30), unique=True, nullable=False)
    Multiply_By = Column(Float, nullable=True)
    
    # A Unit may be referenced by Chemical.Minimum_Unit_ID...
    Chemicals = relationship(
        "Chemical",
        back_populates="Minimum_Unit",
        foreign_keys=lambda: [Chemical.Minimum_Unit_ID]
    )
    # ...and by Inventory.Unit_ID.
    Inventory = relationship("Inventory", back_populates="Unit")
