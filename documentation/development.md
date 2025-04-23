## Frontend Development

The react code is automatically built and served when you run `docker compose up --build`.
However, this builds a full production container, and can be a little slow for general development.
Instead, you can `cd` into `frontend` and run `npm start`, and your changes will be live reloaded on `:3000`.
Just make sure to leave the backend running.

If you have to sign in or run into weird auth issues, use `:5001`.

When using `:5001` if you continue to have problems with authentication try clearing cookies and refresh the page.

## Backend Development

### General Structure

We use a serious of APIs in our python files (/backend/src/) to communicate with the frontend. This guide explains how to add new API endpoints to the Flask application in this project. All endpoints are implemented using Blueprints and follow standard practices for RESTful design and security.

- API routes are defined within a Blueprint, e.g., `manufacturers = Blueprint("manufacturers", __name__)`. This is defined in `app.py`.
- Each route is decorated with the appropriate HTTP method and URL path.
- Use `@oidc.require_login` for authentication.
- Use `@require_editor` for routes that modify data (POST, PUT, DELETE).
- Return responses in JSON format using `jsonify`.

### Adding a new API endpoint

1. **Choose/Create a Blueprint file**:
   - If your endpoint relates to an existing resource (e.g., manufacturers), add it to the corresponding file (e.g., `manufacturers.py`).
   - Otherwise, create a new file under `backend/src/` and define a new Blueprint.
  
2. **Define the route**:
   - Use the `@<blueprint>.route("/api/your_endpoint.py", methods=["METHOD"])` decorator.
   - Accept request parameters using `request.args` (for GET) or `request.json` (for POST/PUT).
  
3. **Write business logic**:
   - Query the database using SQLAlchemy models.
   - Validate inputs and handle errors appropriately.

4. **Return a JSON response**:
   - Use `jsonify()` to return structured data.
   - Include appropriate HTTP status codes (e.g., 200 OK, 400 Bad Request, 404 Not Found).

5. **Secure your endpoint**:
   - Add `@oidc.require_login` for authentication.
   - Add `@require_editor` if the endpoint alters data.

6. **Register the blueprint**:
   - In `app.py` register the blueprint. Example:

     ```python
     from manufacturers import manufacturers
     ...
     app.register_blueprint(manufacturers)
     ```

### Example

Here's an example of an endpoint that adds a new manufacturer:

```python
@manufacturers.route("/api/add_manufacturer", methods=["POST"])
@oidc.require_login
@require_editor
def create_manufacturer():
    """
    Creates a new manufacturer and adds it to the database.

    Endpoint:
        POST /api/add_manufacturer

    Request Body:
        JSON object containing:
            - name (str): The name of the manufacturer to be created.

    Returns:
        JSON response containing:
            - message (str): Confirmation message indicating success.
            - id (int): The unique ID of the newly created manufacturer.
            - name (str): The name of the newly created manufacturer.
    """
    name = request.json.get("name")
    if not name:
        return jsonify({"message": "Manufacturer name is required."}), 400
    if db.session.query(Manufacturer).filter(Manufacturer.Manufacturer_Name == name).first():
        return jsonify({"message": "Manufacturer with this name already exists."}), 400

    new_manufacturer = Manufacturer(Manufacturer_Name=name)
    db.session.add(new_manufacturer)
    db.session.commit()
    return jsonify(
        {
            "message": "Manufacturer created successfully",
            "id": new_manufacturer.Manufacturer_ID,
            "name": new_manufacturer.Manufacturer_Name,
        }
    )
```

## Testing
This project has integration tests using playwright and unit tests using pytest. The testing config is specified in `config.py`. It disables auth and connects to an in-memory database. There's also `testdata.py` which adds some dummy data to the database. 

If you run into an issue where you're being redirected to the SSO provider when running tests, make sure that you're running `flask-oidc` version >= 2.3.1, the `OIDC_ENABLED` flag doesn't come in previous version. Also, be sure you are running the server with the testing configuration. 

### Integration Tests

Run `npx playwright test` in `frontend` to run the playwright tests. Make sure that the backend is _not_ running.

Our integration tests use (Playwright)[https://playwright.dev/]. Take a look at their docs, but the general idea is this:

- Record yourself doing something using codegen. 
- Test for conditions like so:
   `expect(page.someLocator('someElement')).toMatchAriaSnapshot(``)`
- Run the tests once and it will fill in those blank snapshots. 

  ```
   git apply test-results/rebaselines.patch
   ```
- Apply their changes and it will add the snapshot directly into the code. Seriously, take a look at the playwright docs, it's not as scary as it sounds.

#### Useful Commands
##### Run tests on current docker build
`npx playwright test`

##### Record a new test
`npx playwright codegen`

##### View test results
`npx playwright show-report`

##### Manually start server with test configuration
To manually start a test server, run:
```
docker compose run --rm -p 5001:5000 -e CHEMINV_ENVIRONMENT=testing cheminv_backend
```
This will disable authentication, and connect to a sqlite database instead of the mysql container.

##### Stop testing server
`docker compose down --remove-orphans`

##### Rebuild container (so code changes show up)
`docker compose up --build --no-start`

#### Chaining commands
It helps to have a few of these in your clipboard to run all at once

Rebuild and test: 
```
docker compose down --remove-orphans; docker compose up --build --no-start; npx playwright test; npx playwright show-results
```

Rebuild and record a test
```
docker compose down --remove-orphans; docker compose up --build --no-start; docker compose run --rm -p 5001:5000 -e CHEMINV_ENVIRONMENT=testing cheminv_backend; npx playwright codegen
```
