-- Ejecutar en Supabase SQL Editor
-- https://supabase.com/dashboard/project/upuimmozwczajuxnsgoi/sql
-- Tabla para almacenar resultados de partidos (admin los ingresa manualmente)

-- 1. Crear tabla de resultados
CREATE TABLE IF NOT EXISTS resultados (
    id SERIAL PRIMARY KEY,
    jornada INTEGER NOT NULL,
    fecha DATE,
    local VARCHAR(5) NOT NULL,
    visitante VARCHAR(5) NOT NULL,
    gl INTEGER NOT NULL DEFAULT 0,
    gv INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(jornada, local, visitante)
);

-- 2. Crear tabla de configuracion (jornada activa del prode, etc)
CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Insertar configuracion inicial
INSERT INTO config (key, value) VALUES ('current_jornada', '11') ON CONFLICT (key) DO NOTHING;

-- 4. RLS para resultados: todos leen, solo admin escribe
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer resultados
CREATE POLICY "Public read resultados" ON resultados FOR SELECT USING (true);

-- Solo admin puede insertar/actualizar/eliminar resultados
CREATE POLICY "Admin insert resultados" ON resultados FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = '68c8b022-d4c1-4b88-aec1-d334eb4980f7'::uuid);
CREATE POLICY "Admin update resultados" ON resultados FOR UPDATE
    TO authenticated USING (auth.uid() = '68c8b022-d4c1-4b88-aec1-d334eb4980f7'::uuid);
CREATE POLICY "Admin delete resultados" ON resultados FOR DELETE
    TO authenticated USING (auth.uid() = '68c8b022-d4c1-4b88-aec1-d334eb4980f7'::uuid);

-- Todos pueden leer config
CREATE POLICY "Public read config" ON config FOR SELECT USING (true);

-- Solo admin puede actualizar config
CREATE POLICY "Admin update config" ON config FOR UPDATE
    TO authenticated USING (auth.uid() = '68c8b022-d4c1-4b88-aec1-d334eb4980f7'::uuid);
CREATE POLICY "Admin insert config" ON config FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = '68c8b022-d4c1-4b88-aec1-d334eb4980f7'::uuid);

