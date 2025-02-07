# Stage 2: Build the Python app
FROM python:3.12-slim

# Set the working directory for the Python app
WORKDIR /cheminv

# Copy and install Python dependencies
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Copy the rest of the Python application code
COPY src .

CMD [ "python", "app.py"]
