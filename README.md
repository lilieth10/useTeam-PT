# 🎯 Tablero Kanban Colaborativo en Tiempo Real

Aplicación tipo **Trello** con gestión de tareas mediante tablero Kanban y colaboración en tiempo real.

## 🚀 Características

- ✅ Tablero Kanban con columnas personalizables
- ✅ Drag & Drop fluido para mover tarjetas
- ✅ Colaboración en tiempo real con WebSocket
- ✅ Exportación de backlog a CSV vía email con N8N
- ✅ Notificaciones en tiempo real
- ✅ Diseño responsivo con Tailwind CSS

## 🛠️ Stack Tecnológico

### Frontend
- **React.js 18** - Interfaz de usuario
- **Tailwind CSS** - Estilos y diseño responsivo
- **@dnd-kit** - Drag & Drop
- **Socket.io-client** - WebSocket para tiempo real
- **Axios** - Cliente HTTP

### Backend
- **NestJS** - Framework backend
- **Socket.io** - WebSocket server
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **Class-validator** - Validación de DTOs

### Automatización
- **N8N** - Flujos de trabajo automatizados
- **Docker** - Contenedores para servicios

## 📁 Estructura del Proyecto

```
useTeam-PT/
├── README.md                          # Documentación principal
├── .env                               # Variables de entorno
├── .gitignore                         # Archivos a ignorar
├── docker-compose.yml                 # Orquestación de servicios
│
├── frontend/                          # React App
│   ├── package.json
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── components/               # Componentes reutilizables
│       │   ├── Board/               # Tablero Kanban
│       │   ├── Column/              # Columnas
│       │   ├── Card/                # Tarjetas
│       │   └── common/              # Componentes comunes
│       ├── hooks/                   # Custom hooks
│       ├── services/                # Servicios (API, WebSocket)
│       ├── context/                 # Context API para estado global
│       ├── utils/                   # Utilidades
│       └── App.jsx
│
├── backend/                          # NestJS API
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── modules/
│       │   ├── board/               # Módulo de tableros
│       │   ├── card/                # Módulo de tarjetas
│       │   ├── column/              # Módulo de columnas
│       │   ├── export/              # Módulo de exportación
│       │   └── websocket/           # Gateway WebSocket
│       ├── database/                # Configuración MongoDB
│       ├── common/                  # DTOs, interfaces, guards
│       └── config/                  # Configuración
│
└── n8n/
    ├── workflow.json                 # Flujo de N8N
    └── setup-instructions.md         # Instrucciones de configuración
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.x
- npm o yarn
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/lilieth10/useTeam-PT.git
cd useTeam-PT
```

### 2. Configurar variables de entorno

Editar el archivo `.env` en la raíz del proyecto con tus configuraciones:

```bash
cp .env.example .env
```
Editar el archivo `.env` con tus configuraciones.

### 3. Levantar servicios con Docker

```bash
docker-compose up -d
```

Esto iniciará:
- MongoDB en puerto 27017
- N8N en puerto 5678

### 4. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 5. Instalar dependencias del Frontend

```bash
cd frontend
npm install
```

### 6. Ejecutar la aplicación

**Backend:**
```bash
cd backend
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm start
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **N8N**: http://localhost:5678

## 📊 Funcionalidad de Exportación

La aplicación permite exportar el backlog del tablero en formato CSV vía email.

### Flujo de Exportación

1. Usuario hace clic en "Exportar Backlog"
2. Frontend envía solicitud a `/api/export/backlog`
3. Backend dispara webhook a N8N
4. N8N extrae datos y genera CSV
5. N8N envía email con archivo adjunto
6. Usuario recibe notificación de estado

### Configurar N8N

Ver instrucciones detalladas en: [n8n/setup-instructions.md](./n8n/setup-instructions.md)

## 🏗️ Arquitectura

### Principios SOLID Aplicados

- **Single Responsibility**: Cada módulo tiene una única responsabilidad
- **Open/Closed**: Extensible mediante interfaces
- **Liskov Substitution**: Interfaces para servicios intercambiables
- **Interface Segregation**: DTOs específicos por funcionalidad
- **Dependency Inversion**: Inyección de dependencias

### Patrones de Diseño

- **Repository Pattern**: Acceso a datos
- **Gateway Pattern**: WebSocket
- **Service Layer**: Lógica de negocio
- **DTO Pattern**: Transferencia de datos

## 📡 API Endpoints

### Boards
- `GET /api/boards` - Obtener todos los tableros
- `GET /api/boards/:id` - Obtener un tablero específico
- `POST /api/boards` - Crear nuevo tablero
- `PUT /api/boards/:id` - Actualizar tablero
- `DELETE /api/boards/:id` - Eliminar tablero

### Cards
- `GET /api/cards` - Obtener todas las tarjetas
- `GET /api/cards/:id` - Obtener tarjeta específica
- `POST /api/cards` - Crear nueva tarjeta
- `PUT /api/cards/:id` - Actualizar tarjeta
- `PATCH /api/cards/:id/move` - Mover tarjeta entre columnas
- `DELETE /api/cards/:id` - Eliminar tarjeta

### Columns
- `GET /api/columns` - Obtener todas las columnas
- `POST /api/columns` - Crear nueva columna
- `PUT /api/columns/:id` - Actualizar columna
- `DELETE /api/columns/:id` - Eliminar columna

### Export
- `POST /api/export/backlog` - Exportar backlog a CSV vía email

## 🔌 WebSocket Events

### Client → Server
- `card:create` - Crear tarjeta en tiempo real
- `card:update` - Actualizar tarjeta
- `card:delete` - Eliminar tarjeta
- `card:move` - Mover tarjeta entre columnas
- `column:create` - Crear columna
- `column:update` - Actualizar columna

### Server → Client
- `card:created` - Notificación de tarjeta creada
- `card:updated` - Notificación de tarjeta actualizada
- `card:deleted` - Notificación de tarjeta eliminada
- `card:moved` - Notificación de tarjeta movida
- `column:created` - Notificación de columna creada
- `column:updated` - Notificación de columna actualizada

## 🧪 Testing

**Backend:**
```bash
cd backend
npm run test
npm run test:cov  # Con cobertura
```

**Frontend:**
```bash
cd frontend
npm test
```

## 📝 Scripts Disponibles

### Backend
- `npm run start:dev` - Modo desarrollo
- `npm run start:prod` - Modo producción
- `npm run build` - Compilar proyecto
- `npm run test` - Ejecutar tests

### Frontend
- `npm start` - Modo desarrollo
- `npm run build` - Build para producción
- `npm test` - Ejecutar tests

## 🐳 Docker

### Levantar solo MongoDB

```bash
docker-compose up mongodb -d
```

### Levantar solo N8N

```bash
docker-compose up n8n -d
```

### Ver logs

```bash
docker-compose logs -f
```

## 📚 Documentación Adicional

- [Configuración de N8N](./n8n/setup-instructions.md)

## 🤝 Contribución

Este proyecto es una prueba técnica para useTeam.

## 📄 Licencia

MIT

---

Desarrollado con ❤️ para useTeam
