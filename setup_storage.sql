-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard/project/upuimmozwczajuxnsgoi/sql)
-- Esto crea el bucket de Storage para imagenes de editoriales

-- 1. Crear bucket publico
INSERT INTO storage.buckets (id, name, public)
VALUES ('editorial-images', 'editorial-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politica: cualquiera puede ver las imagenes
CREATE POLICY "Public read editorial images" ON storage.objects
FOR SELECT USING (bucket_id = 'editorial-images');

-- 3. Politica: usuarios autenticados pueden subir imagenes
CREATE POLICY "Authenticated upload editorial images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'editorial-images');
