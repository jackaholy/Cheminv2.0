import logging
from difflib import SequenceMatcher
import requests
from flask import Blueprint, request
from sqlalchemy.orm import joinedload
from database import db
from sqlalchemy import or_
from models import Chemical, Chemical_Manufacturer

search = Blueprint("search", __name__)
logger = logging.getLogger(__name__)


def calculate_similarity(query, entry):
    match = SequenceMatcher(None, query.lower(), entry.lower()).find_longest_match()
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

    matching_chemicals = []
    for search_term in search_terms:
        matches = (
            db.session.query(Chemical)
            .options(
                # Load the information needed to calculate quantity right away 
                # for better performance
                joinedload(Chemical.Chemical_Manufacturers).joinedload(
                    Chemical_Manufacturer.Inventory
                )
            )
            .filter(
                or_(
                    Chemical.Chemical_Name.like("%" + search_term + "%"),
                    Chemical.Alphabetical_Name.like("%" + search_term + "%"),
                    Chemical.Chemical_Formula == search_term,
                )
            )
            .all()
        )
        matching_chemicals.extend(matches)
    matching_chemicals = list(set(matching_chemicals))

    logger.info(f"Found {len(matching_chemicals)} matches for {query}")
    response_entries = [
        {
            "chemical_name": chemical.Chemical_Name,
            "formula": chemical.Chemical_Formula,
            "id": chemical.Chemical_ID,
            "quantity": sum(
                len(manufacturer.Inventory)
                for manufacturer in chemical.Chemical_Manufacturers
            ),
        }
        for chemical in matching_chemicals
    ]
    response_entries.sort(
        key=lambda x: calculate_similarity(query, x["chemical_name"]), reverse=True
    )
    return response_entries
