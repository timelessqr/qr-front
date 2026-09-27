# 🌹 Lazos de Vida - Sistema de Memoriales Digitales

Sistema completo de memoriales digitales que incluye:
- ✅ **Memorial público** - Acceso vía códigos QR
- ✅ **Panel administrativo** - Gestión completa del sistema  
- ✅ **Autenticación JWT** - Acceso seguro para administradores
- ✅ **API integrada** - Conexión completa con el backend
- ✅ **QR con IP de red** - Funciona en dispositivos móviles

## 🚀 **CONFIGURACIÓN E INSTALACIÓN**

### **1. Requisitos previos**
- Node.js 18+ 
- Backend funcionando en puerto 3000
- Dispositivos en la misma red WiFi

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**
```bash
# Archivo: .env.local
VITE_API_URL=http://192.168.1.34:3000/api
VITE_FRONTEND_URL=http://192.168.1.34:5173
VITE_NODE_ENV=development
```

**⚠️ IMPORTANTE:** Cambia `192.168.1.34` por la IP de tu computadora en la red local.

### **4. Ejecutar el proyecto**
```bash
npm run dev
```

El frontend estará disponible en:
- **Computadora**: `http://localhost:5173` o `http://192.168.1.34:5173`
- **Móvil**: `http://192.168.1.34:5173` (desde cualquier dispositivo en la misma red)

## 🔗 **RUTAS PRINCIPALES**

### **Públicas:**
- `/` - Página de inicio
- `/memorial/:qrCode` - Memorial público (acceso vía QR)

### **Administrativas (requieren login):**
- `/admin/login` - Login del administrador  
- `/admin` - Dashboard principal
- `/admin/clients` - Gestión de clientes
- `/admin/clients/new` - Crear nuevo cliente
- `/admin/clients/:id` - Detalles de cliente
- `/admin/memorials` - Lista de memoriales
- `/admin/memorials/new/:clientId` - Crear memorial para cliente
- `/admin/memorials/edit/:memorialId` - Editar memorial
- `/admin/memorials/:memorialId/print-qr` - Imprimir código QR

## 🎯 **FLUJO DE TRABAJO COMPLETO**

### **1. Setup inicial**
```bash
# Backend
cd lazos-de-vida-backend
npm run dev

# Frontend (nueva terminal)
cd qr-front/memorial-site  
npm run dev
```

### **2. Crear administrador (primera vez)**
```bash
# En el backend
cd lazos-de-vida-backend
node create-initial-admin.js
```

### **3. Login del administrador**
1. Ve a `http://192.168.1.34:5173/admin/login`
2. Usa las credenciales del administrador creadas
3. Accede al dashboard principal

### **4. Registrar cliente**
1. Dashboard → "Nuevo Cliente" 
2. Llena: nombre, apellido, teléfono, ciudad
3. Sistema genera código único automáticamente
4. Cliente queda registrado

### **5. Crear memorial**
1. Lista de clientes → Click en cliente → "Nuevo Memorial"
2. Llena datos del fallecido: nombre, fechas, biografía, etc.
3. **El sistema automáticamente**:
   - Crea el memorial
   - Genera código QR único
   - Configura URL con IP de red: `http://192.168.1.34:5173/memorial/XXXXX`
4. Redirige a página de impresión

### **6. Imprimir y entregar QR**
1. Página automática de impresión con QR
2. Botón "Imprimir QR" para imprimir físicamente
3. Botón "Descargar Imagen" para guardar QR
4. Entregar QR físico al cliente

### **7. Acceso público desde móvil**
1. Cliente/familia escanea QR con cámara del teléfono
2. Se abre automáticamente el memorial: `http://192.168.1.34:5173/memorial/XXXXX`
3. Acceso completo sin necesidad de login
4. Pueden ver biografía, fechas, ubicación, familia

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

### **Frontend:**
- **React 19** + **Vite** - Framework moderno y rápido
- **React Router DOM** - Navegación SPA
- **Tailwind CSS** - Estilos utilitarios
- **Axios** - Peticiones HTTP al backend
- **React Context** - Estado global de autenticación

### **Backend integrado:**
- **Node.js** + **Express** - API REST
- **MongoDB** + **Mongoose** - Base de datos
- **JWT** - Autenticación segura
- **QRCode** - Generación automática de códigos QR

## 🎨 **CARACTERÍSTICAS PRINCIPALES**

### **Panel Administrativo:**
- ✅ Login JWT seguro
- ✅ Dashboard con métricas
- ✅ CRUD completo de clientes
- ✅ Creación rápida de memoriales  
- ✅ Generación automática de QR con IP de red
- ✅ Página de impresión optimizada
- ✅ Interfaz responsive

### **Memorial Público:**
- ✅ Acceso vía QR desde cualquier dispositivo móvil
- ✅ Biografía completa y datos personales
- ✅ Información familiar (cónyuge, hijos)
- ✅ Ubicación (ciudad, país, cementerio)
- ✅ Fechas importantes y edad al fallecer
- ✅ Diseño responsive para móviles
- ✅ URL con IP de red para acceso desde cualquier dispositivo

### **Sistema de QR:**
- ✅ Generación automática al crear memorial
- ✅ Códigos únicos de 12 caracteres
- ✅ URLs con IP de red local (no localhost)
- ✅ Funciona en cualquier dispositivo de la red WiFi
- ✅ Página de impresión lista para usar

