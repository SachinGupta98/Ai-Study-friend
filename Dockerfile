FROM python:3.11-slim

WORKDIR /app

# Install deps first (cache layer)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend source
COPY backend/ .

# Koyeb/cloud platforms inject $PORT at runtime (default 8000)
EXPOSE 8000

# Use shell form so $PORT env var is expanded at container start
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
