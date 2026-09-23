-- =============================================================================
-- Chatwoot agent tracking on organizations
-- =============================================================================
-- El tenant necesita ser un AGENTE en Chatwoot (no solo un contacto de soporte)
-- para poder usar la bandeja de atención como operador.
--
-- chatwoot_agent_id      — ID numérico del agente creado en Chatwoot
-- chatwoot_onboarding_done — true cuando el tenant completó el onboarding nativo
--
-- Nota: chatwoot_contact_id y chatwoot_conversation_id se mantienen para
-- tracking interno de soporte (el tenant como cliente de SmarterOS).
-- Son conceptos distintos:
--   contact/conversation = el tenant como cliente recibiendo soporte
--   agent_id             = el tenant como operador usando la bandeja
-- =============================================================================

alter table organizations
  add column if not exists chatwoot_agent_id         bigint,
  add column if not exists chatwoot_onboarding_done  boolean not null default false;

comment on column organizations.chatwoot_agent_id
  is 'ID del agente Chatwoot del owner del tenant — permite acceso operativo a la bandeja';

comment on column organizations.chatwoot_onboarding_done
  is 'true cuando el tenant completó el onboarding nativo de Chatwoot (/app/accounts/{id}/onboarding)';
