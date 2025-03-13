# Stage 1: Build the frontend
FROM node:16-alpine as build-frontend
WORKDIR /app
# Copy package files and install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
# Copy the rest of the frontend code and build it
COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: Build the backend
FROM python:3.12-slim as runtime
WORKDIR /cheminv
# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
# Copy your Flask app source code
COPY backend/src .
# Copy the built frontend assets into a folder (e.g., "build")
COPY --from=build-frontend /app/frontend/build ../frontend/build

# Ensure your Flask app is set to serve static files from the "build" folder:
# e.g., app = Flask(__name__, static_url_path="", static_folder="build", template_folder="build")
CMD ["python", "app.py"]
