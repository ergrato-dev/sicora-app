# Utilizar una imagen base ligera de Python
FROM python:3.14-slim

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema si fueran necesarias (ej. build-essential para algunas librerías)
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential

# Copiar el archivo de requisitos e instalar las dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación al directorio de trabajo
COPY ./app /app/app
COPY ./main.py /app/main.py
COPY ./alembic.ini /app/alembic.ini
COPY ./alembic /app/alembic

# Exponer el puerto en el que correrá la aplicación (FastAPI por defecto usa 8000)
EXPOSE 8030

# Comando para ejecutar la aplicación Uvicorn
# El host 0.0.0.0 permite que la aplicación sea accesible desde fuera del contenedor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8030"]