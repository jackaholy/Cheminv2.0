# Installation and Deployment

This tutorial is written for Ubuntu 22.04 LTS, but should work on most debian based systems.

Start by cloning the repository:

```bash
git clone https://github.com/jackaholy/Cheminv2.0.git
cd Cheminv2.0/
```

### Docker Setup

Make sure you have docker and docker-compose installed. You can install it using the docs here: https://docs.docker.com/engine/install/ubuntu/. It's probably a good idea to go through the post-installation steps as well: https://docs.docker.com/engine/install/linux-postinstall/.

```bash
# Set up the environment variables
cp example.env .env
nano .env
```

Scroll down to the Environment section for instructions on how to set up the environment variables. For the database, you'll need to set the database name, username, and password. If this is running in a production environment, you'll want to set the `CHEMINV_ENVIRONMENT` variable to `production`. The secret key is used for the Flask application and should be a long, random string.

See also the OIDC setup section for instructions on setting the OIDC variables.

```bash
# Start the database and backend server
docker compose up --build -d

# If running the for the first time, you'll need to create the database
docker exec -i cheminv20-mysql-1 sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD"' < database-dump.sql
```

The database dump is a dump of the database from the previous version of the application. Nothing will work until this data is imported. You may have to tweak the container name. Run `docker ps` to find the mysql container name.

You can access the application at `http://server_name_or_ip:5001`. It's recommended to use a reverse proxy to serve the application.

By default, only users imported from the previous system will have full access. You can update access by clicking "Hi Your Name" and selecting "Manage Access". Anyone who has accessed the application will be listed here. Most users, like students should have Visitor access. Chemistry faculty should have "Editor" access, and a few people should have "Full Access". However, if you don't have full access, you may need to update access manually.

If you need to give someone "Full Access" manually (you're unable to access the "Manage Access" menu), you can use the following command:

```bash
docker exec -it cheminv20-mysql-1 sh -c 'mysql -u"$MYSQL_USER" --password="$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "UPDATE User SET Permissions_ID = 1 WHERE User_Name = '\''someone@example.com'\'';"'
```

Simply replace the email address with the email address of the user you want to give full access to. You may have to change the container name.

For general administration, you can use the following commands:
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

This is not used or tested regularly, but should work. Environment variables, OIDC, and user management should be similar to Docker instructions. Instead of docker exec, simply run the mysql commands directly.

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

### OIDC Setup

The application uses OpenID Connect (OIDC) for authentication.
The details for setting up OIDC will vary a bit depending on your authentication provider.

For okta, go to okta admin > Applications. Click "Create App Integration", select "OIDC - OpenID Connect" for Sign-in method, and select "Web Application" for Application type. Click "Next".

Name the application and set a logo (frontend/public/cheminvlogo.png might be a good choice). The sign-in redirect URI should be wherever you're planning on serving the application from, with "/oidc/callback" as the path. For example: `https://example.com/oidc/callback`. The sign out URI can be the url of a different page or application that you want to redirect to after the user logs out. Set "Controlled access" according to your organization's needs.

Set `CHEMINV_OIDC_CLIENT_ID` to the Client ID from the Okta application. Set `CHEMINV_OIDC_CLIENT_SECRET` to the Client Secret from the Okta application. Set `CHEMINV_OIDC_ISSUER` to the base URL of your okta organization, something like `https://yourorg.okta.com`. Lastly, set `CHEMINV_OIDC_REDIRECT_URI` to the redirect URI you set in okta.

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
