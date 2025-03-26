from flask import Blueprint, request, jsonify
from database import db
from models import Inventory
from sqlalchemy.orm import joinedload
import csv
import io

csv_export = Blueprint("csv_export", __name__)


@csv_export.route("/api/export_inventory_csv", methods=["GET"])
def export_inventory_csv():
    """
    Export the inventory to a CSV file.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Add a header row
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
    inventory_items = (
        db.session.query(Inventory)
        .options(
            joinedload(Inventory.chemical),
            joinedload(Inventory.location),
            joinedload(Inventory.sublocation),
            joinedload(Inventory.storage_class),
            joinedload(Inventory.updated_by),  # Corrected attribute name
            joinedload(Inventory.manufacturer),
        )
        .all()
    )

    # Write each row to the CSV file
    for item in inventory_items:
        writer.writerow(
            [
                item.sticker_number,
                item.chemical.name if item.chemical else "",
                item.location.name if item.location else "",
                item.sublocation.name if item.sublocation else "",
                item.msds,
                item.comment,
                item.storage_class.name if item.storage_class else "",
                item.alphabetized_by,
                item.chemical.formula_common_name if item.chemical else "",
                item.last_updated,
                item.updated_by.username if item.updated_by else "",
                item.quantity,
                item.min_quantity,
                item.manufacturer.name if item.manufacturer else "",
                item.product_number,
                item.chemical.cas_number if item.chemical else "",
                item.barcode,
                item.dead,
            ]
        )

    # Ensure the output stream's pointer is at the beginning.
    output.seek(0)

    # Create the response object with the correct headers for a CSV download.
    response = Response(output.getvalue(), mimetype="text/csv")
    response.headers["Content-Disposition"] = (
        "attachment; filename=inventory_report.csv"
    )
    return response
