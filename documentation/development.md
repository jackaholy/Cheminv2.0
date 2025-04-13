## Frontend Development

The react code is automatically built and served when you run `docker compose up --build`.
However, this builds a full production container, and can be a little slow for general development.
Instead, you can `cd` into `frontend` and run `npm start`, and your changes will be live reloaded on `:3000`.
Just make sure to leave the backend running.

If you have to sign in or run into weird auth issues, use `:5001`.

When using `:5001` if you continue to have problems with authentication try clearing cookies and refresh the page.

## Testing

### Integration Tests

Run `npx playwright test` in `frontend` to run the playwright tests. Make sure that the backend is _not_ running.

Our integration tests use (Playwright)[https://playwright.dev/]. Take a look at their docs, but the general idea is this: Record yourself doing something using codegen. 
Test for conditions like so:
`expect(page.someLocator('someElement')).toMatchAriaSnapshot(``)`
Run the tests once and it will fill in those blank snapshots. 
```
git apply test-results/rebaselines.patch
```
Apply their changes and it will add the snapshot directly into the code. 

Seriously, take a look at the playwright docs, it's not as scary as it sounds. 
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
### Unit Tests

## Backend Development

This is where I will put some helpful developer information.

