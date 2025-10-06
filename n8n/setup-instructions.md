# 📋 Instrucciones de Configuración N8N

Guía paso a paso para configurar el flujo de exportación de backlog con N8N.

## 🚀 Inicio Rápido

### 1. Levantar N8N con Docker

```bash
docker-compose up n8n -d
```

O usando el comando directo:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n:1.106.3
```

### 2. Acceder a N8N

Abrir en el navegador: http://localhost:5678

## 🔧 Configuración del Flujo

### Paso 1: Importar Workflow

1. Ir a **Workflows** en el menú lateral
2. Hacer clic en **Import from File**
3. Seleccionar el archivo `workflow.json` de esta carpeta
4. El flujo se importará automáticamente

### Paso 2: Configurar Credenciales de Email

1. Abrir el nodo **Send Email**
2. Hacer clic en **Create New Credential**
3. Configurar con los siguientes datos:

```
Host: smtp.gmail.com
Port: 587
User: tu-email@gmail.com
Password: tu-app-password
```

**Nota**: Para Gmail, necesitas generar una "App Password":
- Ir a https://myaccount.google.com/security
- Activar verificación en 2 pasos
- Generar contraseña de aplicación

### Paso 3: Activar el Workflow

1. En la esquina superior derecha, cambiar el switch a **Active**
2. El webhook estará disponible en: `http://localhost:5678/webhook/kanban-export`

## 📊 Estructura del Flujo

El flujo consta de los siguientes nodos:

### 1. Webhook Trigger
- **URL**: `/webhook/kanban-export`
- **Method**: POST
- **Recibe**: Datos del tablero desde el backend

### 2. Function - Process Data
- Transforma los datos del tablero
- Filtra tarjetas del backlog
- Prepara estructura para CSV

### 3. Spreadsheet File - Generate CSV
- Genera archivo CSV con las columnas:
  - ID de tarea
  - Título
  - Descripción
  - Columna
  - Fecha de creación

### 4. Send Email
- Envía email con CSV adjunto
- Destinatario configurable
- Asunto: "Exportación de Backlog - Tablero Kanban"

### 5. HTTP Response
- Retorna confirmación al backend
- Status: 200 OK

## 🔄 Flujo de Datos

```
Backend API
    ↓
Webhook Trigger (N8N)
    ↓
Process Data (Function)
    ↓
Generate CSV (Spreadsheet)
    ↓
Send Email (SMTP)
    ↓
HTTP Response
    ↓
Backend API
```

## 🧪 Probar el Flujo

### Opción 1: Desde N8N

1. Abrir el workflow
2. Hacer clic en **Execute Workflow**
3. Verificar que todos los nodos se ejecuten correctamente

### Opción 2: Desde la Aplicación

1. Abrir el tablero Kanban
2. Hacer clic en el botón "Exportar Backlog"
3. Verificar que llegue el email

### Opción 3: Con cURL

```bash
curl -X POST http://localhost:5678/webhook/kanban-export \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "test-board",
    "cards": [
      {
        "id": "1",
        "title": "Tarea de prueba",
        "description": "Descripción de prueba",
        "column": "Backlog",
        "createdAt": "2025-10-06T14:00:00Z"
      }
    ],
    "email": "destinatario@example.com"
  }'
```

## 🐛 Troubleshooting

### Error: "Workflow not found"
- Verificar que el workflow esté importado
- Verificar que esté activado (switch en ON)

### Error: "Email not sent"
- Verificar credenciales SMTP
- Verificar que el puerto 587 esté abierto
- Para Gmail, verificar App Password

### Error: "Webhook timeout"
- Verificar que N8N esté corriendo
- Verificar la URL del webhook en el backend
- Revisar logs: `docker-compose logs n8n`

## 📝 Variables de Entorno

Configurar en el archivo `.env`:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
```

## 🔒 Seguridad

### Recomendaciones:

1. **No compartir credenciales** en el repositorio
2. Usar **variables de entorno** para datos sensibles
3. Activar **autenticación básica** en N8N para producción:

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=secure-password
```

## 📚 Recursos

- [Documentación oficial de N8N](https://docs.n8n.io/)
- [N8N Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [N8N Email Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.emailsend/)

---

¿Problemas? Revisa los logs de N8N:
```bash
docker-compose logs -f n8n
```
