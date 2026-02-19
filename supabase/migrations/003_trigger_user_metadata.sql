-- ================================================================
-- MIGRACIÓN 003: Trigger robusto con user_metadata
-- Objetivo: Eliminar race condition en signup creando el perfil
--           completo desde el trigger usando datos de user_metadata
-- Cumplimiento: search_path explícito (security hardening)
-- ================================================================

-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recrear función con user_metadata support y search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    height_cm,
    birth_date,
    gender,
    is_public
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'height_cm')::numeric, 170.0),
    COALESCE((NEW.raw_user_meta_data->>'birth_date')::date, '1990-01-01'::date),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'masculino'),
    COALESCE((NEW.raw_user_meta_data->>'is_public')::boolean, false)
  );
  
  RETURN NEW;
END;
$$;

-- Recrear trigger
CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();