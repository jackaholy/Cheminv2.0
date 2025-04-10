## Frontend Development

The react code is automatically built and served when you run `docker compose up --build`.
However, this builds a full production container, and can be a little slow for general development.
Instead, you can `cd` into `frontend` and run `npm start`, and your changes will be live reloaded on `:3000`.
Just make sure to leave the backend running.

If you have to sign in or run into weird auth issues, use `:5001`.

When using `:5001` if you continue to have problems with authentication try clearing cookies and refresh the page.

## Backend Development

This is where I will put some helpful developer information.
