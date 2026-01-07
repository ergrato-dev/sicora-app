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

# Estos COPY son para la imagen, pero serán sobrescritos por el volumen en desarrollo
COPY ./app /app/app
COPY ./main.py /app/main.py

# Exponer el puerto en el que correrá la aplicación (consistente con main.py y docker-compose.yml)
EXPOSE 8004

# Corregido: Apuntar a main.py en el WORKDIR (/app/main.py)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8004", "--reload"]