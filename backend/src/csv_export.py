from flask import Blueprint, request, jsonify, Response
from database import db
from models import Inventory
from sqlalchemy.orm import joinedload
import csv
import io
import logging

# Configure logging
logger = logging.getLogger(__name__)

csv_export = Blueprint("csv_export", __name__)


@csv_export.route("/api/export_inventory_csv", methods=["GET"])
def export_inventory_csv():
    """
    Export the inventory to a CSV file.
    :return: CSV file.
    """
    logger.info("Starting inventory CSV export.")
    output = io.StringIO()
    writer = csv.writer(output)

    # Add a header row

    # Write the header row first
    writer.writerow(
        [
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
    )

    try:
        # Get the inventory records.
        inventory_items = db.session.query(Inventory).all()
        logger.info(f"Retrieved {len(inventory_items)} inventory items from the database.")

        # Write each row to the CSV file
        for item in inventory_items:
            # Get the Chemical_Manufacturer record
            chem_mfg = item.Chemical_Manufacturer
            # Get the Chemical record via the join table
            chem = chem_mfg.Chemical

            # Build a location string from the related Sub_Location and Location (if available)
            location = ""
            if item.Sub_Location and item.Sub_Location.Location:
                loc = item.Sub_Location.Location
                location = f"{loc.Building} {loc.Room}"

            # Combine the chemical formula and name.
            if chem.Chemical_Formula:
                chem_formula_common = f"{chem.Chemical_Formula} ({chem.Chemical_Name})"
            else:
                chem_formula_common = chem.Chemical_Name

            writer.writerow(
                [
                    item.Sticker_Number,
                    chem.Chemical_Name,
                    location,
                    item.Sub_Location.Sub_Location_Name if item.Sub_Location else None,
                    chem_mfg.MSDS,  # MSDS from the Chemical_Manufacturer join record
                    item.Comment
                    or chem_mfg.Comment,  # Prefer the inventory comment, fallback to the join comment
                    chem.Storage_Class.Storage_Class_Name if chem.Storage_Class else None,
                    chem.Alphabetical_Name,
                    chem_formula_common,
                    item.Last_Updated,
                    item.Who_Updated,
                    item.Quantity,
                    chem.Minimum_On_Hand,
                    (
                        chem_mfg.Manufacturer.Manufacturer_Name
                        if chem_mfg.Manufacturer
                        else None
                    ),
                    chem_mfg.Product_Number,
                    chem_mfg.CAS_Number,
                    chem_mfg.Barcode,
                    item.Is_Dead,
                ]
            )

        output.seek(0)
        logger.info("CSV export completed successfully.")

        # Create the response object with the correct headers for a CSV download.
        response = Response(output.getvalue(), mimetype="text/csv")
        response.headers["Content-Disposition"] = (
            "attachment; filename=inventory_report.csv"
        )
        return response

    except Exception as e:
        logger.error(f"An error occurred during CSV export: {e}")
        return jsonify({"error": "Failed to export inventory CSV"}), 500
