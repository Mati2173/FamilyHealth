# FamilyHealth
Aplicación web de seguimiento de salud familiar.

Permite a cada integrante de la familia registrar y visualizar la evolución de sus mediciones corporales obtenidas con la balanza **Philco BAP2021PI**: peso, grasa corporal, agua corporal, masa muscular, masa ósea estimada, ingesta calórica recomendada e índice de masa corporal (IMC).

## Stack tecnológico
- Frontend: `React 18` con `Vite`, `Tailwind CSS v3` y componentes `shadcn/ui`
- Backend y base de datos: `Supabase` (`PostgreSQL` con Row Level Security)
- Autenticación: `Supabase Auth` (email y contraseña)
- Gráficos: `Recharts`
- Validación de formularios: `react-hook-form` y `Zod`
- Deploy: `Vercel`

## Funcionalidades
- Registro e inicio de sesión individual para cada familiar
- Perfil con nombre, altura, fecha de nacimiento y género
- Control de privacidad por usuario (perfil público o privado)
- Formulario de nueva medición con ayuda contextual por campo
- Dashboard individual con gráfico de evolución de peso
- Historial completo con opción de eliminar registros
- Dashboard familiar que muestra el último registro de perfiles públicos

## Variables de entorno
Crear un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Dentro del panel de Supabase, ve a **Project Settings → API / Data API** para encontrar:
- el **Project URL** para `VITE_SUPABASE_URL`
- la **public/anon (o publishable) key** para `VITE_SUPABASE_ANON_KEY`

## Instalación y desarrollo local

### Instalar dependencias

```bash
npm install
```

### Levantar servidor de desarrollo

```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

## Base de datos

El esquema SQL completo, incluyendo tablas, triggers, políticas RLS y vistas, se encuentra en el directorio `supabase/migrations`. El archivo `001_initial_schema.sql` contiene la estructura base necesaria para el funcionamiento de la aplicación. Para cargar este esquema en tu instancia de Supabase, puedes usar la herramienta de migraciones de Supabase CLI o ejecutar el SQL directamente desde el dashboard de Supabase.
