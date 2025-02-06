# Stage 2: Build the Python app
FROM python:3.12-slim

# Set the working directory for the Python app
WORKDIR /cheminv

# Copy and install Python dependencies
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Copy the rest of the Python application code
COPY src .


# This is NOT ready for production!
# This is a flask dev server 
CMD [ "flask", "run", "--host=0.0.0.0"]
