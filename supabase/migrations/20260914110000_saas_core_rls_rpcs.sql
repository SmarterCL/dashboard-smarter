-- =============================================================================
-- FASE 1 — SAAS CORE (seguridad): RLS multi-tenant + RPCs security definer
-- -----------------------------------------------------------------------------
--   * Helpers de autorización en schema `private` (NO expuesto por la Data API).
--   * Policies membership-based: `TO authenticated` + predicado (sin BOLA/IDOR).
--   * `(select auth.uid())` en policies: se evalúa 1 vez por query (perf RLS).
--   * RPCs SECURITY DEFINER con search_path = '' y auth.uid() validado.
-- Idempotente. Reversible: ver bloque ROLLBACK al final.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Schema privado + helpers de membership
-- -----------------------------------------------------------------------------
create schema if not exists private;

create or replace function private.member_role(p_org uuid)
returns text
language sql
stable
security definer set search_path = ''
as $$
  select m.role
  from public.memberships m
  where m.org_id = p_org
    and m.user_id = (select auth.uid())
$$;

create or replace function private.has_role(p_org uuid, p_roles text[])
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = p_org
      and m.user_id = (select auth.uid())
      and m.role = any (p_roles)
  )
$$;

revoke execute on function private.member_role(uuid), private.has_role(uuid, text[])
  from public, anon;
grant execute on function private.member_role(uuid), private.has_role(uuid, text[])
  to authenticated, service_role;
grant usage on schema private to authenticated, service_role;
revoke all on schema private from anon;

-- -----------------------------------------------------------------------------
-- 2) RLS: organizations (reemplaza policies owner-only de la FASE previa)
-- -----------------------------------------------------------------------------
alter table public.organizations enable row level security;

drop policy if exists "organizations_select_owner" on public.organizations;
drop policy if exists "organizations_update_owner" on public.organizations;
drop policy if exists "organizations_select_member" on public.organizations;
drop policy if exists "organizations_update_admin" on public.organizations;
drop policy if exists "organizations_insert_owner" on public.organizations;

create policy "organizations_select_member"
  on public.organizations
  for select to authenticated
  using ((select private.has_role(id, '{owner,admin,agent,viewer}')));

create policy "organizations_update_admin"
  on public.organizations
  for update to authenticated
  using ((select private.has_role(id, '{owner,admin}')))
  with check ((select private.has_role(id, '{owner,admin}')));

-- Inserción directa: solo el owner declarado (el RPC de producto es el flujo
-- recomendado; el trigger le crea la membership owner).
create policy "organizations_insert_owner"
  on public.organizations
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

-- -----------------------------------------------------------------------------
-- 3) RLS: memberships
-- -----------------------------------------------------------------------------
alter table public.memberships enable row level security;

create policy "memberships_select_org_or_self"
  on public.memberships
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (select private.has_role(org_id, '{owner,admin,agent,viewer}'))
  );

create policy "memberships_insert_admin"
  on public.memberships
  for insert to authenticated
  with check (
    (select private.has_role(org_id, '{owner,admin}'))
    and role <> 'owner' -- el rol owner solo nace del trigger/RPC
  );

create policy "memberships_update_owner"
  on public.memberships
  for update to authenticated
  using ((select private.has_role(org_id, '{owner}')))
  with check ((select private.has_role(org_id, '{owner}')) and role <> 'owner');

create policy "memberships_delete_owner_or_self"
  on public.memberships
  for delete to authenticated
  using (
    (select private.has_role(org_id, '{owner}'))
    or ((select auth.uid()) = user_id and role <> 'owner') -- salirse one mismo
  );

-- -----------------------------------------------------------------------------
-- 4) RLS: invitations (gestión owner/admin; aceptar es vía RPC)
-- -----------------------------------------------------------------------------
alter table public.invitations enable row level security;

create policy "invitations_select_admin"
  on public.invitations
  for select to authenticated
  using ((select private.has_role(org_id, '{owner,admin}')));

create policy "invitations_insert_admin"
  on public.invitations
  for insert to authenticated
  with check ((select private.has_role(org_id, '{owner,admin}')));

create policy "invitations_update_admin"
  on public.invitations
  for update to authenticated
  using ((select private.has_role(org_id, '{owner,admin}')))
  with check ((select private.has_role(org_id, '{owner,admin}')));

create policy "invitations_delete_admin"
  on public.invitations
  for delete to authenticated
  using ((select private.has_role(org_id, '{owner,admin}')));

-- -----------------------------------------------------------------------------
-- 5) RLS: plans (catálogo público de lectura; solo planes activos)
-- -----------------------------------------------------------------------------
alter table public.plans enable row level security;

create policy "plans_select_public"
  on public.plans
  for select to anon, authenticated
  using (is_active);

-- -----------------------------------------------------------------------------
-- 6) RPCs de producto (security definer, search_path fijado, auth.uid() explícito)
-- -----------------------------------------------------------------------------
create or replace function public.slugify(p_text text)
returns text
language plpgsql
immutable
as $$
declare
  s text;
