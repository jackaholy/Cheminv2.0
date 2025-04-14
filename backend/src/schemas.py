from marshmallow import Schema, fields, ValidationError

 # Using marshmallow to make input validation easier: 
 # https://chatgpt.com/share/67f9e3a7-ff9c-8004-a1b5-303b778a9757

class AddBottleSchema(Schema):
    sticker_number = fields.Int(required=True)
    chemical_id = fields.Int(required=True)
    manufacturer_id = fields.Int(required=True)
    location_id = fields.Int(required=True)
    sub_location_id = fields.Int(required=True)
    product_number = fields.Str(required=True)
    msds = fields.Bool(required=True)