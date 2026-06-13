-- =============================================================
-- MIGRATION PATCH: Solo lo que falta (seguro, no duplica nada)
-- Tablas existentes: plan, product, crm_pipeline, lead_source,
--   coupon, customer, deal, proposal, subscription, payment
-- Vistas existentes: 3 vistas, funnel_kpi() RPC
-- =============================================================

-- 1. organizations (no existe, se crea)
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    billing_email text,
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. organization_members (no existe, se crea)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- 3. deal_notes (no existe, apunta a tabla "deal" correcta)
CREATE TABLE IF NOT EXISTS public.deal_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id uuid REFERENCES public.deal(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. Añadir organization_id a tablas existentes (IF NOT EXISTS para no duplicar)
ALTER TABLE public.customer     ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.deal         ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Tablas ya mencionadas en código (clients, calendar_events, whatsapp_messages)
-- Añadir solo si existen, ignorar error si no:
ALTER TABLE IF EXISTS public.clients           ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.calendar_events   ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.whatsapp_messages ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 5. Organización por defecto para no romper data existente
DO $$
DECLARE
    default_org_id uuid;
BEGIN
    SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'smarteros-default' LIMIT 1;
    IF default_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug)
        VALUES ('SmarterOS Default', 'smarteros-default')
        RETURNING id INTO default_org_id;
    END IF;
    -- Asignar data existente sin organización a la org por defecto
    UPDATE public.customer     SET organization_id = default_org_id WHERE organization_id IS NULL;
    UPDATE public.deal         SET organization_id = default_org_id WHERE organization_id IS NULL;
    UPDATE public.subscription SET organization_id = default_org_id WHERE organization_id IS NULL;
END $$;
