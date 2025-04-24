import logging
import re
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
    Sub_Location,
    Location,
    Manufacturer,
)
from oidc import oidc
from schemas import SearchParamsSchema
from marshmallow.exceptions import ValidationError

search = Blueprint("search", __name__)
logger = logging.getLogger(__name__)


def calculate_similarity(query, entry):
    """
    Calculate similarity between the query and an entry.
    """
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
    """
    Fetch synonyms for a given query from PubChem.
    """
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


def parse_request_params(request):
    """
    Parse and validate request parameters using Marshmallow schemas.
    """
    manufacturers = request.args.get("manufacturers")
    if manufacturers:
        manufacturers = manufacturers.split(",")
    else:
        manufacturers = []
    params = {
        "query": request.args.get("query", ""),
        "room": request.args.get("room", None),
        "sub_location": request.args.get("sub_location", None),
        "manufacturers": manufacturers,
        "synonyms": request.args.get("synonyms", "false").lower() == "true",
    }

    return SearchParamsSchema().load(params)


def build_search_filters(search_terms, room, sub_location, manufacturer_ids):
    """
    Build SQLAlchemy filters for the search query.
    """
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

    sticker_filter = Chemical.Chemical_Manufacturers.any(
        Chemical_Manufacturer.Inventory.any(Inventory.Sticker_Number.in_(search_terms))
    )

    search_filter = or_(
        name_filter, alphabetical_filter, formula_filter, sticker_filter
    )

    filters = [search_filter]

    if room:
        filters.append(Location.Location_ID == int(room))

    if sub_location:
        filters.append(Sub_Location.Sub_Location_ID == int(sub_location))

    if manufacturer_ids:
        filters.append(Manufacturer.Manufacturer_ID.in_(manufacturer_ids))

    logger.debug(f"Built search filters: {filters}")
    return filters


def filter_inventory_records(chemical_list, room, sub_location, manufacturer_ids):
    """
    Filter inventory records based on room, sub-location, and manufacturer criteria.
    """
    for chemical in chemical_list:
        filtered_inventory = chemical["inventory"]

        if room:
            filtered_inventory = [
                inv for inv in filtered_inventory if inv["location_id"] == int(room)
            ]

        if sub_location:
            filtered_inventory = [
                inv
                for inv in filtered_inventory
                if inv["sub_location_id"] == int(sub_location)
            ]

        if manufacturer_ids:
            filtered_inventory = [
                inv
                for inv in filtered_inventory
                if inv["manufacturer_id"] in manufacturer_ids
            ]

        chemical["inventory"] = filtered_inventory
        chemical["quantity"] = len(
            [inv for inv in filtered_inventory if not inv["dead"]]
        )

    logger.info(f"Filtered inventory records for chemicals.")
    return [chem for chem in chemical_list if chem["inventory"]]


@search.route("/api/search", methods=["GET"])
@oidc.require_login
def search_route():
    """
    Handle the search API route.
    """
    try:
        validated_params = parse_request_params(request)
    except ValidationError as e:
        logger.error(f"Validation error: {e.messages}")
        return (
            jsonify({"error": "Invalid request parameters", "details": e.messages}),
            400,
        )

    query = validated_params.get("query", "")
    room = validated_params.get("room", None)
    sub_location = validated_params.get("sub_location", None)
    manufacturer_ids = validated_params.get("manufacturers", [])
    synonym_search_enabled = validated_params.get("synonyms", False)

    if not query and not room and not sub_location and not manufacturer_ids:
        logger.warning("No filtering criteria provided. Returning an empty list.")
        return jsonify([])

    search_terms = [query]
    if synonym_search_enabled:
        search_terms.extend(get_synonyms(query))

    search_terms = list(set(search_terms))
    search_terms = [term for term in search_terms if len(term) > 3 or term == query]

    filters = build_search_filters(search_terms, room, sub_location, manufacturer_ids)

    matching_chemicals = (
        db.session.query(Chemical)
        .outerjoin(Chemical.Chemical_Manufacturers)
        .outerjoin(Chemical_Manufacturer.Manufacturer)
        .outerjoin(Chemical_Manufacturer.Inventory)
        .outerjoin(Inventory.Sub_Location)
        .outerjoin(Sub_Location.Location)
        .options(
            joinedload(Chemical.Storage_Class),
            joinedload(Chemical.Chemical_Manufacturers)
            .joinedload(Chemical_Manufacturer.Inventory)
            .joinedload(Inventory.Sub_Location)
            .joinedload(Sub_Location.Location),
            joinedload(Chemical.Chemical_Manufacturers).joinedload(
                Chemical_Manufacturer.Manufacturer
            ),
        )
        .filter(and_(*filters))
        .all()
    )

    chemical_list = [chemical.to_dict() for chemical in matching_chemicals]

    chemical_list = filter_inventory_records(
        chemical_list, room, sub_location, manufacturer_ids
    )

    if query:
        chemical_list.sort(
            key=lambda x: (
                x["quantity"] != 0,
                calculate_similarity(query, x["chemical_name"]),
            ),
            reverse=True,
        )
    else:
        chemical_list.sort(
            key=lambda x: (
                x["quantity"] == 0,
                re.sub(r"[^a-zA-Z]", "", x["chemical_name"]).lower(),
            ),
        )

    logger.info(f"Returning {len(chemical_list)} matching chemicals.")
    return jsonify(chemical_list)
