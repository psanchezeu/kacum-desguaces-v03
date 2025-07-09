# Backend Kacum Desguaces

Este es el backend para la aplicación Kacum Desguaces, desarrollado con Node.js, Express, TypeScript y Prisma con SQLite.

## Estructura del Proyecto

```
backend/
├── prisma/                # Configuración y migraciones de Prisma
│   ├── schema.prisma      # Esquema de la base de datos
│   └── migrations/        # Migraciones de la base de datos
├── src/
│   ├── index.ts           # Punto de entrada de la aplicación
│   ├── setup-db.ts        # Script para inicializar la base de datos
│   └── routes/            # Rutas de la API
│       ├── clientes.ts
│       ├── vehiculos.ts
│       ├── piezas.ts
│       └── pedidos.ts
├── .env                   # Variables de entorno
├── package.json           # Dependencias y scripts
└── tsconfig.json          # Configuración de TypeScript
```

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript
- **Express**: Framework para crear APIs REST
- **TypeScript**: Superset tipado de JavaScript
- **Prisma**: ORM para interactuar con la base de datos
- **SQLite**: Base de datos relacional ligera

## Configuración Inicial

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar la base de datos:
   ```bash
   npm run setup-db
   ```

3. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática
- `npm run build`: Compila el proyecto TypeScript
- `npm run start`: Inicia el servidor en modo producción
- `npm run setup-db`: Inicializa la base de datos y crea datos de ejemplo
- `npm run prisma:studio`: Abre Prisma Studio para gestionar la base de datos
- `npm run prisma:migrate`: Ejecuta las migraciones de Prisma
- `npm run prisma:generate`: Genera el cliente de Prisma

## API Endpoints

### Clientes
- `GET /api/clientes`: Obtener todos los clientes
- `GET /api/clientes/:id`: Obtener un cliente por ID
- `POST /api/clientes`: Crear un nuevo cliente
- `PUT /api/clientes/:id`: Actualizar un cliente existente
- `DELETE /api/clientes/:id`: Eliminar un cliente (baja lógica)

### Vehículos
- `GET /api/vehiculos`: Obtener todos los vehículos
- `GET /api/vehiculos/:id`: Obtener un vehículo por ID
- `GET /api/vehiculos/cliente/:clienteId`: Obtener vehículos por cliente
- `POST /api/vehiculos`: Crear un nuevo vehículo
- `PUT /api/vehiculos/:id`: Actualizar un vehículo existente
- `DELETE /api/vehiculos/:id`: Eliminar un vehículo

### Piezas
- `GET /api/piezas`: Obtener todas las piezas
- `GET /api/piezas/:id`: Obtener una pieza por ID
- `GET /api/piezas/vehiculo/:vehiculoId`: Obtener piezas por vehículo
- `GET /api/piezas/buscar/tipo/:tipoPieza`: Buscar piezas por tipo
- `POST /api/piezas`: Crear una nueva pieza
- `PUT /api/piezas/:id`: Actualizar una pieza existente
- `DELETE /api/piezas/:id`: Eliminar una pieza

### Pedidos
- `GET /api/pedidos`: Obtener todos los pedidos
- `GET /api/pedidos/:id`: Obtener un pedido por ID
- `GET /api/pedidos/cliente/:clienteId`: Obtener pedidos por cliente
- `POST /api/pedidos`: Crear un nuevo pedido
- `PUT /api/pedidos/:id`: Actualizar un pedido existente
- `DELETE /api/pedidos/:id`: Eliminar un pedido

## Modelo de Datos

El esquema de la base de datos incluye las siguientes entidades principales:

- **Cliente**: Información de los clientes (particulares o empresas)
- **Vehículo**: Datos de los vehículos gestionados
- **Pieza**: Componentes extraídos de los vehículos
- **Pedido**: Solicitudes de compra de piezas
- **Incidencia**: Registro de problemas o situaciones especiales
- **Usuario**: Personal del sistema
- **Documento**: Archivos asociados a clientes o vehículos

Y otras entidades complementarias para la gestión completa del negocio.
