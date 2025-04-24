def test_export_inventory_csv(client):
    # Send GET request to the API endpoint
    response = client.get("/api/export_inventory_csv")

    # Assert the response status code
    assert response.status_code == 200

    # Assert the content type is CSV
    assert response.headers["Content-Type"] == "text/csv; charset=utf-8"

    # Assert the content disposition header for file download
    assert (
        "attachment; filename=inventory_report.csv"
        in response.headers["Content-Disposition"]
    )

    # Parse the CSV content
    csv_content = response.data.decode("utf-8")
    lines = csv_content.splitlines()

    # Assert the header row is correct
    expected_header = [
        "Sticker Number",
        "Chemical",
        "Location",
        "Sub-Location",
        "MSDS",
        "Comment",
        "Storage Class",
        "Alphabetized by",
        "Chemical Formula & Common Name",
        "Last Updated",
        "Who Updated",
        "Quantity",
        "Minimum Needed",
        "Manufacturer",
        "Product Number",
        "CAS Number",
        "Barcode",
        "Dead?",
    ]
    assert lines[0] == ",".join(expected_header)

    assert lines[1:] == [
        "1001,Acetone,Science Hall 101,Shelf A,,,Flammable,Acetone,C3H6O (Acetone),2025-03-06,Anne,1.0,2.0,Fisher Scientific,A123,67-64-1,,False",
        "1002,Acetone,Science Hall 102,Cabinet B,,,Flammable,Acetone,C3H6O (Acetone),2025-03-06,Anne,1.0,2.0,Fisher Scientific,A123,67-64-1,,True",
        "2001,Water,Science Hall 102,Cabinet B,,,Unclassified,Water,H2O (Water),2025-03-02,Dr. Brown,1.0,10.0,Sigma-Aldrich,W001,7732-18-5,,False",
        "3001,Ethanol,Science Hall 101,Shelf A,,,Flammable,Ethanol,C2H6O (Ethanol),2025-04-15,Anne,1.0,5.0,VWR International,E002,64-17-5,,False",
        "4001,Sodium Hydroxide,Science Hall 102,Cabinet B,,,Corrosive,Sodium Hydroxide,NaOH (Sodium Hydroxide),2025-02-28,Dr. White,1.0,3.0,Avantor Performance Materials,S003,1310-73-2,,False",
        "5001,Hydrochloric Acid,Science Hall 101,Shelf A,,,Corrosive,Hydrochloric Acid,HCl (Hydrochloric Acid),2025-03-20,Anne,1.0,4.0,Fisher Scientific,H004,7647-01-0,,True",
        "6001,Methanol,Science Hall 102,Cabinet B,,,Toxic,Methanol,CH4O (Methanol),2025-04-18,Dr. Lee,1.0,2.0,Sigma-Aldrich,M005,67-56-1,,False",
        "7001,Potassium Nitrate,Science Hall G01,Loading Platform,,,Oxidizer,Potassium Nitrate,KNO3 (Potassium Nitrate),2025-04-08,Bob,1.0,1.0,VWR International,P006,7757-79-1,,False",
        "8001,Sulfuric Acid,Science Hall 103,Stockroom Shelf,,,Corrosive,Sulfuric Acid,H2SO4 (Sulfuric Acid),2025-05-06,Anne,1.0,2.0,Merck,S007,7664-93-9,,False",
        "9001,Copper(II) Sulfate,Science Hall 104,Prep Table,,,Toxic,Copper(II) Sulfate,CuSO4 (Copper(II) Sulfate),2025-05-15,Dr. Indigo,1.0,0.5,Honeywell,C008,7758-98-7,,False",
        "10001,Ammonia,Science Hall 103,Stockroom Shelf,,,Toxic,Ammonia,NH3 (Ammonia),2025-06-06,Bob,1.0,1.0,BDB,A009,7664-41-7,,False",
    ]
