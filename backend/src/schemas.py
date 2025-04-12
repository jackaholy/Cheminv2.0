from marshmallow import Schema, fields, ValidationError

class AddBottleSchema(Schema):
    sticker_number = fields.Int(required=True)
    chemical_id = fields.Int(required=True)
    manufacturer_id = fields.Int(required=True)
    location_id = fields.Int(required=True)
    sub_location_id = fields.Int(required=True)
    product_number = fields.Str(required=True)
    msds = fields.Bool(required=True)