-- 5. Insertar resultados existentes (Fecha 1 a 10)
INSERT INTO resultados (jornada, fecha, local, visitante, gl, gv) VALUES
-- Jornada 1
(1, '2026-02-20', 'OVA', 'LDU', 1, 2),
(1, '2026-02-21', 'BSC', 'TEC', 1, 0),
(1, '2026-02-21', 'AUC', 'MUS', 1, 1),
(1, '2026-02-22', 'IDV', 'GCY', 2, 0),
(1, '2026-02-22', 'DLF', 'CUE', 1, 0),
(1, '2026-02-22', 'MAC', 'LDN', 0, 0),
(1, '2026-02-23', 'LIB', 'MAN', 1, 0),
(1, '2026-04-08', 'UCA', 'EME', 1, 1),
-- Jornada 2
(2, '2026-02-27', 'TEC', 'OVA', 1, 1),
(2, '2026-02-28', 'EME', 'DLF', 1, 1),
(2, '2026-02-28', 'GCY', 'AUC', 1, 1),
(2, '2026-02-28', 'LDN', 'LIB', 1, 1),
(2, '2026-03-01', 'CUE', 'BSC', 2, 1),
(2, '2026-03-01', 'MUS', 'UCA', 0, 0),
(2, '2026-03-01', 'LDU', 'MAC', 0, 2),
(2, '2026-03-02', 'MAN', 'IDV', 0, 2),
-- Jornada 3
(3, '2026-03-06', 'DLF', 'GCY', 1, 0),
(3, '2026-03-07', 'LIB', 'LDU', 2, 1),
(3, '2026-03-07', 'BSC', 'EME', 1, 0),
(3, '2026-03-07', 'IDV', 'MUS', 3, 1),
(3, '2026-03-08', 'UCA', 'LDN', 3, 0),
(3, '2026-03-08', 'MAC', 'TEC', 1, 1),
(3, '2026-03-08', 'AUC', 'CUE', 0, 1),
(3, '2026-03-09', 'OVA', 'MAN', 1, 1),
-- Jornada 4
(4, '2026-03-13', 'CUE', 'LDN', 1, 1),
(4, '2026-03-13', 'TEC', 'LIB', 2, 1),
(4, '2026-03-14', 'LDU', 'UCA', 1, 1),
(4, '2026-03-14', 'DLF', 'MAN', 0, 1),
(4, '2026-03-14', 'IDV', 'AUC', 2, 2),
(4, '2026-03-15', 'GCY', 'BSC', 0, 0),
(4, '2026-03-15', 'EME', 'OVA', 2, 1),
(4, '2026-03-15', 'MUS', 'MAC', 0, 0),
-- Jornada 5
(5, '2026-03-17', 'LDN', 'LDU', 0, 2),
(5, '2026-03-17', 'UCA', 'CUE', 1, 0),
(5, '2026-03-18', 'LIB', 'BSC', 0, 0),
(5, '2026-03-18', 'MAN', 'GCY', 0, 1),
(5, '2026-03-18', 'MAC', 'DLF', 1, 0),
(5, '2026-03-19', 'EME', 'IDV', 2, 0),
(5, '2026-03-19', 'OVA', 'MUS', 3, 2),
(5, '2026-03-19', 'AUC', 'TEC', 0, 1),
-- Jornada 6
(6, '2026-03-21', 'LDU', 'MAN', 1, 0),
(6, '2026-03-21', 'CUE', 'MAC', 1, 1),
(6, '2026-03-21', 'DLF', 'LIB', 0, 0),
(6, '2026-03-22', 'MUS', 'EME', 2, 0),
(6, '2026-03-22', 'BSC', 'UCA', 1, 1),
(6, '2026-03-22', 'TEC', 'IDV', 1, 2),
(6, '2026-03-23', 'AUC', 'OVA', 3, 2),
(6, '2026-03-23', 'GCY', 'LDN', 0, 0),
-- Jornada 7
(7, '2026-04-03', 'LDU', 'BSC', 0, 2),
(7, '2026-04-04', 'IDV', 'OVA', 2, 0),
(7, '2026-04-04', 'UCA', 'GCY', 4, 1),
(7, '2026-04-04', 'EME', 'CUE', 0, 2),
(7, '2026-04-05', 'LDN', 'DLF', 1, 0),
(7, '2026-04-05', 'MAN', 'TEC', 0, 2),
(7, '2026-04-05', 'MAC', 'AUC', 0, 1),
(7, '2026-04-06', 'LIB', 'MUS', 2, 2),
-- Jornada 8
(8, '2026-04-10', 'BSC', 'LDN', 2, 1),
(8, '2026-04-10', 'DLF', 'LDU', 1, 0),
(8, '2026-04-11', 'OVA', 'LIB', 2, 1),
(8, '2026-04-11', 'MUS', 'MAN', 1, 0),
(8, '2026-04-12', 'TEC', 'UCA', 0, 2),
(8, '2026-04-12', 'CUE', 'IDV', 2, 3),
(8, '2026-04-12', 'GCY', 'MAC', 2, 1),
(8, '2026-04-12', 'AUC', 'EME', 2, 0),
-- Jornada 9
(9, '2026-04-17', 'LDN', 'AUC', 0, 1),
(9, '2026-04-17', 'EME', 'GCY', 1, 3),
(9, '2026-04-18', 'MUS', 'TEC', 1, 0),
(9, '2026-04-18', 'UCA', 'LIB', 2, 0),
(9, '2026-04-18', 'OVA', 'DLF', 0, 0),
(9, '2026-04-19', 'MAN', 'CUE', 0, 1),
(9, '2026-04-19', 'IDV', 'LDU', 0, 2),
(9, '2026-04-19', 'MAC', 'BSC', 3, 1),
-- Jornada 10
(10, '2026-04-21', 'LIB', 'GCY', 0, 1),
(10, '2026-04-21', 'TEC', 'EME', 0, 1),
(10, '2026-04-22', 'LDN', 'MAN', 3, 0),
(10, '2026-04-22', 'DLF', 'IDV', 0, 1),
(10, '2026-04-22', 'CUE', 'OVA', 1, 3),
(10, '2026-04-22', 'BSC', 'MUS', 2, 1),
(10, '2026-04-22', 'LDU', 'AUC', 0, 0),
(10, '2026-04-23', 'UCA', 'MAC', 4, 0)
ON CONFLICT (jornada, local, visitante) DO UPDATE SET
    gl = EXCLUDED.gl, gv = EXCLUDED.gv, updated_at = now();
