-- ================================================================
-- FamilyHealth — Esquema de Base de Datos
-- Stack: Supabase (PostgreSQL) con Row Level Security (RLS)
-- ================================================================

-- ----------------------------------------------------------------
-- EXTENSIONES
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLA: profiles
-- ================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  height_cm NUMERIC(5,1) NOT NULL CHECK (height_cm >= 50.0 AND height_cm <= 200.0),
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('masculino', 'femenino')),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentarios de tabla y columnas
COMMENT ON TABLE  public.profiles IS 'Perfiles extendidos de los usuarios del grupo familiar.';
COMMENT ON COLUMN public.profiles.height_cm IS 'Altura en cm. Rango permitido: 50cm a 200cm.';
COMMENT ON COLUMN public.profiles.gender IS 'Sexo biológico para cálculos metabólicos (masculino/femenino).';
COMMENT ON COLUMN public.profiles.is_public IS 'Control de privacidad: Si es TRUE, el resto de la familia puede ver sus pesajes.';

-- ================================================================
-- TABLA: measurements (Límites Hardware Philco BAP2021PI e imposiciones lógicas)
-- ================================================================
CREATE TABLE public.measurements (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  measured_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Mapeo Philco BAP2021PI
  weight_kg         NUMERIC(5,2) NOT NULL CHECK (weight_kg >= 2.00 AND weight_kg <= 180.00),
  body_fat_pct      NUMERIC(5,2) CHECK (body_fat_pct >= 0.00 AND body_fat_pct <= 100.00),
  body_water_pct    NUMERIC(5,2) CHECK (body_water_pct >= 0.00 AND body_water_pct <= 100.00),
  muscle_mass_pct   NUMERIC(5,2) CHECK (muscle_mass_pct >= 0.00 AND muscle_mass_pct <= 100.00),
  bone_mass_pct     NUMERIC(5,2) CHECK (bone_mass_pct >= 0.00 AND bone_mass_pct <= 100.00),
  recommended_kcal  SMALLINT     CHECK (recommended_kcal >= 500 AND recommended_kcal <= 10000),
  bmi               NUMERIC(5,2) CHECK (bmi >= 10.00 AND bmi <= 90.00),

  notes             TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Comentarios de tabla y columnas
COMMENT ON TABLE public.measurements IS 'Registros biométricos obtenidos de la balanza Philco BAP2021PI.';
COMMENT ON COLUMN public.measurements.weight_kg IS 'Peso corporal en kg. Límite del sensor: 2kg - 180kg.';
COMMENT ON COLUMN public.measurements.body_fat_pct IS 'Porcentaje de grasa corporal (Indicador FAT en pantalla).';
COMMENT ON COLUMN public.measurements.body_water_pct IS 'Porcentaje de agua corporal total (Indicador TBW en pantalla).';
COMMENT ON COLUMN public.measurements.muscle_mass_pct IS 'Porcentaje de masa muscular (Icono de músculo).';
COMMENT ON COLUMN public.measurements.bone_mass_pct IS 'Masa ósea estimada en porcentaje (Icono de hueso).';
COMMENT ON COLUMN public.measurements.recommended_kcal IS 'Ingesta calórica diaria recomendada por la balanza (KCAL).';
COMMENT ON COLUMN public.measurements.bmi IS 'Índice de Masa Corporal calculado por la balanza (BMI).';

-- ================================================================
-- ÍNDICES, FUNCIONES Y TRIGGERS
-- ================================================================

-- Índices
CREATE INDEX idx_measurements_user_id ON public.measurements(user_id);
CREATE INDEX idx_measurements_user_date ON public.measurements(user_id, measured_at DESC);

-- Actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-crear perfil (Ajustado con valores por defecto válidos)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- Políticas Profiles
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR is_public = TRUE);

CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = id);

-- Políticas Measurements
CREATE POLICY "measurements_select_policy" ON public.measurements FOR SELECT TO authenticated 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = measurements.user_id AND p.is_public = TRUE
));

CREATE POLICY "measurements_insert_policy" ON public.measurements FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "measurements_update_policy" ON public.measurements FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "measurements_delete_policy" ON public.measurements FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ================================================================
-- VISTA: Dashboard de Últimas Mediciones
-- ================================================================
CREATE OR REPLACE VIEW public.latest_measurements AS
SELECT DISTINCT ON (m.user_id)
  m.*, p.full_name, p.is_public
FROM public.measurements m
JOIN public.profiles p ON p.id = m.user_id
ORDER BY m.user_id, m.measured_at DESC;

COMMENT ON VIEW public.latest_measurements IS 'Dashboard: Devuelve exclusivamente el último pesaje de cada usuario.';