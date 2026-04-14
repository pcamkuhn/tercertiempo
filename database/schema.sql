-- ============================================================
--  SALADOEC — Esquema de base de datos para Supabase
--  Ejecutar completo en: Supabase → SQL Editor → New query
-- ============================================================

-- ============================================================
--  1. PERFILES DE USUARIO
-- ============================================================
create table public.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null,
  username    text unique not null,
  equipo      text not null,
  avatar_color text default '#FFD100',
  created_at  timestamptz default now()
);

-- RLS: cada usuario solo puede ver/editar su propio perfil
alter table public.perfiles enable row level security;
create policy "Ver perfiles" on public.perfiles for select using (true);
create policy "Insertar propio" on public.perfiles for insert with check (auth.uid() = id);
create policy "Actualizar propio" on public.perfiles for update using (auth.uid() = id);

-- Función para obtener email por id (para login con username)
create or replace function get_email_by_id(user_id uuid)
returns text language sql security definer as $$
  select email from auth.users where id = user_id;
$$;

-- ============================================================
--  2. PRONÓSTICOS DEL PRODE
-- ============================================================
create table public.pronosticos (
  id          bigserial primary key,
  user_id     uuid references public.perfiles(id) on delete cascade,
  jornada     int not null,
  picks       jsonb default '{}',       -- {"f1": "1", "f2": "x", ...}
  marcadores  jsonb default '{}',       -- {"f1": "2-1", "f2": "1-1", ...}
  updated_at  timestamptz default now(),
  unique(user_id, jornada)
);

alter table public.pronosticos enable row level security;
create policy "Ver todos los pronósticos" on public.pronosticos for select using (true);
create policy "Insertar propio pronóstico" on public.pronosticos for insert with check (auth.uid() = user_id);
create policy "Actualizar propio pronóstico" on public.pronosticos for update using (auth.uid() = user_id);

-- ============================================================
--  3. RESULTADOS DE JORNADAS (solo admin puede insertar)
-- ============================================================
create table public.resultados_jornadas (
  id          bigserial primary key,
  jornada     int unique not null,
  resultados  jsonb default '{}',       -- {"f1": "1", "f2": "x", ...}
  marcadores  jsonb default '{}',       -- {"f1": "2-1", ...}
  revelado    boolean default false,
  updated_at  timestamptz default now()
);

alter table public.resultados_jornadas enable row level security;
create policy "Ver resultados" on public.resultados_jornadas for select using (true);
-- Solo admin inserta resultados (hacerlo desde Supabase Dashboard directamente)

-- ============================================================
--  4. LIGAS
-- ============================================================
create table public.ligas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  privada     boolean default true,
  codigo      text unique not null,
  creador_id  uuid references public.perfiles(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.ligas enable row level security;
create policy "Ver ligas públicas" on public.ligas for select using (true);
create policy "Crear liga" on public.ligas for insert with check (auth.uid() = creador_id);
create policy "Admin puede editar su liga" on public.ligas for update using (auth.uid() = creador_id);

-- ============================================================
--  5. MIEMBROS DE LIGAS
-- ============================================================
create table public.liga_miembros (
  id          bigserial primary key,
  liga_id     uuid references public.ligas(id) on delete cascade,
  user_id     uuid references public.perfiles(id) on delete cascade,
  joined_at   timestamptz default now(),
  unique(liga_id, user_id)
);

alter table public.liga_miembros enable row level security;
create policy "Ver miembros" on public.liga_miembros for select using (true);
create policy "Unirse a liga" on public.liga_miembros for insert with check (auth.uid() = user_id);
create policy "Salir de liga" on public.liga_miembros for delete using (auth.uid() = user_id);

-- ============================================================
--  6. CHAT DE LIGAS
-- ============================================================
create table public.liga_chat (
  id          bigserial primary key,
  liga_id     uuid references public.ligas(id) on delete cascade,
  user_id     uuid references public.perfiles(id) on delete cascade,
  mensaje     text not null check (char_length(mensaje) <= 500),
  created_at  timestamptz default now()
);

alter table public.liga_chat enable row level security;
create policy "Ver chat de liga" on public.liga_chat
  for select using (
    exists (select 1 from public.liga_miembros where liga_id = liga_chat.liga_id and user_id = auth.uid())
  );
create policy "Enviar mensaje" on public.liga_chat
  for insert with check (
    auth.uid() = user_id and
    exists (select 1 from public.liga_miembros where liga_id = liga_chat.liga_id and user_id = auth.uid())
  );

-- ============================================================
--  7. PARTIDOS PERSONALES (ir al estadio)
-- ============================================================
create table public.partidos (
  id          bigserial primary key,
  user_id     uuid references public.perfiles(id) on delete cascade,
  fecha       date not null,
  rival       text not null,
  estadio     text not null,
  resultado   text check (resultado in ('ganó','empató','perdió')),
  goles       text,          -- "2-1"
  nota        text,
  created_at  timestamptz default now()
);

alter table public.partidos enable row level security;
create policy "Ver propios partidos" on public.partidos for select using (auth.uid() = user_id);
create policy "Insertar propio partido" on public.partidos for insert with check (auth.uid() = user_id);
create policy "Eliminar propio partido" on public.partidos for delete using (auth.uid() = user_id);

-- ============================================================
--  8. DATOS INICIALES — Resultado demo jornada 12
--  (El admin ingresa los resultados reales aquí cada semana)
-- ============================================================
insert into public.resultados_jornadas (jornada, resultados, marcadores, revelado) values
(12,
  '{"f1":"1","f2":"1","f3":"x","f4":"1","f5":"2","f6":"1","f7":"x","f8":"1"}',
  '{"f1":"1-0","f2":"2-1","f3":"0-0","f4":"3-0","f5":"0-1","f6":"2-0","f7":"1-1","f8":"2-0"}',
  true
),
(11,
  '{"f1":"2","f2":"1","f3":"1","f4":"x","f5":"1","f6":"2","f7":"1","f8":"x"}',
  '{"f1":"0-2","f2":"3-1","f3":"1-0","f4":"1-1","f5":"2-0","f6":"0-1","f7":"2-1","f8":"2-2"}',
  true
);

-- ============================================================
--  LISTO ✓
--  Recuerda actualizar cada semana:
--  1. Insertar resultados de jornada terminada aquí
--  2. Actualizar JORNADA_ACTUAL y FIXTURE_ACTUAL en config.js y api.js
-- ============================================================
