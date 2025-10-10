# 🎯 Tablero Kanban Colaborativo en Tiempo Real

Aplicación tipo **Trello** desarrollada como prueba técnica para **useTeam**, con gestión de tareas mediante tablero Kanban y colaboración en tiempo real.

## 🚀 Características Implementadas

- ✅ **Tablero Kanban** con 3 columnas (Por hacer, En progreso, Completado)
- ✅ **Drag & Drop fluido** para mover tarjetas entre columnas
- ✅ **Colaboración en tiempo real** con WebSocket y Socket.io
- ✅ **Exportación de backlog** a CSV vía email con integración N8N
- ✅ **Notificaciones en tiempo real** para acciones de otros usuarios
- ✅ **Animaciones modernas** con Framer Motion
- ✅ **Diseño responsivo** con Tailwind CSS + Shadcn/ui
- ✅ **Code splitting optimizado** para mejor performance

## 🛠️ Stack Tecnológico

### Frontend
- **React.js 18** con TypeScript - Interfaz de usuario moderna
- **Vite** - Build tool rápido y optimizado
- **@dnd-kit** - Drag & Drop profesional y accesible
- **Framer Motion** - Animaciones fluidas y atractivas
- **Socket.io-client** - WebSocket para tiempo real
- **Tailwind CSS + Shadcn/ui** - Estilos modernos y componentes
- **Axios** - Cliente HTTP robusto

### Backend
- **NestJS** - Framework backend escalable
- **TypeScript** - Tipado fuerte en todo el proyecto
- **MongoDB + Mongoose** - Base de datos NoSQL
- **Socket.io** - WebSocket server para tiempo real
- **Class-validator** - Validación de DTOs

### Automatización
- **N8N** - Plataforma de automatización para workflows
- **Docker + Docker Compose** - Contenedores para desarrollo

## 📁 Estructura del Proyecto

```
useTeam-PT/
├── README.md                    # Esta documentación
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de configuración
├── docker-compose.yml           # Servicios (MongoDB, N8N)
│
├── frontend/                    # Aplicación React
│   ├── package.json
│   ├── vite.config.ts          # Configuración optimizada
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── components/          # Componentes React
│       │   └── kanban/         # Tablero Kanban
│       ├── contexts/           # Context API (estado global)
│       ├── hooks/              # Custom hooks
│       ├── services/           # Servicios API
│       ├── types/              # Definiciones TypeScript
│       ├── utils/              # Utilidades
│       └── lib/                # Configuraciones
│
├── backend/                    # API NestJS
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── src/
│       ├── modules/            # Módulos organizados
│       │   ├── card/          # Gestión de tarjetas
│       │   ├── export/        # Exportación con N8N
│       │   ├── n8n/           # Servicio N8N
│       │   ├── websocket/     # Gateway WebSocket
│       │   └── database/      # Configuración MongoDB
│       ├── app.module.ts
│       └── main.ts
│
└── n8n/
    ├── workflow.json           # Flujo N8N para exportación
    └── setup-instructions.md   # Guía de configuración

## 🔧 Instalación y Configuración

### ⚠️ PARA EVALUADORES: CONFIGURACIÓN CRÍTICA REQUERIDA

**La exportación de N8N requiere configuración específica de credenciales SMTP y variables de entorno.**

Ver instrucciones detalladas en: [n8n/setup-instructions.md](./n8n/setup-instructions.md)

### Prerrequisitos

- **Node.js >= 18.x**
- **npm** o **yarn**
- **Docker** y **Docker Compose**
- **Git**
- **Cuenta Gmail con App Password** (para N8N)

### 1. Clonar el repositorio

```bash
git clone https://github.com/lilieth10/useTeam-PT.git
cd useTeam-PT
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/kanban-board

# Backend
PORT=3000

# N8N Webhook
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### 3. Levantar servicios con Docker

```bash
# Levantar MongoDB y N8N
docker-compose up -d

# Ver logs si es necesario
docker-compose logs -f
```

### 4. Instalar dependencias e iniciar

**Backend:**
```bash
cd backend
npm install
npm run start:dev  # Puerto 3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev       # Puerto 3001
```

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **N8N**: http://localhost:5678

## 📊 Funcionalidad de Exportación

Sistema completo de exportación automatizada del backlog.

### Proceso de Exportación

1. **Usuario** hace clic en "Exportar Backlog"
2. **Frontend** envía datos a `/api/export/backlog`
3. **Backend** dispara webhook a N8N
4. **N8N** procesa datos y genera CSV
5. **N8N** envía email con archivo adjunto
6. **Usuario** recibe notificación del resultado

### Configuración N8N

Ver instrucciones detalladas en: [n8n/setup-instructions.md](./n8n/setup-instructions.md)

## 🏗️ Arquitectura y Principios

### Principios SOLID Implementados

- **SRP (Single Responsibility)**: Cada módulo tiene una función específica
- **OCP (Open/Closed)**: Código extensible sin modificación
- **LSP (Liskov Substitution)**: Interfaces consistentes
- **ISP (Interface Segregation)**: DTOs específicos
- **DIP (Dependency Inversion)**: Inyección de dependencias

### Características Técnicas Destacadas

- **Pensamiento Asincrónico**: Operaciones no bloqueantes con manejo de estados
- **Estado Compartido Complejo**: Context API con filtros y búsquedas
- **Sincronización Multiusuario**: WebSocket con eventos bidireccionales
- **Performance Optimizada**: Code splitting y lazy loading

## 📡 WebSocket Events

### Eventos Cliente → Servidor
- `card:create` - Crear tarjeta
- `card:update` - Actualizar tarjeta
- `card:delete` - Eliminar tarjeta
- `card:move` - Mover tarjeta entre columnas

### Eventos Servidor → Cliente
- `card:created` - Nueva tarjeta creada por otro usuario
- `card:updated` - Tarjeta actualizada por otro usuario
- `card:deleted` - Tarjeta eliminada por otro usuario
- `card:moved` - Tarjeta movida por otro usuario

## 🧪 Desarrollo y Testing

### Scripts Disponibles

**Backend:**
```bash
npm run start:dev    # Desarrollo con hot reload
npm run build        # Build de producción
```

**Frontend:**
```bash
npm run dev          # Desarrollo con Vite
npm run build        # Build optimizado con code splitting
npm run preview      # Preview del build de producción
```

### Docker Services

```bash
# MongoDB
docker-compose up mongodb -d

# N8N
docker-compose up n8n -d

# Todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 📚 Documentación Adicional

- [Configuración de N8N](./n8n/setup-instructions.md)
- [Configuración de WebSocket](./backend/src/modules/websocket/)
- [Esquemas de Base de Datos](./backend/src/database/)
## 🤝 Contribución

Este proyecto es una prueba técnica desarrollada para **useTeam**.

## 📄 Licencia

MIT

---
