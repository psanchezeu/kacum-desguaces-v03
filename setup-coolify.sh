#!/bin/bash

# Instalar dependencias del frontend
cd frontend && npm install && npm run build && cd ..

# Instalar dependencias del backend
cd backend && npm install && cd ..

# Iniciar el servicio
