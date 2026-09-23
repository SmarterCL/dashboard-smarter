-- =============================================================================
-- FASE 1 — SAAS CORE (schema): plans, memberships, invitations, slug, billing
-- -----------------------------------------------------------------------------
-- Decisiones de diseño (FASE 1, producción controlada):
--   * `organizations.id` (UUID) es el TENANT_ID canónico para todo el sistema
--     (app, n8n, Hermes, SmarterMCP). Nunca usar el slug como id técnico.
--   * `organizations.slug` es SOLO identificador comercial/URL.
--   * Compatibilidad: `plan_status` se mantiene y se sincroniza con
--     `billing_status` vía trigger hasta migrar el código por completo.
--   * Roles: owner | admin | agent | viewer (mismo set que WACRM).
-- Idempotente: seguro de re-ejecutar. Reversible: ver bloque ROLLBACK al final.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) organizations: columnas comerciales (slug, plan, billing, localización)
-- -----------------------------------------------------------------------------
alter table public.organizations
  add column if not exists slug text,
  add column if not exists plan_slug text not null default 'trial',
  add column if not exists billing_status text not null default 'trial',
  add column if not exists billing_provider text,
  add column if not exists billing_external_id text,
  add column if not exists current_period_end timestamptz,
  add column if not exists country text not null default 'CL',
  add column if not exists currency text not null default 'CLP',
  add column if not exists timezone text not null default 'America/Santiago',
  add column if not exists locale text not null default 'es';

-- slug: identificador comercial/URL (NO es el tenant_id técnico).
alter table public.organizations
  drop constraint if exists organizations_slug_format_check;
alter table public.organizations
  add constraint organizations_slug_format_check
    check (slug is null or slug ~ '^[a-z0-9][a-z0-9-]{1,38}$');

create unique index if not exists organizations_slug_unique
  on public.organizations (slug) where slug is not null;

-- billing_status: nueva fuente de verdad comercial (mismos valores de plan_status)
alter table public.organizations
  drop constraint if exists organizations_billing_status_check;
alter table public.organizations
  add constraint organizations_billing_status_check
    check (billing_status in ('trial', 'active', 'past_due', 'expired', 'canceled'));

-- -----------------------------------------------------------------------------
-- 2) plans: catálogo con precios CLP y límites por plan
-- -----------------------------------------------------------------------------
create table if not exists public.plans (
  slug       text primary key,
  name       text not null,
  price_clp  bigint not null default 0,
  currency   text not null default 'CLP',
  limits     jsonb not null default '{}'::jsonb,
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.plans (slug, name, price_clp, limits, sort_order) values
  ('trial',   'Prueba gratis', 0,
   '{"max_members":1,"max_whatsapp_numbers":1,"max_contacts":100,"automations":false}', 0),
  ('starter', 'Starter', 29990,
   '{"max_members":3,"max_whatsapp_numbers":1,"max_contacts":2000,"automations":true}', 1),
  ('pro',     'Pro',     79990,
   '{"max_members":10,"max_whatsapp_numbers":2,"max_contacts":20000,"automations":true}', 2)
on conflict (slug) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'organizations_plan_slug_fk'
      and conrelid = 'public.organizations'::regclass
  ) then
    alter table public.organizations
      add constraint organizations_plan_slug_fk
        foreign key (plan_slug) references public.plans (slug);
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3) memberships: usuario ↔ organización (rol ÚNICO, fuente de autorización)
-- -----------------------------------------------------------------------------
create table if not exists public.memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null,
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint memberships_role_check check (role in ('owner', 'admin', 'agent', 'viewer'))
);

create unique index if not exists memberships_org_user_unique
  on public.memberships (org_id, user_id);
create index if not exists memberships_user_id_idx
  on public.memberships (user_id);
-- exactamente un owner por organización:
create unique index if not exists memberships_one_owner_per_org
  on public.memberships (org_id) where role = 'owner';

-- -----------------------------------------------------------------------------
-- 4) invitations: invitaciones por email (token hasheado; el token viaja solo
--    por email, nunca en la base)
-- -----------------------------------------------------------------------------
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  email       text not null,
  role        text not null default 'agent',
  token_hash  text not null unique, -- sha256 hex del token
  invited_by  uuid references auth.users (id) on delete set null,
  expires_at  timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at  timestamptz not null default now(),
  constraint invitations_role_check check (role in ('admin', 'agent', 'viewer'))
);

create index if not exists invitations_org_id_idx on public.invitations (org_id);

-- -----------------------------------------------------------------------------
-- 5) Triggers
-- -----------------------------------------------------------------------------
-- 5a) Al crear una organización, su owner obtiene membership 'owner' automática.
create or replace function public.handle_organization_created()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.memberships (org_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (org_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists organizations_owner_membership on public.organizations;
create trigger organizations_owner_membership
  after insert on public.organizations
  for each row execute function public.handle_organization_created();

-- 5b) Compatibilidad transición: plan_status se mantiene sincronizado con
--     billing_status (se elimina en una migración futura junto con plan_status).
create or replace function public.sync_plan_status()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.billing_status is distinct from old.billing_status then
    new.plan_status := new.billing_status;
  end if;
  return new;
end;
$$;

drop trigger if exists organizations_sync_plan_status on public.organizations;
create trigger organizations_sync_plan_status
  before insert or update of billing_status on public.organizations
  for each row execute function public.sync_plan_status();

-- -----------------------------------------------------------------------------
-- 6) Backfill idempotente para organizaciones existentes
-- -----------------------------------------------------------------------------
-- 6a) slug para organizaciones creadas antes de FASE 1.
update public.organizations
set slug = 'org-' || substr(replace(id::text, '-', ''), 1, 12)
where slug is null;

-- 6b) membership owner para organizaciones creadas antes del trigger.
insert into public.memberships (org_id, user_id, role)
select o.id, o.owner_id, 'owner'
from public.organizations o
on conflict (org_id, user_id) do nothing;

-- =============================================================================
-- ROLLBACK (reversible — ejecutar solo si hay que revertir FASE 1 schema):
--
-- drop trigger if exists organizations_sync_plan_status on public.organizations;
-- drop function if exists public.sync_plan_status();
-- drop trigger if exists organizations_owner_membership on public.organizations;
-- drop function if exists public.handle_organization_created();
-- drop table if exists public.invitations;
-- drop table if exists public.memberships;
-- alter table public.organizations drop constraint if exists organizations_plan_slug_fk;
-- drop table if exists public.plans;
-- alter table public.organizations
--   drop constraint if exists organizations_billing_status_check,
--   drop constraint if exists organizations_slug_format_check,
--   drop column if exists slug,
--   drop column if exists plan_slug,
--   drop column if exists billing_status,
--   drop column if exists billing_provider,
--   drop column if exists billing_external_id,
--   drop column if exists current_period_end,
--   drop column if exists country,
--   drop column if exists currency,
--   drop column if exists timezone,
--   drop column if exists locale;
-- (plan_status conserva su CHECK original y los datos, no se toca)
-- =============================================================================
