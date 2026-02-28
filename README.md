# Supabase Task Manager

Aplicación de gestión de tareas construida con React, Vite, TypeScript y Supabase.

## Requisitos Previos

1. Una cuenta en [Supabase](https://supabase.com/).
2. Un proyecto de Supabase creado.

## Configuración de la Base de Datos

Ejecuta el siguiente SQL en el Editor SQL de tu Dashboard de Supabase para crear la tabla y habilitar Realtime:

```sql
-- 1. Crear la tabla de tareas
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() not null,
  title text not null,
  description text,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar RLS (Row Level Security)
alter table tasks enable row level security;

-- 3. Crear políticas de seguridad
create policy "Los usuarios pueden ver sus propias tareas"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar sus propias tareas"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propias tareas"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propias tareas"
  on tasks for delete
  using (auth.uid() = user_id);

-- 4. Habilitar Realtime para la tabla tasks
alter publication supabase_realtime add table tasks;
```

## Configuración Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Crear un archivo `.env.local` en la raíz del proyecto con tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Notas de Seguridad e Implementación

- **Confirmación por Email**: Puedes habilitar/deshabilitar la confirmación por email en el Dashboard de Supabase: `Authentication > Settings > Email Auth > Confirm email`.
- **Realtime**: La aplicación usa `supabase.channel` para escuchar cambios en la tabla `tasks` y refrescar la lista automáticamente.
- **RLS**: Se asume que las políticas de seguridad están configuradas para que `auth.uid() = user_id`.
- **Limitación**: El reenvío de confirmación se realiza mediante `supabase.auth.resend`.
