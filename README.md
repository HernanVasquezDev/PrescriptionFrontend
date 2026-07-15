# Prescriptions Frontend

Frontend de una aplicación web para gestionar recetas médicas, pensada para roles de administrador, médico y paciente. La interfaz consume una API REST y ofrece autenticación, listado y filtrado de recetas, creación de nuevas prescripciones, descarga de PDF y métricas administrativas.

## 📌 Descripción del proyecto

Este proyecto es una SPA construida con Next.js 16 y React 19. Su objetivo es permitir:

- iniciar sesión con credenciales del sistema
- consultar recetas por usuario y rol
- crear nuevas recetas médicas desde el rol de médico
- descargar el PDF asociado a una receta
- visualizar métricas generales para administradores

## 🧩 Stack principal

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- Lucide React

## 👤 Roles soportados

- Admin: acceso al dashboard de métricas y navegación completa.
- Doctor: creación y visualización de recetas.
- Patient: consulta de sus recetas personales.

## 🗂️ Estructura del proyecto

```text
app/
  dashboard/
    admin/
    prescriptions/
      new/
    profile/
  login/
context/
  AuthContext.tsx
lib/
  api.ts
```

### Componentes principales

- `app/login/page.tsx`: pantalla de inicio de sesión.
- `app/dashboard/layout.tsx`: layout con sidebar y navegación por rol.
- `app/dashboard/prescriptions/page.tsx`: listado, filtros y descarga de PDFs.
- `app/dashboard/prescriptions/new/page.tsx`: formulario para crear recetas.
- `app/dashboard/admin/page.tsx`: panel de métricas con gráficos.
- `context/AuthContext.tsx`: manejo central de autenticación.
- `lib/api.ts`: cliente HTTP para consumir la API y definir los tipos.

## 🚀 Requisitos previos

Antes de levantar el proyecto asegúrate de tener instalado:

- Node.js 20+
- npm o pnpm

## ⚙️ Instalación

1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
3. Instala dependencias:

```bash
npm install
```

## 🔐 Variables de entorno

Este frontend usa la variable `NEXT_PUBLIC_API_URL` para apuntar a la API backend.

Crea un archivo `.env.local` en la raíz del proyecto con algo como:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> Ajusta la URL según la base real de tu backend. La aplicación usa esa variable como host base para las llamadas HTTP.

## ▶️ Ejecutar en desarrollo

```bash
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

## 🛠️ Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 🌐 Flujo principal

1. El usuario entra a `/login`.
2. El contexto de autenticación valida el token guardado en `localStorage`.
3. Si el usuario es admin, se redirige a `/dashboard/admin`.
4. Si es doctor o paciente, se redirige a `/dashboard/prescriptions`.
5. El rol determina los accesos y la navegación disponible en el sidebar.

## 🧪 Observaciones

- El proyecto no incluye una base de datos ni lógica de servidor en frontend.
- Toda la persistencia y validación de datos se espera desde la API del backend.
- La descarga de PDF se hace directamente desde la ruta `/prescriptions/:id/pdf` del backend.

## 📝 Mantenimiento

Si quieres extender el proyecto, los puntos más relevantes son:

- agregar nuevas rutas en `app/`
- ampliar el cliente HTTP en `lib/api.ts`
- mantener el contexto de autenticación en `context/AuthContext.tsx`
- reutilizar el layout protegido de dashboard para nuevas pantallas

