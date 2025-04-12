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
        # Permissions
        visitor = Permissions(
            Permissions_Name="Visitor", Permissions_Description="Read Only"
        )
        editor = Permissions(
            Permissions_Name="Editor", Permissions_Description="Can Edit"
        )
        full = Permissions(
            Permissions_Name="Full Access", Permissions_Description="Admin Access"
        )
        db.session.add_all([visitor, editor, full])
        db.session.flush()  # Ensure we have Permissions_IDs

        # Users
        anne = User(
            User_Name="anne-admin@example.com",
            Permissions_ID=full.Permissions_ID,
            User_Password="Managed by Auth server",  # Add required password
        )
        db.session.add(anne)

        # Units
        bottle_unit = Unit(Unit_Name="Bottle", Multiply_By=1.0)
        gram_unit = Unit(Unit_Name="Gram", Multiply_By=0.001)
        db.session.add_all([bottle_unit, gram_unit])

        # Storage classes
        flammable = Storage_Class(Storage_Class_Name="Flammable")
        corrosive = Storage_Class(Storage_Class_Name="Corrosive")
        toxic = Storage_Class(Storage_Class_Name="Toxic")
        reactive = Storage_Class(Storage_Class_Name="Reactive")
        oxidizer = Storage_Class(Storage_Class_Name="Oxidizer")
        db.session.add_all([flammable, corrosive, toxic, reactive, oxidizer])

        # Locations and sub-locations
        chem_lab = Location(Building="Science Hall", Room="101")
        storage_room = Location(Building="Science Hall", Room="102")
        receiving_dock = Location(Building="Science Hall", Room="G01")
        stockroom = Location(Building="Science Hall", Room="103")
        prep_room = Location(Building="Science Hall", Room="104")
        db.session.add_all(
            [chem_lab, storage_room, receiving_dock, stockroom, prep_room]
        )
        db.session.flush()  # get IDs

        shelf_a = Sub_Location(
            Sub_Location_Name="Shelf A", Location_ID=chem_lab.Location_ID
        )
        cabinet_b = Sub_Location(
            Sub_Location_Name="Cabinet B", Location_ID=storage_room.Location_ID
        )
        dock_platform = Sub_Location(
            Sub_Location_Name="Loading Platform", Location_ID=receiving_dock.Location_ID
        )
        stockroom_shelf = Sub_Location(
            Sub_Location_Name="Stockroom Shelf", Location_ID=stockroom.Location_ID
        )
        prep_table = Sub_Location(
            Sub_Location_Name="Prep Table", Location_ID=prep_room.Location_ID
        )
        db.session.add_all(
            [shelf_a, cabinet_b, dock_platform, stockroom_shelf, prep_table]
        )
        db.session.flush()

        # Manufacturers
        fisher = Manufacturer(Manufacturer_Name="Fisher Scientific")
        sigma = Manufacturer(Manufacturer_Name="Sigma-Aldrich")
        vwr = Manufacturer(Manufacturer_Name="VWR International")
        avantor = Manufacturer(Manufacturer_Name="Avantor Performance Materials")
        merck = Manufacturer(Manufacturer_Name="Merck")
        honeywell = Manufacturer(Manufacturer_Name="Honeywell")
        bdb = Manufacturer(Manufacturer_Name="BDB")
        tci = Manufacturer(Manufacturer_Name="TCI America")
        db.session.add_all([fisher, sigma, vwr, avantor, merck, honeywell, bdb, tci])
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
        unclassified = Storage_Class(Storage_Class_Name="Unclassified")
        db.session.add(unclassified)
        db.session.flush()
        water = Chemical(
            Chemical_Name="Water",
            Chemical_Formula="H2O",
            Storage_Class=unclassified,  # Water doesn't really have a storage class
            Alphabetical_Name="Water",
            Order_More=False,
            Minimum_On_Hand=10.0,
            Minimum_Unit=bottle_unit,
        )
        ethanol = Chemical(
            Chemical_Name="Ethanol",
            Chemical_Formula="C2H6O",
            Storage_Class=flammable,
            Alphabetical_Name="Ethanol",
            Order_More=True,
            Order_Description="For cleaning",
            Who_Requested="Dr. Lee",
            When_Requested=date(2025, 4, 10),
            Date_Ordered=date(2025, 4, 12),
            Who_Ordered="Anne",
            Minimum_On_Hand=5.0,
            Minimum_Unit=bottle_unit,
        )
        sodium_hydroxide = Chemical(
            Chemical_Name="Sodium Hydroxide",
            Chemical_Formula="NaOH",
            Storage_Class=corrosive,
            Alphabetical_Name="Sodium Hydroxide",
            Order_More=True,
            Order_Description="Used in titrations",
            Who_Requested="Dr. White",
            When_Requested=date(2025, 2, 20),
            Date_Ordered=date(2025, 2, 25),
            Who_Ordered="Bob",
            Minimum_On_Hand=3.0,
            Minimum_Unit=bottle_unit,
        )
        hydrochloric_acid = Chemical(
            Chemical_Name="Hydrochloric Acid",
            Chemical_Formula="HCl",
            Storage_Class=corrosive,
            Alphabetical_Name="Hydrochloric Acid",
            Order_More=True,
            Order_Description="For pH adjustment",
            Who_Requested="Dr. Green",
            When_Requested=date(2025, 3, 15),
            Date_Ordered=date(2025, 3, 18),
            Who_Ordered="Anne",
            Minimum_On_Hand=4.0,
            Minimum_Unit=bottle_unit,
        )
        methanol = Chemical(
            Chemical_Name="Methanol",
            Chemical_Formula="CH4O",
            Storage_Class=toxic,
            Alphabetical_Name="Methanol",
            Order_More=False,
            Minimum_On_Hand=2.0,
            Minimum_Unit=bottle_unit,
        )
        potassium_nitrate = Chemical(
            Chemical_Name="Potassium Nitrate",
            Chemical_Formula="KNO3",
            Storage_Class=oxidizer,
            Alphabetical_Name="Potassium Nitrate",
            Order_More=True,
            Order_Description="For experiments",
            Who_Requested="Dr. Grey",
            When_Requested=date(2025, 4, 1),
            Date_Ordered=date(2025, 4, 5),
            Who_Ordered="Bob",
            Minimum_On_Hand=1.0,
            Minimum_Unit=bottle_unit,
        )
        sulfuric_acid = Chemical(
            Chemical_Name="Sulfuric Acid",
            Chemical_Formula="H2SO4",
            Storage_Class=corrosive,
            Alphabetical_Name="Sulfuric Acid",
            Order_More=True,
            Order_Description="Used in various reactions",
            Who_Requested="Dr. Violet",
            When_Requested=date(2025, 5, 1),
            Date_Ordered=date(2025, 5, 5),
            Who_Ordered="Anne",
            Minimum_On_Hand=2.0,
            Minimum_Unit=bottle_unit,
        )
        copper_sulfate = Chemical(
            Chemical_Name="Copper(II) Sulfate",
            Chemical_Formula="CuSO4",
            Storage_Class=toxic,
            Alphabetical_Name="Copper(II) Sulfate",
            Order_More=False,
            Minimum_On_Hand=0.5,
            Minimum_Unit=gram_unit,
        )
        ammonia = Chemical(
            Chemical_Name="Ammonia",
            Chemical_Formula="NH3",
            Storage_Class=toxic,
            Alphabetical_Name="Ammonia",
            Order_More=True,
            Order_Description="For synthesis",
            Who_Requested="Dr. Indigo",
            When_Requested=date(2025, 5, 10),
            Date_Ordered=date(2025, 5, 12),
            Who_Ordered="Bob",
            Minimum_On_Hand=1.0,
            Minimum_Unit=bottle_unit,
        )
        silver_nitrate = Chemical(
            Chemical_Name="Silver Nitrate",
            Chemical_Formula="AgNO3",
            Storage_Class=reactive,
            Alphabetical_Name="Silver Nitrate",
            Order_More=True,
            Order_Description="For analysis",
            Who_Requested="Dr. Teal",
            When_Requested=date(2025, 6, 1),
            Date_Ordered=date(2025, 6, 5),
            Who_Ordered="Anne",
            Minimum_On_Hand=0.2,
            Minimum_Unit=gram_unit,
        )
        db.session.add_all(
            [
                acetone,
                water,
                ethanol,
                sodium_hydroxide,
                hydrochloric_acid,
                methanol,
                potassium_nitrate,
                sulfuric_acid,
                copper_sulfate,
                ammonia,
                silver_nitrate,
            ]
        )
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
        ethanol_vwr = Chemical_Manufacturer(
            Chemical=ethanol,
            Manufacturer=vwr,
            Product_Number="E002",
            CAS_Number="64-17-5",
        )
        sodium_hydroxide_avantor = Chemical_Manufacturer(
            Chemical=sodium_hydroxide,
            Manufacturer=avantor,
            Product_Number="S003",
            CAS_Number="1310-73-2",
        )
        hydrochloric_acid_fisher = Chemical_Manufacturer(
            Chemical=hydrochloric_acid,
            Manufacturer=fisher,
            Product_Number="H004",
            CAS_Number="7647-01-0",
        )
        methanol_sigma = Chemical_Manufacturer(
            Chemical=methanol,
            Manufacturer=sigma,
            Product_Number="M005",
            CAS_Number="67-56-1",
        )
        potassium_nitrate_vwr = Chemical_Manufacturer(
            Chemical=potassium_nitrate,
            Manufacturer=vwr,
            Product_Number="P006",
            CAS_Number="7757-79-1",
        )
        sulfuric_acid_merck = Chemical_Manufacturer(
            Chemical=sulfuric_acid,
            Manufacturer=merck,
            Product_Number="S007",
            CAS_Number="7664-93-9",
        )
        copper_sulfate_honeywell = Chemical_Manufacturer(
            Chemical=copper_sulfate,
            Manufacturer=honeywell,
            Product_Number="C008",
            CAS_Number="7758-98-7",
        )
        ammonia_bdb = Chemical_Manufacturer(
            Chemical=ammonia,
            Manufacturer=bdb,
            Product_Number="A009",
            CAS_Number="7664-41-7",
        )
        silver_nitrate_tci = Chemical_Manufacturer(
            Chemical=silver_nitrate,
            Manufacturer=tci,
            Product_Number="S010",
            CAS_Number="7761-88-8",
        )
        db.session.add_all(
            [
                acetone_fisher,
                water_sigma,
                ethanol_vwr,
                sodium_hydroxide_avantor,
                hydrochloric_acid_fisher,
                methanol_sigma,
                potassium_nitrate_vwr,
                sulfuric_acid_merck,
                copper_sulfate_honeywell,
                ammonia_bdb,
                silver_nitrate_tci,
            ]
        )
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
        inv4 = Inventory(
            Sticker_Number=3001,
            Chemical_Manufacturer=ethanol_vwr,
            Sub_Location=shelf_a,
            Is_Dead=False,
            Who_Updated="Anne",
            Last_Updated=date(2025, 4, 15),
        )
        inv5 = Inventory(
            Sticker_Number=4001,
            Chemical_Manufacturer=sodium_hydroxide_avantor,
            Sub_Location=cabinet_b,
            Is_Dead=False,
            Who_Updated="Dr. White",
            Last_Updated=date(2025, 2, 28),
        )
        inv6 = Inventory(
            Sticker_Number=5001,
            Chemical_Manufacturer=hydrochloric_acid_fisher,
            Sub_Location=shelf_a,
            Is_Dead=True,
            Who_Updated="Anne",
            Last_Updated=date(2025, 3, 20),
        )
        inv7 = Inventory(
            Sticker_Number=6001,
            Chemical_Manufacturer=methanol_sigma,
            Sub_Location=cabinet_b,
            Is_Dead=False,
            Who_Updated="Dr. Lee",
            Last_Updated=date(2025, 4, 18),
        )
        inv8 = Inventory(
            Sticker_Number=7001,
            Chemical_Manufacturer=potassium_nitrate_vwr,
            Sub_Location=dock_platform,
            Is_Dead=False,
            Who_Updated="Bob",
            Last_Updated=date(2025, 4, 8),
        )
        inv9 = Inventory(
            Sticker_Number=8001,
            Chemical_Manufacturer=sulfuric_acid_merck,
            Sub_Location=stockroom_shelf,
            Is_Dead=False,
            Who_Updated="Anne",
            Last_Updated=date(2025, 5, 6),
        )
        inv10 = Inventory(
            Sticker_Number=9001,
            Chemical_Manufacturer=copper_sulfate_honeywell,
            Sub_Location=prep_table,
            Is_Dead=False,
            Who_Updated="Dr. Indigo",
            Last_Updated=date(2025, 5, 15),
        )
        inv11 = Inventory(
            Sticker_Number=10001,
            Chemical_Manufacturer=ammonia_bdb,
            Sub_Location=stockroom_shelf,
            Is_Dead=False,
            Who_Updated="Bob",
            Last_Updated=date(2025, 6, 6),
        )
        db.session.add_all(
            [
                inv1,
                inv2,
                inv3,
                inv4,
                inv5,
                inv6,
                inv7,
                inv8,
                inv9,
                inv10,
                inv11,
            ]
        )
        db.session.flush()
        db.session.commit()