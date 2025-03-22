import logging
from difflib import SequenceMatcher
import requests
from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from database import db
from sqlalchemy import or_, func, and_
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
    query = query.lower().replace(" ", "")
    entry = entry.lower().replace(" ", "")
    match = SequenceMatcher(None, query, entry).find_longest_match()
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
    # Get parameters from request
    query = request.args.get("query", "")
    room = request.args.get("room", None)
    manufacturers_param = request.args.get("manufacturers", "")
    synonym_search_enabled = request.args.get("synonyms", "false").lower() == "true"

    # Split manufacturer IDs (if provided) and trim whitespace
    manufacturer_ids = [m.strip() for m in manufacturers_param.split(",") if m.strip()]

    # If no filtering criteria provided, return an empty list
    if not query and not room and not manufacturer_ids:
        return jsonify([])

    # Clean up the query string by removing certain characters
    query = query.replace("/", "").replace("%2F", "").replace("%2f", "")

    # Start with the primary query and add synonyms if enabled
    search_terms = [query]
    if synonym_search_enabled:
        search_terms.extend(get_synonyms(query))

    # Deduplicate search terms
    search_terms = list(set(search_terms))

    # Filter out possible element symbols (unless it's the original query)
    search_terms = [term for term in search_terms if len(term) > 3 or term == query]

    # Build filters for Chemical_Name, Alphabetical_Name, and Chemical_Formula
    name_filter = or_(
        *[
            func.replace(Chemical.Chemical_Name, " ", "").ilike(
                f"%{term.replace(' ', '')}%"
            )
            for term in search_terms
        ]
    )
    alphabetical_filter = or_(
        *[
            func.replace(Chemical.Alphabetical_Name, " ", "").ilike(
                f"%{term.replace(' ', '')}%"
            )
            for term in search_terms
        ]
    )
    formula_filter = or_(*[Chemical.Chemical_Formula == term for term in search_terms])

    # Filter on sticker numbers (via related inventory records)
    sticker_filter = Chemical.Chemical_Manufacturers.any(
        Chemical_Manufacturer.Inventory.any(Inventory.Sticker_Number.in_(search_terms))
    )

    # Combine the search term filters into one using OR
    search_filter = or_(
        name_filter, alphabetical_filter, formula_filter, sticker_filter
    )

    # Create a list of filters that will be combined with AND
    filters = [search_filter]

    # Filter by room name (comparing against Location.Room)
    if room:
        filters.append(Location.Location_ID == room)

    # Filter by manufacturer IDs if provided
    if manufacturer_ids:
        filters.append(Manufacturer.Manufacturer_ID.in_(manufacturer_ids))

    # Execute the query with appropriate joins and grouping
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
        .filter(and_(*filters))
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

    # Build a dictionary keyed by Chemical_ID to aggregate inventory entries
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
                "location": f"{chem.location_building or ''} {chem.location_room or ''}".strip(),
                "manufacturer": chem.manufacturer,
            }
        )
        chemical_dict[chem.Chemical_ID]["quantity"] = len(
            chemical_dict[chem.Chemical_ID]["inventory"]
        )

    # Convert the aggregated chemicals into a list and sort them by similarity to the query
    chemical_list = list(chemical_dict.values())
    chemical_list.sort(
        key=lambda x: calculate_similarity(query, x["chemical_name"]), reverse=True
    )

    return jsonify(chemical_list)
