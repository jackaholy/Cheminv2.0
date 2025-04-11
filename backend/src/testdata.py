from models import (
    Chemical,
    Chemical_Manufacturer,
    Inventory,
    Manufacturer,
    Storage_Class,
    Location,
    Sub_Location,
    Unit,
    Permissions,
    User,
)
from datetime import date
from database import db

def init_test_data(app):
    with app.app_context():
        db.create_all()
        db.session.commit()
        # Permissions
        visitor = Permissions(
            Permissions_Name="Visitor", Permissions_Description="Read Only"
        )
        editor = Permissions(
            Permissions_Name="Editor", Permissions_Description="Can Edit"
        )
        full = Permissions(
            Permissions_Name="Full-Access", Permissions_Description="Admin Access"
        )
        db.session.add_all([visitor, editor, full])

        # Users
        anne = User(User_Name="anne-admin@example.com", Permissions_ID=full.Permissions_ID)
        db.session.add(anne)

        # Units
        bottle_unit = Unit(Unit_Name="Bottle", Multiply_By=1.0)
        db.session.add(bottle_unit)

        # Storage classes
        flammable = Storage_Class(Storage_Class_Name="Flammable")
        corrosive = Storage_Class(Storage_Class_Name="Corrosive")
        db.session.add_all([flammable, corrosive])

        # Locations and sub-locations
        chem_lab = Location(Building="Science Hall", Room="101")
        storage_room = Location(Building="Science Hall", Room="102")
        db.session.add_all([chem_lab, storage_room])
        db.session.flush()  # get IDs

        shelf_a = Sub_Location(
            Sub_Location_Name="Shelf A", Location_ID=chem_lab.Location_ID
        )
        cabinet_b = Sub_Location(
            Sub_Location_Name="Cabinet B", Location_ID=storage_room.Location_ID
        )
        db.session.add_all([shelf_a, cabinet_b])
        db.session.flush()

        # Manufacturers
        fisher = Manufacturer(Manufacturer_Name="Fisher Scientific")
        sigma = Manufacturer(Manufacturer_Name="Sigma-Aldrich")
        db.session.add_all([fisher, sigma])
        db.session.flush()

        # Chemicals
        acetone = Chemical(
            Chemical_Name="Acetone",
            Chemical_Formula="C3H6O",
            Storage_Class=flammable,
            Alphabetical_Name="Acetone",
            Order_More=True,
            Order_Description="Frequently used",
            Who_Requested="Dr. Brown",
            When_Requested=date(2025, 3, 1),
            Date_Ordered=date(2025, 3, 5),
            Who_Ordered="Anne",
            Minimum_On_Hand=2.0,
            Minimum_Unit=bottle_unit,
        )
        water = Chemical(
            Chemical_Name="Water",
            Chemical_Formula="H2O",
            Storage_Class=corrosive,
            Alphabetical_Name="Water",
            Order_More=False,
            Minimum_On_Hand=10.0,
            Minimum_Unit=bottle_unit,
        )
        db.session.add_all([acetone, water])
        db.session.flush()

        # Chemical-Manufacturer links
        acetone_fisher = Chemical_Manufacturer(
            Chemical=acetone,
            Manufacturer=fisher,
            Product_Number="A123",
            CAS_Number="67-64-1",
        )
        water_sigma = Chemical_Manufacturer(
            Chemical=water,
            Manufacturer=sigma,
            Product_Number="W001",
            CAS_Number="7732-18-5",
        )
        db.session.add_all([acetone_fisher, water_sigma])
        db.session.flush()

        # Inventory (alive and dead bottles)
        inv1 = Inventory(
            Sticker_Number=1001,
            Chemical_Manufacturer=acetone_fisher,
            Sub_Location=shelf_a,
            Is_Dead=False,
            Who_Updated="Anne",
            Last_Updated=date(2025, 3, 6),
        )
        inv2 = Inventory(
            Sticker_Number=1002,
            Chemical_Manufacturer=acetone_fisher,
            Sub_Location=cabinet_b,
            Is_Dead=True,
            Who_Updated="Anne",
            Last_Updated=date(2025, 3, 6),
        )
        inv3 = Inventory(
            Sticker_Number=2001,
            Chemical_Manufacturer=water_sigma,
            Sub_Location=cabinet_b,
            Is_Dead=False,
            Who_Updated="Dr. Brown",
            Last_Updated=date(2025, 3, 2),
        )
        db.session.add_all([inv1, inv2, inv3])

        db.session.commit()