-- =============================================================================
-- SmarterOS / Smarter-CRM — SUPABASE COMERCIAL (FASE 1, base)
-- -----------------------------------------------------------------------------
-- Proposito: crear la tabla raiz `public.organizations` del plano comercial
-- (SIGNUP -> TENANT -> PROVISIONING) en el nuevo proyecto Supabase comercial.
--
-- NOTA DE ARQUITECTURA:
--   * `organizations` = modelo comercial de Smarter-CRM (1 fila por owner).
--     Hoy NO existe una tabla `workspaces` en el codigo: `organizations`
--     cumple ese rol (cookie `smarterbot_workspace`, sesion WAHA `workspace_*`).
--     Si en el futuro el codigo introduce `workspaces`, se agrega ahi.
--   * `tenants`/`task_queue`/`conversations`... pertenecen a SmarterMCP
--     (Supabase `rjfc...`, historico/orquestacion). Se mantienen SEPARADOS:
--     NO fusionar ni apuntar este proyecto hacia esa base.
--
-- ORDEN DE APLICACION (proyecto nuevo):
--   1. este archivo (20260610..._commercial_organizations.sql)  -> CREATE TABLE
--   2. 20260614000000_bootstrap_workspace_state.sql             -> columnas de
--      estado (bootstrap/chatwoot/waha/trial/plan), checks e indices unicos.
--
-- ACCESO:
--   * `service_role` (server-only, usado por lib/supabase-service.ts) : full,
--     bypass de RLS.
--   * `anon` (publishable/anon key)                                   : NADA
--     (RLS habilitada, sin policies para anon).
--   * `authenticated` (futuro dashboard con sesion Supabase Auth)     : solo
--     leer/actualizar su propia fila (owner).
-- =============================================================================

create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  name       text,
  created_at timestamptz not null default now()
);

comment on table public.organizations is
  'Tenant comercial de Smarter-CRM: 1 fila por owner (auth.users). Las columnas '
  'de provisioning (bootstrap_status, chatwoot_*, waha_*, trial_*, plan_status) '
  'se agregan en 20260614000000_bootstrap_workspace_state.sql.';

-- -----------------------------------------------------------------------------
-- RLS: habilitada desde el dia 1 (evitar el RLS debil detectado en rjfc...).
-- -----------------------------------------------------------------------------
alter table public.organizations enable row level security;

drop policy if exists "organizations_select_owner" on public.organizations;
create policy "organizations_select_owner"
  on public.organizations
  for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "organizations_update_owner" on public.organizations;
create policy "organizations_update_owner"
  on public.organizations
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Grants estandar de Supabase (sin policies para anon -> RLS deniega todo).
grant select, insert, update, delete on table public.organizations
  to anon, authenticated, service_role;
