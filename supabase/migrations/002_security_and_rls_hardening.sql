-- Fix: Establecer search_path explícito en public.handle_updated_at
-- Motivo: Advertencia de lint en Supabase (search_path mutable).
-- Objetivo: Evitar resolución inesperada de objetos y posibles riesgos de seguridad.
-- Este cambio no modifica la lógica del negocio, solo refuerza la seguridad.

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger to be safe (drops if exists)
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------

-- Fix: search_path explícito en función SECURITY DEFINER
-- Motivo: Advertencia de Supabase por search_path mutable.
-- Objetivo: Evitar riesgos de resolución de esquema y reforzar seguridad.

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, height_cm, birth_date, gender)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    170.0,
    '1990-01-01',
    'masculino'
  );
  RETURN NEW;
END;
$$;

-- Recreate trigger to be safe (drops if exists)
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------

-- Fix: Recrear la vista con security_invoker = true
-- Motivo: Advertencia de lint "Security Definer View". Por defecto, las vistas pueden ignorar RLS.
-- Objetivo: Garantizar que las políticas RLS de las tablas base (profiles/measurements) 
-- se apliquen al usuario que realiza la consulta.

-- Drop if exists to apply new properties
DROP VIEW IF EXISTS public.latest_measurements;

-- Create view with security_invoker configuration
CREATE OR REPLACE VIEW public.latest_measurements 
WITH (security_invoker = true) 
AS
SELECT DISTINCT ON (m.user_id)
  m.*, 
  p.full_name, 
  p.is_public
FROM public.measurements m
JOIN public.profiles p ON p.id = m.user_id
ORDER BY m.user_id, m.measured_at DESC;

-- Restore comment
COMMENT ON VIEW public.latest_measurements IS 'Dashboard: Devuelve exclusivamente el último pesaje de cada usuario respetando RLS.';

--------------------------------------------------------------------------

-- Fix: Optimizar rendimiento de RLS usando subconsultas escalares
-- Motivo: Advertencia "Auth RLS Initialization Plan". Evita re-evaluar auth.uid() por cada fila.
-- Objetivo: Mejorar la velocidad de respuesta en tablas con muchos registros.

-- Redefinir políticas de PROFILES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id OR is_public = TRUE);

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = id);

--------------------------------------------------------------------------

-- Fix: Optimización de rendimiento en políticas de mediciones
-- Motivo: El linter detectó llamadas directas a funciones de Auth que degradan el rendimiento.
-- Nota: Se aplica (SELECT auth.uid()) para cachear el ID del usuario durante la ejecución.

-- Redefinir políticas de MEASUREMENTS
DROP POLICY IF EXISTS "measurements_select_policy" ON public.measurements;
CREATE POLICY "measurements_select_policy" ON public.measurements FOR SELECT TO authenticated 
USING ((SELECT auth.uid()) = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = measurements.user_id AND p.is_public = TRUE
));

DROP POLICY IF EXISTS "measurements_insert_policy" ON public.measurements;
CREATE POLICY "measurements_insert_policy" ON public.measurements FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "measurements_update_policy" ON public.measurements;
CREATE POLICY "measurements_update_policy" ON public.measurements FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "measurements_delete_policy" ON public.measurements;
CREATE POLICY "measurements_delete_policy" ON public.measurements FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);