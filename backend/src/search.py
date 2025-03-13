import logging
from difflib import SequenceMatcher
import requests
from flask import Blueprint, request
from sqlalchemy.orm import joinedload
from database import db
from sqlalchemy import or_, func
from models import (
    Chemical,
    Chemical_Manufacturer,
    Inventory,
    Storage_Class,
    Sub_Location,
    Location,
    Manufacturer,
)

search = Blueprint("search", __name__)
logger = logging.getLogger(__name__)


def calculate_similarity(query, entry):
    match = SequenceMatcher(
        None, query.lower().replace(" ", ""), entry.lower().replace(" ", "")
    ).find_longest_match()
    similarity = (
        # Prioritize strings that contain all or most of the query
        match.size,
        # Prioritize strings that start with the query
        # Irrelevant compounds are usually prefix+query
        match.size - match.b,
        # If results are "query" and "query with a bunch of other stuff", prioritize the former
        SequenceMatcher(None, query, entry).ratio(),
    )
    logger.debug(f"Calculating similarity between {query} and {entry}: {similarity}")
    return similarity


def get_synonyms(query):
    synonyms = []
    logger.info(f"Looking up synonyms for {query}")
    response = requests.get(
        f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/substance/name/{query}/synonyms/json"
    ).json()
    if "InformationList" in response:
        logger.info(
            f"Found {len(response['InformationList']['Information'])} synonyms for {query}"
        )
        for substance in response["InformationList"]["Information"]:
            logger.debug(f"- {substance['Synonym']}")
            synonyms.extend(substance["Synonym"])
    return synonyms


@search.route("/api/search", methods=["GET"])
def search_route():
    query = request.args.get("query")
    synonym_search_enabled = request.args.get("synonyms") == "true"
    if not query:
        return []

    query.replace("/", "")
    query.replace("%2F", "")
    query.replace("%2f", "")
    search_terms = [query]

    if synonym_search_enabled:
        search_terms.extend(get_synonyms(query))

    # Deduplicate search terms
    search_terms = list(set(search_terms))

    # Element symbols (like FE, H, etc.) match all kinds of things in the database, so we try to filter them out
    search_terms = [
        search_term
        for search_term in search_terms
        # Try to filter out element symbols
        # (for synonyms, allow the user to search directly)
        if len(search_term) > 3 or search_term == query
    ]

    matching_chemicals = (
        db.session.query(
            Chemical.Chemical_ID,
            Chemical.Chemical_Name,
            Chemical.Chemical_Formula,
            Storage_Class.Storage_Class_Name,
            func.count(Inventory.Inventory_ID).label("quantity"),
            Inventory.Inventory_ID.label("inventory_id"),
            Inventory.Sticker_Number.label("sticker"),
            Sub_Location.Sub_Location_Name.label("sub_location"),
            Location.Room.label("location_room"),
            Location.Building.label("location_building"),
            Manufacturer.Manufacturer_Name.label("manufacturer"),
            Chemical_Manufacturer.Product_Number.label("product_number"),
        )
        .outerjoin(
            Chemical_Manufacturer,
            Chemical.Chemical_ID == Chemical_Manufacturer.Chemical_ID,
        )
        .outerjoin(
            Inventory,
            Chemical_Manufacturer.Chemical_Manufacturer_ID
            == Inventory.Chemical_Manufacturer_ID,
        )
        .outerjoin(
            Storage_Class,
            Chemical.Storage_Class_ID == Storage_Class.Storage_Class_ID,
        )
        .outerjoin(
            Sub_Location,
            Inventory.Sub_Location_ID == Sub_Location.Sub_Location_ID,
        )
        .outerjoin(
            Location,
            Sub_Location.Location_ID == Location.Location_ID,
        )
        .outerjoin(
            Manufacturer,
            Chemical_Manufacturer.Manufacturer_ID == Manufacturer.Manufacturer_ID,
        )
        .filter(
            or_(
                or_(
                    func.replace(Chemical.Chemical_Name, " ", "").ilike(
                        f"%{st.replace(' ', '')}%"
                    )
                    for st in search_terms
                ),
                or_(
                    func.replace(Chemical.Alphabetical_Name, " ", "").ilike(
                        f"%{st.replace(' ', '')}%"
                    )
                    for st in search_terms
                ),
                or_(
                    Chemical.Chemical_Formula == st
                    for st in search_terms  # formulas may not need space stripping
                ),
                Chemical.Chemical_Manufacturers.any(
                    Chemical_Manufacturer.Inventory.any(
                        Inventory.Sticker_Number.in_(search_terms)
                    )
                ),
            )
        )
        .group_by(
            Chemical.Chemical_ID,
            Inventory.Inventory_ID,
            Storage_Class.Storage_Class_Name,
            Sub_Location.Sub_Location_Name,
            Location.Room,
            Location.Building,
            Manufacturer.Manufacturer_Name,
            Chemical_Manufacturer.Product_Number,
        )
        .all()
    )
    chemical_dict = {}

    for chem in matching_chemicals:
        if chem.Chemical_ID not in chemical_dict:
            chemical_dict[chem.Chemical_ID] = {
                "id": chem.Chemical_ID,
                "chemical_name": chem.Chemical_Name,
                "formula": chem.Chemical_Formula,
                "storage_class": chem.Storage_Class_Name,
                "inventory": [],
            }
        chemical_dict[chem.Chemical_ID]["inventory"].append(
            {
                "sticker": chem.sticker,
                "product_number": chem.product_number,
                "sub_location": chem.sub_location,
                "location": (chem.location_building or "")
                + " "
                + (chem.location_room or ""),
                "manufacturer": chem.manufacturer,
            }
        )
        chemical_dict[chem.Chemical_ID]["quantity"] = len(
            chemical_dict[chem.Chemical_ID]["inventory"]
        )

    chemical_list = list(chemical_dict.values())
    chemical_list.sort(
        key=lambda x: calculate_similarity(query, x["chemical_name"]), reverse=True
    )
    return chemical_list
