-- ================================================================
-- MIGRACIÓN 005: Agregar nivel de actividad física
-- Objetivo: Registrar el nivel de actividad (AC-1 a AC-6) que se
--           configura en la balanza para cálculos metabólicos precisos
-- ================================================================

-- Agregar columna activity_level a profiles
ALTER TABLE public.profiles
ADD COLUMN activity_level SMALLINT NOT NULL DEFAULT 1
CHECK (activity_level >= 1 AND activity_level <= 6);

-- Comentario descriptivo
COMMENT ON COLUMN public.profiles.activity_level IS 
'Nivel de actividad física para cálculos de la balanza.
AC-1: Sedentario
AC-2: Ligeramente activo (1-3 días/semana)
AC-3: Moderadamente activo (3-5 días/semana)
AC-4: Muy activo (6-7 días/semana)
AC-5: Extremadamente activo (ejercicio intenso + trabajo físico)
AC-6: Atleta profesional';

-- Actualizar trigger para incluir activity_level en el signup
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
    activity_level,
    is_public
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'height_cm')::numeric, 170.0),
    COALESCE((NEW.raw_user_meta_data->>'birth_date')::date, '1990-01-01'::date),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'masculino'),
    COALESCE((NEW.raw_user_meta_data->>'activity_level')::smallint, 1),
    COALESCE((NEW.raw_user_meta_data->>'is_public')::boolean, false)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();