begin
  s := lower(coalesce(p_text, ''));
  s := translate(s, 'áàäâãéèëêíìïîóòöôõúùüûñç', 'aaaaaeeeeiiiiooooouuuunc');
  s := regexp_replace(s, '-{2,}', '-', 'g');
  s := btrim(regexp_replace(s, '[^a-z0-9]+', '-', 'g'), '-');
  return nullif(s, '');
end;
$$;

-- 6a) El usuario autenticado crea su organización (trial 7 días, plan trial).
--     El trigger organizations_owner_membership crea la membership owner.
create or replace function public.create_my_organization(p_name text)
returns public.organizations
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_base text;
  v_org public.organizations;
  v_attempts int := 0;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  if p_name is null or length(btrim(p_name)) < 2 then
    raise exception 'invalid_organization_name';
  end if;

  -- Regla de producto FASE 1: 1 organización owner por usuario.
  if exists (
    select 1 from public.memberships m
    where m.user_id = v_user and m.role = 'owner'
  ) then
    raise exception 'owner_org_limit';
  end if;

  v_base := left(coalesce(public.slugify(p_name), 'org'), 30);

  loop
    v_attempts := v_attempts + 1;
    begin
      insert into public.organizations (
        owner_id, name, slug, plan_slug, billing_status,
        trial_started_at, trial_ends_at
      )
      values (
        v_user,
        btrim(p_name),
        v_base || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
        'trial',
        'trial',
        now(),
        now() + interval '7 days'
      )
      returning * into v_org;
      exit;
    exception
      when unique_violation then
        if v_attempts >= 5 then
          raise;
        end if;
        continue;
    end;
  end loop;

  return v_org;
end;
$$;

-- 6b) Aceptar invitación: intercambia el token (solo por email) por membership.
create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_email text;
  v_inv public.invitations;
  v_limit int;
  v_members int;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select email into v_email from auth.users where id = v_user;
  if v_email is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_inv
  from public.invitations
  where token_hash = encode(sha256(p_token::bytea), 'hex')
    and accepted_at is null
    and expires_at > now()
  for update;

  if v_inv.id is null then
    raise exception 'invitation_invalid_or_expired';
  end if;

  if lower(v_email) <> lower(v_inv.email) then
    raise exception 'invitation_email_mismatch';
  end if;

  -- Límite de plan (si el plan define max_members)
  select (pl.limits ->> 'max_members')::int into v_limit
  from public.organizations o
  join public.plans pl on pl.slug = o.plan_slug
  where o.id = v_inv.org_id;

  select count(*) into v_members from public.memberships where org_id = v_inv.org_id;

  if v_limit is not null and v_members >= v_limit then
    raise exception 'plan_member_limit';
  end if;

  insert into public.memberships (org_id, user_id, role, invited_by)
  values (v_inv.org_id, v_user, v_inv.role, v_inv.invited_by)
  on conflict (org_id, user_id) do update set role = excluded.role;

  update public.invitations set accepted_at = now() where id = v_inv.id;

  return v_inv.org_id;
end;
$$;

revoke execute on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;
-- slugify y create_my_organization quedan con el grant PUBLIC por defecto
-- (create_my_organization valida auth.uid() internamente).

-- -----------------------------------------------------------------------------
-- 7) Grants estándar
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on table public.memberships to authenticated, service_role;
grant select, insert, update, delete on table public.invitations to authenticated, service_role;
grant select on table public.plans to anon, authenticated, service_role;

-- =============================================================================
-- ROLLBACK (reversible — ejecutar solo si hay que revertir FASE 1 seguridad):
--
-- revoke execute on function public.accept_invitation(text) from authenticated;
-- drop function if exists public.accept_invitation(text);
-- drop function if exists public.create_my_organization(text);
-- drop function if exists public.slugify(text);
-- drop policy if exists "plans_select_public" on public.plans;
-- drop policy if exists "invitations_delete_admin" on public.invitations;
-- drop policy if exists "invitations_update_admin" on public.invitations;
-- drop policy if exists "invitations_insert_admin" on public.invitations;
-- drop policy if exists "invitations_select_admin" on public.invitations;
-- drop policy if exists "memberships_delete_owner_or_self" on public.memberships;
-- drop policy if exists "memberships_update_owner" on public.memberships;
-- drop policy if exists "memberships_insert_admin" on public.memberships;
-- drop policy if exists "memberships_select_org_or_self" on public.memberships;
-- drop policy if exists "organizations_insert_owner" on public.organizations;
-- drop policy if exists "organizations_update_admin" on public.organizations;
-- drop policy if exists "organizations_select_member" on public.organizations;
-- recreate owner-only policies (ver migración 20260610000000);
-- drop table if exists private;  -- (borra helpers)
-- =============================================================================
