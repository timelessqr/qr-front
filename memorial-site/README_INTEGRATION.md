# 🌹 Lazos de Vida - Frontend con Panel Administrativo

Sistema completo de memoriales digitales que incluye:
- ✅ **Memorial público** - Acceso vía códigos QR
- ✅ **Panel administrativo** - Gestión completa del sistema
- ✅ **Autenticación JWT** - Acceso seguro para administradores
- ✅ **API integrada** - Conexión completa con el backend

## 🚀 **CONFIGURACIÓN INICIAL**

### **1. Instalar dependencias**
```bash
npm install
```

### **2. Configurar variables de entorno**
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tus configuraciones
VITE_API_URL=http://localhost:3000/api
VITE_FRONTEND_URL=http://localhost:5173
```

### **3. Asegúrate de que el backend esté corriendo**
```bash
# En otra terminal, ejecuta el backend
cd ../lazos-de-vida-backend
npm run dev
```

### **4. Ejecutar el frontend**
```bash
npm run dev
```

## 🔗 **RUTAS PRINCIPALES**

### **Públicas:**
- `/` - Página de inicio
- `/memorial/:qrCode` - Memorial público (acceso vía QR)

### **Administrativas:**
- `/admin/login` - Login del administrador
- `/admin` - Dashboard principal
- `/admin/clients` - Gestión de clientes
- `/admin/clients/new` - Crear nuevo cliente
- `/admin/memorials` - Gestión de memoriales (próximamente)
- `/admin/memorials/:id/print-qr` - Imprimir código QR

## 🎯 **FLUJO DE TRABAJO**

### **1. Login del Administrador**
```
1. Accede a /admin/login
2. Usa las credenciales del administrador creadas en el backend
3. Una vez autenticado, accede al dashboard
```

### **2. Gestión de Clientes**
```
1. Dashboard → "Nuevo Cliente" o ir a /admin/clients
2. Llenar formulario con datos del cliente
3. El sistema genera automáticamente un código único
4. Cliente queda registrado en el sistema
```

### **3. Creación de Memoriales**
```
1. Desde la lista de clientes → "Memorial"
2. Completar datos del memorial (nombre, biografía, fechas, etc.)
3. El sistema genera automáticamente el código QR
4. QR queda listo para imprimir y entregar
```

### **4. Impresión de QR**
```
1. Desde cualquier memorial → "Imprimir QR"
2. Se abre la página de impresión optimizada
3. Botón "Imprimir QR" para imprimir directamente
4. También se puede descargar como imagen
```

### **5. Acceso Público**
```
1. Cliente escanea el QR con su teléfono
2. Se abre automáticamente /memorial/{codigo}
3. Acceso público al memorial sin necesidad de login
4. Pueden ver biografía, fotos, videos y dejar comentarios
```

## 🎨 **CARACTERÍSTICAS PRINCIPALES**

### **Panel Administrativo:**
- ✅ Autenticación JWT segura
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de clientes
- ✅ Creación y edición de memoriales
- ✅ Generación automática de códigos QR
- ✅ Sistema de impresión optimizado
- ✅ Interfaz responsive y moderna

### **Memorial Público:**
- ✅ Acceso vía códigos QR únicos
- ✅ Biografía y datos personales
- ✅ Galería de fotos con lightbox
- ✅ Reproductor de videos
- ✅ Sistema de comentarios con código familiar
- ✅ Temas personalizables
- ✅ Diseño responsive para móviles

### **Integración con Backend:**
- ✅ API REST completamente integrada
- ✅ Manejo de errores y estados de carga
- ✅ Paginación en listas de datos
- ✅ Búsqueda en tiempo real
- ✅ Validación de formularios
- ✅ Subida de archivos (fotos/videos)

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

### **Frontend:**
- React 19 + Vite
- React Router DOM (routing)
- Tailwind CSS (estilos)
- Axios (peticiones HTTP)
- React Context (estado global)

### **Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT (autenticación)
- Multer (subida de archivos)
- QRCode (generación de QR)

## 📱 **CÓDIGOS QR DE PRUEBA**

Una vez que el backend esté corriendo, puedes probar estos códigos QR de ejemplo:

```bash
# Rosa Elena González (Profesora)
http://localhost:5173/memorial/6698BF964C79
Código comentarios: ROSA-2025-KPO

# Pedro Antonio Morales (Minero)  
http://localhost:5173/memorial/2E8D702D2C74
Código comentarios: PEDRO-2025-B66

# María Salud Ramírez (Ama de casa)
http://localhost:5173/memorial/C5697ABE5309
```

## 🔐 **AUTENTICACIÓN**

### **Crear Administrador Inicial:**
```bash
# En el directorio del backend
cd ../lazos-de-vida-backend
npm run setup:admin
```

### **Credenciales por defecto:**
- Email: `admin@lazosdevida.com`
- Password: `admin123`

**⚠️ IMPORTANTE:** Cambia estas credenciales en producción.

## 🎯 **PRÓXIMAS FUNCIONALIDADES**

### **Panel Admin:**
- [ ] Gestión completa de memoriales
- [ ] Subida de fotos y videos
- [ ] Configuración de temas
- [ ] Reportes y estadísticas
- [ ] Gestión de comentarios
- [ ] Configuración del sistema

### **Memorial Público:**
- [ ] Reproductor de videos
- [ ] Compartir en redes sociales
- [ ] Descargar memorial en PDF
- [ ] Modo offline
- [ ] Notificaciones de comentarios

## 🐛 **RESOLUCIÓN DE PROBLEMAS**

### **Error de conexión con API:**
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000/health

# Revisa las variables de entorno
cat .env.local
```

### **Error de autenticación:**
```bash
# Limpia el localStorage
localStorage.removeItem('admin_token')
localStorage.removeItem('admin_user')
```

### **Error al cargar memoriales:**
```bash
# Verifica que existan datos de prueba en el backend
curl http://localhost:3000/api/memorial/6698BF964C79
```

## 📞 **SOPORTE**

Si tienes problemas con la integración:

1. **Verifica que el backend esté corriendo** en `http://localhost:3000`
2. **Revisa las variables de entorno** en `.env.local`
3. **Comprueba la consola del navegador** para errores de JavaScript
4. **Verifica la consola del terminal** para errores del servidor

## 🚀 **DESPLIEGUE EN PRODUCCIÓN**

### **Configuración para producción:**
```bash
# Variables de entorno de producción
VITE_API_URL=https://tu-api.com/api
VITE_FRONTEND_URL=https://tu-dominio.com

# Build de producción
npm run build

# Los archivos compilados estarán en /dist
```

---

## ✅ **ESTADO DEL PROYECTO**

- ✅ **Autenticación** - Completamente funcional
- ✅ **Dashboard** - Implementado con métricas
- ✅ **Gestión de clientes** - CRUD completo
- ✅ **Memorial público** - Acceso vía QR funcional
- ✅ **Generación de QR** - Listo para imprimir
- 🟡 **Gestión de memoriales** - En desarrollo
- 🟡 **Subida de archivos** - En desarrollo
- 🟡 **Sistema de comentarios** - Backend listo, frontend pendiente

**El sistema está listo para uso básico. Puedes crear clientes, generar memoriales básicos y acceder vía QR.** 🎉
