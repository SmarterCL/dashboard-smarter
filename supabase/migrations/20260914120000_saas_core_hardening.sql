-- =============================================================================
-- FASE 1 — ENDURECIMIENTO (resultado de supabase db advisors, 2026-09-14)
-- -----------------------------------------------------------------------------
-- 1. search_path fijo en slugify y sync_plan_status (lint 0011).
-- 2. EXECUTE revocado donde la funcion no es superficie de producto:
--    handle_organization_created es solo trigger (lint 0029).
--    create_my_organization queda solo para authenticated (es la RPC de signup).
--    accept_invitation ya estaba revocada a anon; authenticated es intencional
--    (superficie para aceptar invitaciones) -> WARN documentado como aceptado.
--    rls_auto_enable es infraestructura de plataforma Supabase: no se toca.
-- Idempotente.
-- =============================================================================

-- 1) slugify con search_path vacio (funcion pura e immutable)
create or replace function public.slugify(p_text text)
returns text
language plpgsql
immutable
set search_path = ''
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

-- 2) sync_plan_status con search_path vacio (solo usa NEW/OLD)
create or replace function public.sync_plan_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.billing_status is distinct from old.billing_status then
    new.plan_status := new.billing_status;
  end if;
  return new;
end;
$$;

-- 3) Trigger functions: no son RPC. Nadie debe poder llamarlas via REST.
revoke all on function public.handle_organization_created()
  from public, anon, authenticated;

-- 4) RPC de signup: solo authenticated.
revoke execute on function public.create_my_organization(text)
  from public, anon;
