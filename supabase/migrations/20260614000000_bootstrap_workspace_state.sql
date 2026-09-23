alter table public.organizations
  add column if not exists bootstrap_status text not null default 'pending',
  add column if not exists chatwoot_contact_id bigint,
  add column if not exists chatwoot_conversation_id bigint,
  add column if not exists chatwoot_status text not null default 'pending',
  add column if not exists waha_session_id text,
  add column if not exists waha_status text not null default 'pending',
  add column if not exists waha_qr_status text not null default 'pending',
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists plan_status text not null default 'trial';

alter table public.organizations
  add constraint organizations_bootstrap_status_check
    check (bootstrap_status in ('pending', 'ready', 'failed')),
  add constraint organizations_chatwoot_status_check
    check (chatwoot_status in ('pending', 'ready', 'failed')),
  add constraint organizations_waha_status_check
    check (waha_status in ('pending', 'ready', 'failed')),
  add constraint organizations_waha_qr_status_check
    check (waha_qr_status in ('pending', 'ready', 'failed')),
  add constraint organizations_plan_status_check
    check (plan_status in ('trial', 'active', 'past_due', 'expired', 'canceled'));

create unique index if not exists organizations_owner_id_unique
  on public.organizations (owner_id);

create unique index if not exists organizations_waha_session_id_unique
  on public.organizations (waha_session_id)
  where waha_session_id is not null;
