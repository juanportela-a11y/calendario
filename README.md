# PurifiCalendario 🏛️📅
### Plataforma Oficial de Eventos y Avisos Comunitarios de Purificación, Tolima

Bienvenido a la documentación oficial de **PurifiCalendario**, el sistema web integral para la difusión, gestión y consulta de eventos culturales, deportivos, jornadas de salud pública, asambleas comunitarias y avisos de servicios públicos (cortes de agua, energía eléctrica y vías) en el municipio de **Purificación, Tolima**.

---

## 📋 Tabla de Contenidos
1. [Lenguaje y Tecnologías Utilizadas](#-lenguaje-y-tecnolog%C3%ADas-utilizadas)
2. [Frameworks y Librerías](#-frameworks-y-librer%C3%ADas)
3. [Base de Datos y Modelo Relacional](#-base-de-datos-y-modelo-relacional)
4. [Arquitectura del Sistema (Hexagonal)](#-arquitectura-del-sistema-hexagonal)
5. [Requisitos Previos](#-requisitos-previos)
6. [Configuración Inicial e Instalación](#-configuraci%C3%B3n-inicial-e-instalaci%C3%B3n)
7. [Variables de Entorno](#-variables-de-entorno)
8. [Scripts Disponibles](#-scripts-disponibles)
9. [Configuración Global para su Correcto Funcionamiento](#-configuraci%C3%B3n-global-para-su-correcto-funcionamiento)
10. [Roles y Permisos de Usuario](#-roles-y-permisos-de-usuario)
11. [Endpoints de la API REST](#-endpoints-de-la-api-rest)

---

## 💻 Lenguaje y Tecnologías Utilizadas

- **Lenguaje Principal:** [TypeScript](https://www.typescriptlang.org/) (v5.8+) en todo el stack (Full-Stack Type Safety).
  - Tipado estático estricto para entidades del dominio, DTOs, interfaces de puertos y controladores de Express.
- **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (versión 18.x, 20.x o superior) con soporte nativo para ES Modules.
- **Empaquetadores / Bundlers:**
  - **Vite 6** para el cliente React (con soporte para compilación ultrarrápida y renderizado SPA).
  - **ESBuild** para empaquetar el servidor backend TypeScript en un ejecutable CommonJS autónomo y optimizado (`dist/server.cjs`).

---

## 🛠️ Frameworks y Librerías

### Frontend (Cliente)
- **Framework UI:** [React 19 / 18](https://react.dev/) basado en componentes funcionales y Hooks personalizados (`useState`, `useEffect`, `useMemo`).
- **Build Tool:** [Vite](https://vitejs.dev/) v6.2.
- **Estilos y Diseño:** [Tailwind CSS v4](https://tailwindcss.com/) con el plugin oficial `@tailwindcss/vite`.
- **Iconografía:** [Lucide React](https://lucide.dev/) (iconos vectoriales ligeros y accesibles).
- **Animaciones:** `motion` (`motion/react`) para transiciones fluidas de modales y tarjetas.

### Backend (Servidor)
- **Framework de Servidor:** [Express.js](https://expressjs.com/) (v4.21+) ejecutado como backend REST y servidor de activos estáticos.
- **Middleware Vite:** Integración de Vite en modo middleware para entorno de desarrollo sin interrupciones.
- **TSX (TypeScript Execute):** Ejecución directa en desarrollo sin paso previo de compilación manual.

---

## 🗄️ Base de Datos y Modelo Relacional

El sistema utiliza un modelo relacional **MySQL / MariaDB** estructurado bajo el motor de almacenamiento **InnoDB** con codificación `utf8mb4_unicode_ci` para garantizar la integridad referencial mediante claves primarias (`PRIMARY KEY`), claves foráneas (`FOREIGN KEY`) e índices optimizados.

### Diagrama Entidad-Relación y Tablas Principales

```text
 ┌─────────────────┐       1:1       ┌─────────────────────┐
 │    usuarios     ├─────────────────┤    organizadores    │
 └────────┬────────┘                 └──────────┬──────────┘
          │                                     │
          │ 1:N                                 │ 1:N
          ▼                                     ▼
 ┌─────────────────┐       M:N       ┌─────────────────────┐       N:1       ┌─────────────────┐
 │  notificaciones │      ┌──────────┤       eventos       ├─────────────────┤   categorias    │
 └─────────────────┘      │          └─────────────────────┘                 └─────────────────┘
                          │                     ▲
                          │ 1:N                 │
                          ▼                     │
                 ┌─────────────────┐            │
                 │  usuario_evento │────────────┘
                 │   (Favoritos)   │
                 └─────────────────┘
```

### Script DDL Oficial de MySQL (`purificalendario_db`)

```sql
-- Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS purificalendario_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE purificalendario_db;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(120) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('habitante', 'organizador', 'administrador') NOT NULL DEFAULT 'habitante',
  preferencias_categorias JSON NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  telefono VARCHAR(20) NULL,
  barrio VARCHAR(100) NULL
) ENGINE=InnoDB;

-- 2. Tabla de Organizadores (Relación 1:1 con Usuarios)
CREATE TABLE IF NOT EXISTS organizadores (
  id_organizador INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  nombre_entidad VARCHAR(150) NOT NULL,
  contacto_email VARCHAR(150) NOT NULL,
  contacto_telefono VARCHAR(20) NOT NULL,
  nit VARCHAR(30) NULL,
  verificado TINYINT(1) DEFAULT 1,
  descripcion TEXT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabla de Administradores (Relación 1:1 con Usuarios)
CREATE TABLE IF NOT EXISTS administradores (
  id_administrador INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  departamento VARCHAR(100) NOT NULL,
  nivel_acceso ENUM('superadmin', 'moderador') DEFAULT 'superadmin',
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Categorías de Eventos
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  color VARCHAR(20) NOT NULL,
  icono VARCHAR(50) NOT NULL,
  descripcion TEXT NULL
) ENGINE=InnoDB;

-- 5. Tabla de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NULL,
  lugar VARCHAR(250) NOT NULL,
  descripcion TEXT NOT NULL,
  id_categoria INT NOT NULL,
  id_organizador INT NOT NULL,
  estado ENUM('programado', 'en_curso', 'finalizado', 'cancelado') DEFAULT 'programado',
  info_adicional TEXT NULL,
  destacado TINYINT(1) DEFAULT 0,
  imagen_url VARCHAR(500) NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
  FOREIGN KEY (id_organizador) REFERENCES organizadores(id_organizador) ON DELETE CASCADE,
  INDEX idx_fecha (fecha),
  INDEX idx_categoria (id_categoria)
) ENGINE=InnoDB;

-- 6. Tabla Intermedia N:M: Usuario - Evento (Eventos Guardados / Asistencia)
CREATE TABLE IF NOT EXISTS usuario_evento (
  id_usuario_evento INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_evento INT NOT NULL,
  guardado TINYINT(1) DEFAULT 1,
  asistira TINYINT(1) DEFAULT 0,
  recordatorio_activo TINYINT(1) DEFAULT 1,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_evento (id_usuario, id_evento),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabla de Avisos Comunitarios y Servicios Públicos
CREATE TABLE IF NOT EXISTS avisos (
  id_aviso INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  tipo ENUM('corte_agua', 'corte_luz', 'vias', 'comunicado_alcaldia') NOT NULL,
  descripcion TEXT NOT NULL,
  sector_afectado VARCHAR(250) NOT NULL,
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_inicio_afectacion DATETIME NULL,
  fecha_fin_afectacion DATETIME NULL,
  urgente TINYINT(1) DEFAULT 0,
  id_administrador INT NULL,
  FOREIGN KEY (id_administrador) REFERENCES administradores(id_administrador) ON DELETE SET NULL,
  INDEX idx_tipo_aviso (tipo)
) ENGINE=InnoDB;

-- 8. Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_evento INT NULL,
  id_aviso INT NULL,
  tipo ENUM('nuevo_evento_interes', 'cambio_horario', 'aviso_urgente', 'recordatorio') NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  leida TINYINT(1) DEFAULT 0,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE SET NULL,
  FOREIGN KEY (id_aviso) REFERENCES avisos(id_aviso) ON DELETE SET NULL
) ENGINE=InnoDB;
```

---

## 🏛️ Arquitectura del Sistema (Hexagonal)

El proyecto sigue los principios de la **Arquitectura Hexagonal (Puertos y Adaptadores)** para separar la lógica de negocio de los detalles de infraestructura:

```text
├── src/
│   ├── domain/               # Capa de Dominio (Modelos puros de negocio e invariantes)
│   ├── ports/                # Capa de Puertos (Interfaces: IEventRepository, IUserRepository, INoticeRepository)
│   ├── adapters/             # Capa de Adaptadores Frontend (ApiClientAdapter para llamadas HTTP)
│   ├── components/           # Componentes UI de React (Navbar, CalendarView, EventCard, etc.)
│   ├── data/                 # Datos iniciales pre-cargados (Seed Data de Purificación)
│   ├── types/                # Definición de tipos e interfaces de TypeScript
│   ├── App.tsx               # Componente principal y enrutador de vistas
│   └── main.tsx              # Punto de entrada de React
├── server/
│   └── adapters/
│       ├── database.ts       # Adaptador de persistencia relacional con motor de integridad
│       └── httpServer.ts     # Configuración de rutas y controladores Express
└── server.ts                 # Punto de entrada del servidor Node.js + Middleware Vite
```

---

## 📦 Requisitos Previos

Antes de ejecutar o desplegar el proyecto, asegúrate de contar con:
- **Node.js**: Versión 18.0.0 o superior (se recomienda LTS 20.x).
- **NPM**: Versión 9.x o superior (incluido con Node.js).
- **Navegador Web**: Google Chrome, Mozilla Firefox, Microsoft Edge o Safari compatible con ES2022.

---

## 🚀 Configuración Inicial e Instalación

Sigue estos pasos para clonar y ejecutar el proyecto localmente:

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd purificalendario
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo de ejemplo para crear tu entorno local:
```bash
cp .env.example .env
```

---

## ⚙️ Variables de Entorno

El archivo `.env` permite configurar las claves de servicio y URLs del sistema:

| Variable | Descripción | Requerido | Valor Predeterminado / Ejemplo |
| :--- | :--- | :---: | :--- |
| `PORT` | Puerto de escucha del servidor | No | `3000` |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) | No | `development` |
| `GEMINI_API_KEY` | Clave para servicios de inteligencia artificial de Google Gemini | Opcional | `tu_api_key_aqui` |
| `APP_URL` | URL base del aplicativo | Opcional | `http://localhost:3000` |

---

## 📜 Scripts Disponibles

En el archivo `package.json` se definen los siguientes comandos:

- **`npm run dev`**: Inicia el servidor backend con `tsx server.ts` y monta Vite en modo middleware sobre el puerto `3000`. Permite recarga inmediata y consumo de endpoints `/api/*`.
- **`npm run build`**: Compila los activos estáticos del frontend con `vite build` y genera el bundle CommonJS del servidor en `dist/server.cjs` utilizando `esbuild`.
- **`npm run start`**: Ejecuta el servidor en modo producción ejecutando `node dist/server.cjs`.
- **`npm run lint`**: Ejecuta la verificación estática de tipos de TypeScript (`tsc --noEmit`).
- **`npm run clean`**: Elimina la carpeta `dist/` generada en la compilación.

---

## 🌐 Configuración Global para su Correcto Funcionamiento

Para garantizar que el sistema funcione de manera óptima tanto en local como en contenedores (Cloud Run / Docker):

1. **Configuración de Host y Puerto:**
   - El servidor Express se enlaza a la dirección `0.0.0.0` y al puerto `3000`.
   - No cambies el puerto `3000` si ejecutas en entornos con proxy inverso.
2. **Manejo de Rutas (SPA Fallback):**
   - En desarrollo, el middleware de Vite intercepta las peticiones que no corresponden a la API y sirve la SPA.
   - En producción, Express sirve la carpeta estática `dist/` y redirige cualquier ruta comodín (`*`) a `dist/index.html`.
3. **Persistencia Inicial:**
   - El adaptador de base de datos incluye datos iniciales representativos de Purificación, Tolima (Parque Principal, Malecón, Villa de las Palmas, eventos de cultura, deporte, salud y avisos de servicios públicos).

---

## 👥 Roles y Permisos de Usuario

El sistema cuenta con control de acceso basado en roles (**RBAC**):

1. **Habitante (Usuario General):**
   - Navegación y búsqueda de eventos en el calendario interactivo.
   - Guardado de eventos favoritos y descarga de recordatorios.
   - Configuración de preferencias por categorías en su perfil.
   - Recepción de notificaciones y lectura de avisos comunitarios urgentes.
2. **Organizador de Eventos:**
   - Todo lo que realiza un habitante.
   - Formulario para registrar nuevos eventos institucionales.
   - Actualización y eliminación de sus propios eventos registrados.
3. **Administrador de Eventos:**
   - Control total de la plataforma municipal.
   - Métricas y estadísticas generales (conteo de eventos, usuarios, avisos y organizadores).
   - Publicación y gestión de avisos oficiales de servicios públicos (cortes de agua, energía, vías).
   - Gestión de usuarios y visualizador interactivo del esquema MySQL DDL.

---

## 🔌 Endpoints de la API REST

Todas las rutas de la API inician con el prefijo `/api`:

### Eventos
- `GET /api/events` - Obtener lista de eventos (con filtros opcionales por categoría, fecha o búsqueda).
- `GET /api/events/:id` - Obtener detalle de un evento por ID.
- `POST /api/events` - Crear un nuevo evento (Organizador / Admin).
- `PUT /api/events/:id` - Actualizar información de un evento.
- `DELETE /api/events/:id` - Eliminar un evento.
- `GET /api/events/saved/:id_usuario` - Obtener eventos guardados por un usuario.
- `POST /api/events/save` - Alternar estado guardado/favorito de un evento (`{ id_usuario, id_evento }`).

### Categorías
- `GET /api/categories` - Listar las 7 categorías municipales codificadas por color e ícono.

### Avisos Comunitarios y Servicios
- `GET /api/notices` - Obtener lista de avisos de cortes de agua, luz, vías o comunicados.
- `POST /api/notices` - Publicar un nuevo aviso oficial (Administrador).
- `DELETE /api/notices/:id` - Eliminar un aviso oficial.

### Usuarios y Notificaciones
- `GET /api/users` - Listar usuarios registrados.
- `POST /api/users/login-or-create` - Iniciar sesión o registrar nuevo usuario.
- `PUT /api/users/:id/preferences` - Actualizar preferencias de categorías del usuario.
- `GET /api/notifications/:id_usuario` - Listar notificaciones del usuario.
- `PUT /api/notifications/:id/read` - Marcar una notificación como leída.
- `PUT /api/notifications/read-all/:id_usuario` - Marcar todas las notificaciones como leídas.

### Administración y Esquema
- `GET /api/admin/stats` - Estadísticas y métricas generales del municipio.
- `GET /api/database/ddl` - Obtener el script DDL SQL completo para MySQL.

---

## 🇨🇴 Municipio de Purificación, Tolima
*PurifiCalendario es una herramienta tecnológica diseñada para fortalecer la participación ciudadana, la cultura y la comunicación comunitaria en la "Villa de las Palmas".*
