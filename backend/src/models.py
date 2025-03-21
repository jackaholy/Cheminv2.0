from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean

Base = declarative_base()


class Chemical(Base):
    """
    A kind of chemical. Acetone, water, whatever
    """

    __tablename__ = "Chemical"
    # Database ID for a type of chemical
    Chemical_ID = Column(Integer, primary_key=True, autoincrement=True)
    # Name for a type of chemical: I.E. Acetone
    Chemical_Name = Column(String(90), nullable=False)
    # Chemical formula for a type of chemical: H20
    Chemical_Formula = Column(String(70), nullable=True)
    # The ID for the storage class. See: Storage_Class
    Storage_Class_ID = Column(
        Integer, ForeignKey("Storage_Class.Storage_Class_ID"), nullable=False
    )

    # Unused?
    Alphabetical_Name = Column(String(65), nullable=False)
    Order_More = Column(Boolean, nullable=True)
    Order_Description = Column(String(70), nullable=True)
    Who_Requested = Column(String(20), nullable=True)
    When_Requested = Column(Date, nullable=True)
    Date_Ordered = Column(Date, nullable=True)
    Who_Ordered = Column(String(20), nullable=True)
    Minimum_On_Hand = Column(Float, nullable=True)
    Minimum_Unit_ID = Column(Integer, ForeignKey("Unit.Unit_ID"), nullable=True)

    # Relationships matching the DB column names/casing
    Storage_Class = relationship("Storage_Class", back_populates="Chemicals")
    Minimum_Unit = relationship(
        "Unit", back_populates="Chemicals", foreign_keys=[Minimum_Unit_ID]
    )
    Chemical_Manufacturers = relationship(
        "Chemical_Manufacturer", back_populates="Chemical"
    )

    def __hash__(self):
        return hash(self.Chemical_ID)

    def __eq__(self, other):
        return self.Chemical_ID == other.Chemical_ID


class Chemical_Manufacturer(Base):
    """
    Joiner table for a chemical and a manufacturer
    """

    __tablename__ = "Chemical_Manufacturer"
    Chemical_Manufacturer_ID = Column(Integer, primary_key=True, autoincrement=True)
    Chemical_ID = Column(Integer, ForeignKey("Chemical.Chemical_ID"), nullable=False)
    Manufacturer_ID = Column(
        Integer, ForeignKey("Manufacturer.Manufacturer_ID"), nullable=False
    )
    # The "model number" for a bottle of the chemical
    Product_Number = Column(String(20), nullable=True)

    # Unused?
    CAS_Number = Column(String(20), nullable=True)
    MSDS = Column(String(200), nullable=True)
    Barcode = Column(String(200), nullable=True)
    Comment = Column(String(50), nullable=True)

    Chemical = relationship("Chemical", back_populates="Chemical_Manufacturers")
    Manufacturer = relationship("Manufacturer", back_populates="Chemical_Manufacturers")
    Inventory = relationship("Inventory", back_populates="Chemical_Manufacturer")


class Inventory(Base):
    """
    A bottle of a chemical, in a particular location
    """

    __tablename__ = "Inventory"
    # Database ID for an individual bottle of the chemical
    Inventory_ID = Column(Integer, primary_key=True, autoincrement=True)
    # Sticker number for a bottle of the chemical
    Sticker_Number = Column(Integer, unique=True, nullable=False)
    # Who made it
    Chemical_Manufacturer_ID = Column(
        Integer,
        ForeignKey("Chemical_Manufacturer.Chemical_Manufacturer_ID"),
        nullable=False,
    )
    # What shelf/cabinet/etc. the bottle is in
    Sub_Location_ID = Column(
        Integer, ForeignKey("Sub_Location.Sub_Location_ID"), nullable=False
    )

    # DO NOT USE THIS. Always manually count
    Quantity = Column(Float, default=1)
    # Unused. Always "bottle"
    Unit_ID = Column(Integer, ForeignKey("Unit.Unit_ID"), default=1)

    # When the bottle was last seen
    Last_Updated = Column(Date, nullable=True)
    # Who saw it last
    Who_Updated = Column(String(30), nullable=True)
    # Whether the bottle is empty/trashed
    Is_Dead = Column(Boolean, default=False)
    # Unused?
    Comment = Column(String(50), nullable=True)
    # The "model number" for a bottle of the chemical
    Product_Number = Column(String(20), nullable=True)

    # Unused?
    CAS_Number = Column(String(20), nullable=True)
    MSDS = Column(String(200), nullable=True)
    Barcode = Column(String(200), nullable=True)

    Chemical_Manufacturer = relationship(
        "Chemical_Manufacturer", back_populates="Inventory"
    )
    Sub_Location = relationship("Sub_Location", back_populates="Inventory")
    Unit = relationship("Unit", back_populates="Inventory")


class Manufacturer(Base):
    """
    Who actually makes/sells the chemical
    """

    __tablename__ = "Manufacturer"
    # Database ID for a manufacturer of a chemical
    Manufacturer_ID = Column(Integer, primary_key=True, autoincrement=True)
    # The name of the manufacturer
    Manufacturer_Name = Column(String(30), nullable=False)

    Chemical_Manufacturers = relationship(
        "Chemical_Manufacturer", back_populates="Manufacturer"
    )


class Storage_Class(Base):
    """
    How the chemical should be stored. I.e. "Flammable"
    """

    __tablename__ = "Storage_Class"
    # Database ID for a storage class
    Storage_Class_ID = Column(Integer, primary_key=True, autoincrement=True)
    # How the chemical should be stored. I.e. "Flammable"
    Storage_Class_Name = Column(String(20), nullable=False)

    Chemicals = relationship("Chemical", back_populates="Storage_Class")


class Location(Base):
    """
    The building and room the chemical is in
    """

    __tablename__ = "Location"
    Location_ID = Column(Integer, primary_key=True, autoincrement=True)
    # What room the bottle of the chemical is in
    Room = Column(String(20), nullable=False)
    # What building the bottle of the chemical is in
    Building = Column(String(20), nullable=False)

    Sub_Locations = relationship("Sub_Location", back_populates="Location")


class Sub_Location(Base):
    """
    The shelf/cabinet the chemical is in
    """

    __tablename__ = "Sub_Location"
    # Database ID for a sub-location
    Sub_Location_ID = Column(Integer, primary_key=True, autoincrement=True)
    # The name of the shelf/cabinet
    Sub_Location_Name = Column(String(35), nullable=False)
    Location_ID = Column(Integer, ForeignKey("Location.Location_ID"), nullable=False)

    Location = relationship("Location", back_populates="Sub_Locations")
    Inventory = relationship("Inventory", back_populates="Sub_Location")


class Unit(Base):
    """
    UNUSED. Always 1 bottle
    """

    __tablename__ = "Unit"
    Unit_ID = Column(Integer, primary_key=True, autoincrement=True)
    Unit_Name = Column(String(30), unique=True, nullable=False)
    Multiply_By = Column(Float, nullable=True)

    # A Unit may be referenced by Chemical.Minimum_Unit_ID...
    Chemicals = relationship(
        "Chemical",
        back_populates="Minimum_Unit",
        foreign_keys=lambda: [Chemical.Minimum_Unit_ID],
    )
    # ...and by Inventory.Unit_ID.
    Inventory = relationship("Inventory", back_populates="Unit")
