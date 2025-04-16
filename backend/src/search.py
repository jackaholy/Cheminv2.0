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
    Storage_Class,
    Sub_Location,
    Location,
    Manufacturer,
)
from oidc import oidc

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
@oidc.require_login
def search_route():
    # Get parameters from request
    query = request.args.get("query", "")
    room = request.args.get("room", None)
    sub_location = request.args.get("sub_location", None)
    manufacturers_param = request.args.get("manufacturers", "")
    synonym_search_enabled = request.args.get("synonyms", "false").lower() == "true"

    # Split manufacturer IDs (if provided) and trim whitespace
    manufacturer_ids = [m.strip() for m in manufacturers_param.split(",") if m.strip()]

    # If no filtering criteria provided, return an empty list
    if not query and not room and not manufacturer_ids:
        return jsonify([])

    # Clean up the query string by removing certain characters
    #query = query.replace("/", "").replace("%2F", "").replace("%2f", "")
    

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
        room = int(room)
        filters.append(Location.Location_ID == room)

    # Add sub-location filter if specified
    if sub_location:
        sub_location = int(sub_location)
        filters.append(Sub_Location.Sub_Location_ID == sub_location)

    # Filter by manufacturer IDs if provided
    if manufacturer_ids:
        filters.append(Manufacturer.Manufacturer_ID.in_(manufacturer_ids))

    # Execute the query with appropriate joins and grouping
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

    # Filter inventory records
    for chemical in chemical_list:
        filtered_inventory = chemical["inventory"]
        
        # Apply room filter
        if room:
            filtered_inventory = [
                inv for inv in filtered_inventory
                if inv["location_id"] == int(room)
            ]

        # Apply sub-location filter
        if sub_location:
            filtered_inventory = [
                inv for inv in filtered_inventory
                if inv["sub_location_id"] == int(sub_location)
            ]

        # Apply manufacturer filter
        if manufacturer_ids:
            filtered_inventory = [
                inv for inv in filtered_inventory
                if str(inv["manufacturer_id"]) in manufacturer_ids
            ]

        chemical["inventory"] = filtered_inventory
        chemical["quantity"] = len([inv for inv in filtered_inventory if not inv["dead"]])

    # Remove chemicals with no matching inventory
    chemical_list = [chem for chem in chemical_list if chem["inventory"]]

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
    return jsonify(chemical_list)
