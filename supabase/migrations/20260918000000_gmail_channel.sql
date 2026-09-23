-- =============================================================================
-- Gmail channel columns on organizations
-- =============================================================================
-- Agrega soporte para el canal Gmail por tenant.
-- Los tokens OAuth se almacenan server-side únicamente; nunca se exponen
-- al cliente. El dashboard solo lee gmail_connected y gmail_email.
--
-- Columnas:
--   gmail_connected      boolean    — true cuando el tenant autorizó Gmail
--   gmail_email          text       — dirección Gmail autorizada (display only)
--   gmail_access_token   text       — access token (corta vida, renovar con refresh)
--   gmail_refresh_token  text       — refresh token (larga vida, renovar access)
--   gmail_token_expiry   timestamptz — cuándo expira el access_token actual
-- =============================================================================

alter table organizations
  add column if not exists gmail_connected    boolean      not null default false,
  add column if not exists gmail_email        text,
  add column if not exists gmail_access_token text,
  add column if not exists gmail_refresh_token text,
  add column if not exists gmail_token_expiry  timestamptz;

-- Comentarios descriptivos para el schema browser de Supabase
comment on column organizations.gmail_connected     is 'true cuando el tenant autorizó Gmail OAuth';
comment on column organizations.gmail_email         is 'Dirección Gmail autorizada — solo para display';
comment on column organizations.gmail_access_token  is 'OAuth2 access token — server-side only, nunca al cliente';
comment on column organizations.gmail_refresh_token is 'OAuth2 refresh token — server-side only, nunca al cliente';
comment on column organizations.gmail_token_expiry  is 'Timestamp de expiración del access_token actual';

-- Las políticas RLS existentes en organizations cubren estas columnas
-- automáticamente: SELECT para members, UPDATE solo para owner/admin.
-- No se necesitan políticas adicionales.
