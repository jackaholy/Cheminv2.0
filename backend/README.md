# Cheminv 2.0 Backend

## Getting Started

### Docker Setup

```bash
# Set up the environment variables
cp .env.example .env
# Make sure to complete the .env file

# Start the database and backend server
docker compose up --build -d

# If running the for the first time, you'll need to create the database
docker exec -i cheminv-mysql-1 sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD"' < database-dump.sql
```

To start the server and database in the background, run:

```bash
docker compose up --build -d
```

To start the server and database in the foreground, run:

```bash
docker compose up --build
```

To stop the server and database, run:

```bash
docker compose down
```

### Containerless Setup

#### Database Setup

Install a MySQL or MariaDB database.
You can create the database and user with the following commands.
It doesn't matter what the username, password, or database name are,
but they should match the values in your `.env` file.

```sql
CREATE DATABASE A_DATABASE;
CREATE USER 'A_USERNAME'@'%' IDENTIFIED BY 'A_PASSWORD';
GRANT ALL PRIVILEGES ON A_DATABASE.* TO 'A_USERNAME'@'%';
FLUSH PRIVILEGES;
SOURCE database-dump.sql;
```

#### Backend Setup

```bash
# Create a virtual environment
python -m venv venv
# Activate the virtual environment
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt

# Set up the environment variables
cp .env.example .env
# Make sure to complete the .env file

# Run the application
flask --app src.app run
```

### Environment

The application is configured to use a `.env` file for environment variables.
The following variables are required:

#### MYSQL_USER

The username to use for the MySQL database. If using the Docker setup, this will be used
when creating the database and when the backend connects to the database.

#### MYSQL_PASSWORD

The password to use for the MySQL database. If using the Docker setup, this will be used
when creating the database and when the backend connects to the database.

#### MYSQL_DATABASE

The name of the database to use for the MySQL database. Something like `cheminv`.

#### MYSQL_HOST

If using the Docker setup, this is probably `mysql`.
If using the containerless setup and have a MySQL server running on the same machine, this is probably `localhost`.

#### MYSQL_PORT

This will almost always be `3306`.

#### CHEMINV_ENVIRONMENT

Set to `development` or `production`.

#### CHEMINV_SECRET_KEY

A long random string that will be used as the secret key for the Flask application.

#### CHEMINV_OIDC_CLIENT_ID

The client ID for the OpenID Connect client. This should be provided by the SSO provider.

#### CHEMINV_OIDC_CLIENT_SECRET

The client secret for the OpenID Connect client. This should be provided by the SSO provider.

#### CHEMINV_OIDC_ISSUER

The issuer for the OpenID Connect provider. This should be provided by the SSO provider.

#### CHEMINV_OIDC_REDIRECT_URI

The address to redirect the user to after they have authenticated with the SSO provider.
If developing locally, this should be `http://localhost:5000/oidc/callback`.
If running in production, this should be something like `http://cheminv.carroll.edu/oidc/callback`.
