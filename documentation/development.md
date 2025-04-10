## Frontend Development

The react code is automatically built and served when you run `docker compose up --build`.
However, this builds a full production container, and can be a little slow for general development.
Instead, you can `cd` into `frontend` and run `npm start`, and your changes will be live reloaded on `:3000`.
Just make sure to leave the backend running.

If you have to sign in or run into weird auth issues, use `:5001`.

## Testing

### Integration Tests

Run `npx playwright test` in `frontend` to run the playwright tests. Make sure that the backend is _not_ running.

To manually start a test server, run:

```
docker compose run --rm -p 5001:5000 -e CHEMINV_ENVIRONMENT=testing cheminv_backend
```

This will disable authentication, and connect to a sqlite database instead of the mysql container.

### Unit Tests
