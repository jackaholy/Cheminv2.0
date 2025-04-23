from flask import Blueprint, jsonify, request
from database import db
from models import Storage_Class, Chemical
from oidc import oidc
from permission_requirements import require_editor

storage_class = Blueprint('storage_class', __name__)

@storage_class.route('/api/storage_classes/', methods=['GET'])
def get_storage_classes():
    """
    Retrieves all storage classes from the database.

    Returns:
        A JSON list of storage class objects, each with an 'id' and 'name'.
    """
    storage_classes = db.session.query(Storage_Class).all()
    return jsonify([{"id": sc.Storage_Class_ID, "name": sc.Storage_Class_Name} for sc in storage_classes])

@storage_class.route('/api/storage_classes/', methods=['DELETE'])
@oidc.require_login
@require_editor
def delete_storage_classes():
    """
    Deletes specified storage classes and reassigns associated chemicals to the 'Unknown' class.

    Returns:
        400 if input is invalid or "Unknown" is specified.
        404 if no storage classes were found for deletion.
        200 with a success message otherwise.
    """
    data = request.get_json()
    if not data or 'storageClasses' not in data:
        return jsonify({'error': 'No storage classes specified'}), 400

    storage_class_names = data['storageClasses']

    # Prevent deletion of "Unknown" storage class
    if "Unknown" in storage_class_names:
        return jsonify({'error': 'Cannot delete the "Unknown" storage class'}), 400

    # Ensure "Unknown" storage class exists
    unknown_storage_class = db.session.query(Storage_Class).filter_by(Storage_Class_Name="Unknown").first()
    if not unknown_storage_class:
        unknown_storage_class = Storage_Class(Storage_Class_Name="Unknown")
        db.session.add(unknown_storage_class)
        db.session.commit()

    # Reassign chemicals to "Unknown" storage class
    db.session.query(Chemical).filter(
        Chemical.Storage_Class_ID.in_(
            db.session.query(Storage_Class.Storage_Class_ID).filter(
                Storage_Class.Storage_Class_Name.in_(storage_class_names)
            )
        )
    ).update({"Storage_Class_ID": unknown_storage_class.Storage_Class_ID}, synchronize_session=False)

    # Delete the specified storage classes
    deleted = db.session.query(Storage_Class).filter(
        Storage_Class.Storage_Class_Name.in_(storage_class_names)
    ).delete(synchronize_session=False)

    db.session.commit()

    if deleted == 0:
        return jsonify({'error': 'No storage classes found to delete'}), 404

    return jsonify({'message': f'Successfully deleted {deleted} storage classes'}), 200

@storage_class.route('/api/storage_classes/', methods=['POST'])
@oidc.require_login
@require_editor
def create_storage_class():
    """
    Creates a new storage class.

    Returns:
        400 if name is missing or already exists.
        201 with a success message if created successfully.
    """
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Storage class name is required'}), 400

    name = data['name']
    if db.session.query(Storage_Class).filter_by(Storage_Class_Name=name).first():
        return jsonify({'error': 'Storage class already exists'}), 400

    new_storage_class = Storage_Class(Storage_Class_Name=name)
    db.session.add(new_storage_class)
    db.session.commit()

    return jsonify({'message': 'Storage class created successfully'}), 201

@storage_class.route('/api/storage_classes/<int:storage_class_id>', methods=['PUT'])
@oidc.require_login
@require_editor
def update_storage_class(storage_class_id):
    """
    Updates the name of an existing storage class.

    Parameters:
        storage_class_id (int): The ID of the storage class to update.

    Returns:
        400 if name is missing.
        404 if the storage class is not found.
        200 with a success message if updated.
    """
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Storage class name is required'}), 400

    storage_class = db.session.query(Storage_Class).filter_by(Storage_Class_ID=storage_class_id).first()
    if not storage_class:
        return jsonify({'error': 'Storage class not found'}), 404

    storage_class.Storage_Class_Name = data['name']
    db.session.commit()

    return jsonify({'message': 'Storage class updated successfully'}), 200