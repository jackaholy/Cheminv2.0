"""
This module defines Marshmallow schemas for input validation.

Schemas:
    - AddBottleSchema: Validates input for adding a new chemical bottle.
    - AddChemicalSchema: Validates input for adding a new chemical.
"""

from marshmallow import Schema, fields, ValidationError

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
    chemical_id = fields.Int(required=True)
    manufacturer_id = fields.Int(required=True)
    location_id = fields.Int(required=True)
    sub_location_id = fields.Int(required=True)
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
    product_number = fields.Str(required=True)
    storage_class_id = fields.Int(required=True)
    manufacturer_id = fields.Int(required=True)