## 📱 **CONFIGURACIÓN DE RED**

### **Para que funcione en móviles:**

1. **Obtén la IP de tu computadora:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows  
ipconfig | find "IPv4"
```

2. **Actualiza .env.local con tu IP:**
```bash
VITE_API_URL=http://TU_IP:3000/api
VITE_FRONTEND_URL=http://TU_IP:5173
```

3. **Asegúrate de que backend esté configurado:**
```bash
# En backend/.env
QR_BASE_URL=http://TU_IP:5173/memorial
FRONTEND_URL=http://TU_IP:5173
```

4. **Reinicia ambos servidores:**
```bash
# Backend
npm run dev

# Frontend  
npm run dev
```

**Los QRs generados tendrán URLs como**: `http://192.168.1.34:5173/memorial/A1B2C3D4E5F6`

## 🔐 **AUTENTICACIÓN**

El panel usa la cuenta de administrador que existe en la base del backend. Las
credenciales no se guardan en el repo.

## 🧪 **TESTING**

### **Test de conectividad:**
```bash
# Verifica backend
curl http://192.168.1.34:3000/health

# Verifica frontend
curl http://192.168.1.34:5173
```

### **Test de QR:**
1. Crea un memorial desde el admin
2. Nota el código QR generado  
3. Accede desde móvil a: `http://192.168.1.34:5173/memorial/CODIGO`
4. Debería cargar el memorial sin errores

## 🐛 **RESOLUCIÓN DE PROBLEMAS**

### **"Memorial no encontrado" en móvil:**
- ✅ **Solucionado**: QRs ahora usan IP de red en lugar de localhost
- ✅ Verifica que backend y frontend estén usando la misma IP
- ✅ Confirma que dispositivos estén en la misma red WiFi

### **Error de conexión con API:**
```bash
# Verifica que backend esté corriendo
curl http://192.168.1.34:3000/health

# Revisa variables de entorno
cat .env.local
```

### **Error al crear memorial:**
- Verifica que el cliente exista
- Revisa logs de la consola del navegador
- Confirma que el token JWT sea válido

### **QR no funciona desde móvil:**
- Verifica la IP en .env.local  
- Reinicia ambos servidores después de cambiar IP
- Confirma que no hay firewall bloqueando el puerto 5173

## 📂 **ESTRUCTURA DEL PROYECTO**

```
memorial-site/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── admin/          # Componentes del panel admin
│   │   └── public/         # Componentes públicos del memorial
│   ├── pages/              # Páginas principales
│   │   ├── admin/          # Páginas administrativas
│   │   └── Memorial.jsx    # Página pública del memorial
│   ├── services/           # Servicios API
│   ├── context/            # Contextos de React
│   ├── hooks/              # Hooks personalizados
│   └── App.jsx             # Aplicación principal
├── public/                 # Archivos estáticos
├── .env.local             # Variables de entorno
└── package.json           # Dependencias
```

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ **IMPLEMENTADO (Backend + Frontend):**

**🔐 Autenticación & Admin:**
* ✅ Login de administrador
* ✅ Dashboard principal con métricas reales
* ✅ Gestión completa de clientes (CRUD)
* ✅ Gestión completa de memoriales (CRUD)
* ✅ **Gestión de códigos QR** (nueva funcionalidad)

**🎯 Funcionalidades Core:**
* ✅ Generación automática de QR por memorial
* ✅ Páginas públicas de memoriales
* ✅ Sistema de comentarios con códigos de acceso
* ✅ Subida y gestión de media (fotos/videos)
* ✅ Configuración de privacidad de memoriales

**📊 Estadísticas & Reportes:**
* ✅ Métricas del dashboard conectadas
* ✅ Actividad reciente (clientes y memoriales)
* ✅ Estadísticas de QR y memoriales

### 🚧 **PENDIENTE POR IMPLEMENTAR:**

**📱 Frontend:**
* 🔄 **Carga de contenido** - Upload de fotos/videos en la interfaz
* 🔄 **Página de perfil de empresa** - Configuración y branding

**⚙️ Backend (opcional/futuro):**
* 🔄 Notificaciones por email
* 🔄 Exportación de datos
* 🔄 Analytics avanzados
* 🔄 API para integración externa

### 🎯 **PRIORIDADES INMEDIATAS:**
1. **Carga de contenido** → Para que los admins suban fotos/videos
2. **Perfil de empresa** → Personalización y configuración

## 📞 **SOPORTE**

### **Problemas comunes:**
1. **Backend no arranca**: Verifica MongoDB y variables .env
2. **Frontend no conecta**: Revisa VITE_API_URL en .env.local
3. **QR no funciona en móvil**: Confirma IP de red en configuración
4. **Error de autenticación**: Limpia localStorage y reloguea

### **Para debugging:**
- Consola del navegador (F12)
- Logs del backend en terminal
- Network tab para ver peticiones HTTP

---

## 🎉 **LISTO PARA USAR**

**El sistema está completamente funcional para:**
- ✅ Crear y gestionar clientes
- ✅ Generar memoriales con QR
- ✅ Acceso público desde móviles via QR  
- ✅ Imprimir códigos QR para entrega
