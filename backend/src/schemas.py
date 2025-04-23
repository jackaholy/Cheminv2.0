"""
This module defines Marshmallow schemas for input validation.

Schemas:
    - AddBottleSchema: Validates input for adding a new chemical bottle.
    - AddChemicalSchema: Validates input for adding a new chemical.
    - MarkManyDeadSchema: Validates input for marking multiple chemicals as dead.
    - UpdateInventorySchema: Validates input for updating an inventory record.
    - SearchParamsSchema: Validates input for search parameters.
"""

from marshmallow import Schema, fields, ValidationError
from models import (
    Chemical,
    Chemical_Manufacturer,
    Location,
    Manufacturer,
    Storage_Class,
    Inventory,
    Sub_Location,
    db,
)
from flask import request


def validate_id_exists(model, field_name):
    """
    Custom validator to check if a given ID exists in the database.
    """

    def validator(value):
        exists = (
            db.session.query(model).filter(getattr(model, field_name) == value).first()
        )
        if not exists:
            raise ValidationError(f"{field_name} with ID {value} does not exist.")

    return validator


# def validate_unique_sticker_number(value, ignored_bottles=[]):
#     """
#     Custom validator to ensure the sticker number is unique, excluding ignored bottles.
#     """
#     exists = (
#         db.session.query(Inventory)
#         .filter(
#             Inventory.Sticker_Number == value,
#             Inventory.Inventory_ID.notin_(ignored_bottles),  # Exclude ignored bottles
#         )
#         .first()
#     )
#     if exists:
#         raise ValidationError(f"Sticker number {value} is already in use.")


# def validate_unique_product_number(value, ignored_bottles=[], ignored_manufacturers=[]):
#     """
#     Custom validator to ensure the product number is unique, excluding ignored bottles.
#     """
#     # Get the Chemical_Manufacturer_IDs for the ignored bottles
#     ignored_manufacturer_ids = (
#         db.session.query(Inventory.Chemical_Manufacturer_ID)
#         .filter(Inventory.Inventory_ID.in_(ignored_bottles))
#         .subquery()
#     )
#     ignored_manufacturer_ids = ignored_manufacturer_ids.union(ignored_manufacturers)

#     other_manufacturer_with_product_number = (
#         db.session.query(Chemical_Manufacturer)
#         .filter(
#             Chemical_Manufacturer.Product_Number == value,
#             Chemical_Manufacturer.Chemical_Manufacturer_ID.notin_(
#                 ignored_manufacturer_ids
#             ),
#         )
#         .first()
#     )

#     if other_manufacturer_with_product_number:
#         raise ValidationError(f"Product number {value} is already in use")


class AddBottleSchema(Schema):
    """
    Schema for validating input when adding a new chemical bottle.
    Fields:
        - sticker_number (int): Unique identifier for the bottle (required).
        - chemical_id (int): ID of the chemical (required).
        - manufacturer_id (int): ID of the manufacturer (required).
        - location_id (int): ID of the location (required).
        - sub_location_id (int): ID of the sub-location (required).
        - product_number (str): Manufacturer's product number (required).
        - msds (bool): Whether to include a generated MSDS URL (required).
    """

    sticker_number = fields.Int(required=True)
    chemical_id = fields.Int(
        required=True, validate=validate_id_exists(Chemical, "Chemical_ID")
    )
    manufacturer_id = fields.Int(
        required=True, validate=validate_id_exists(Manufacturer, "Manufacturer_ID")
    )
    # location_id = fields.Int(required=True, validate=validate_id_exists(Location, "Location_ID"))
    sub_location_id = fields.Int(
        required=True, validate=validate_id_exists(Sub_Location, "Sub_Location_ID")
    )
    product_number = fields.Str(required=True)
    msds = fields.Bool(required=True)


class AddChemicalSchema(Schema):
    """
    Schema for validating input when adding a new chemical.
    Fields:
        - chemical_name (str): The name of the chemical (required).
        - chemical_formula (str): The formula of the chemical (required).
        - product_number (str): The product number associated with the chemical (required).
        - storage_class_id (int): The ID of the storage class for the chemical (required).
        - manufacturer_id (int): The ID of the manufacturer of the chemical (required).
    """

    chemical_name = fields.Str(required=True)
    chemical_formula = fields.Str(required=True)
    product_number = fields.Str(required=True)#, validate=validate_unique_product_number)
    storage_class_id = fields.Int(
        required=True, validate=validate_id_exists(Storage_Class, "Storage_Class_ID")
    )
    manufacturer_id = fields.Int(
        required=True, validate=validate_id_exists(Manufacturer, "Manufacturer_ID")
    )


class MarkManyDeadSchema(Schema):
    """
    Schema for validating input when marking multiple chemicals as dead.
    Fields:
        - sub_location_id (int): ID of the sub-location (required).
        - inventory_id (list): List of inventory IDs to mark as dead (required).
    """

    sub_location_id = fields.Int(required=True)
    sticker_numbers = fields.List(fields.Int(), required=True)


class UpdateInventorySchema(Schema):
    """
    Schema for validating input when updating an inventory record.
    Fields:
        - sticker_number (str): The new sticker number for the inventory (optional).
        - product_number (str): The new product number for the inventory (optional).
        - sub_location_id (int): The new sub-location ID for the inventory (optional).
        - manufacturer_id (int): The ID of the new manufacturer for the chemical (optional).
    """
    sticker_number = fields.Int()
    product_number = fields.Str()
    product_number = fields.Str(    )
    sub_location_id = fields.Int(
        validate=validate_id_exists(Sub_Location, "Sub_Location_ID")
    )
    manufacturer_id = fields.Int(
        validate=validate_id_exists(Manufacturer, "Manufacturer_ID")
    )


class SearchParamsSchema(Schema):
    """
    Schema for validating search parameters.
    Fields:
        - query (str): The search query (optional).
        - room (int): The room ID (optional).
        - sub_location (int): The sub-location ID (optional).
        - manufacturers (list): List of manufacturer IDs (optional).
        - synonyms (bool): Whether to enable synonym search (optional).
    """
    query = fields.Str()
    room = fields.Int(validate=validate_id_exists(Location, "Location_ID"), required=False, allow_none=True)
    sub_location = fields.Int(validate=validate_id_exists(Sub_Location, "Sub_Location_ID"), required=False, allow_none=True)
    manufacturers = fields.List(
        fields.Int(validate=validate_id_exists(Manufacturer, "Manufacturer_ID")),
        required=False
    )
    synonyms = fields.Bool()
