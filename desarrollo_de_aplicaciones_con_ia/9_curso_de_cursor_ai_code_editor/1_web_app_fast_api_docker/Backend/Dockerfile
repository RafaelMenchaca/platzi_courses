# PASO 6: Dockerfile para Platziflix API
FROM python:3.11-slim

# Instalar uv para gestión de dependencias
RUN pip install uv

WORKDIR /app

# Copiar archivos de dependencias e instalar
COPY pyproject.toml README.md ./
RUN uv sync

# Copiar código de la aplicación
COPY app ./app

EXPOSE 8000

# Uvicorn con hot reload para desarrollo
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
