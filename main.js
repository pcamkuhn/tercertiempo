/* ============================================
   TERCERTIEMPO - main.js
   LigaPro 2026 con API-Football en tiempo real
   ============================================ */

// ===== CONFIG =====
const SUPABASE_URL = 'https://upuimmozwczajuxnsgoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdWltbW96d2N6YWp1eG5zZ29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzEzMTQsImV4cCI6MjA5MTcwNzMxNH0.QKDmbwXSB5djbavS5T-U3z6aIxcw8akNwi4771Z0dF8';

// API-Football: Registrate gratis en api-football.com y pega tu key aqui
const API_KEY = 'fa1b04e74b165f014a4e8456bf2cbe50';
const API_BASE = 'https://v3.football.api-sports.io';
const LEAGUE_ID = 242;
const SEASON = 2026;
const CACHE_TTL = 30 * 60 * 1000; // 30 min cache

let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) { console.warn('Supabase not loaded'); }

// ===== 16 EQUIPOS LIGAPRO 2026 =====
const ESPN_LOGO = 'https://a.espncdn.com/i/teamlogos/soccer/500/';
const EQUIPOS = {
    'IDV': { nombre: 'Independiente del Valle', corto: 'IDV', color1: '#000', color2: '#D4A843', logo: ESPN_LOGO + '17086.png' },
    'UCA': { nombre: 'U. Catolica', corto: 'UCA', color1: '#003DA5', color2: '#FCD116', logo: ESPN_LOGO + '9283.png' },
    'BSC': { nombre: 'Barcelona SC', corto: 'BSC', color1: '#FFD700', color2: '#000', logo: ESPN_LOGO + '2686.png' },
    'AUC': { nombre: 'Aucas', corto: 'AUC', color1: '#FFD700', color2: '#C8102E', logo: ESPN_LOGO + '6017.png' },
    'CUE': { nombre: 'Dep. Cuenca', corto: 'CUE', color1: '#C8102E', color2: '#FFF', logo: ESPN_LOGO + '4812.png' },
    'TEC': { nombre: 'Tecnico U.', corto: 'TEC', color1: '#800020', color2: '#FFF', logo: ESPN_LOGO + '9292.png' },
    'DLF': { nombre: 'Delfin SC', corto: 'DLF', color1: '#003366', color2: '#87CEEB', logo: ESPN_LOGO + '1011.png' },
    'MUS': { nombre: 'Mushuc Runa', corto: 'MUS', color1: '#006400', color2: '#FFD700', logo: ESPN_LOGO + '17176.png' },
    'LDU': { nombre: 'Liga de Quito', corto: 'LDU', color1: '#FFF', color2: '#002776', logo: ESPN_LOGO + '4816.png' },
    'LIB': { nombre: 'Libertad FC', corto: 'LIB', color1: '#1C1C1C', color2: '#C8102E', logo: ESPN_LOGO + '21843.png' },
    'MAC': { nombre: 'Macara', corto: 'MAC', color1: '#003DA5', color2: '#FFF', logo: ESPN_LOGO + '18439.png' },
    'GCY': { nombre: 'Guayaquil City', corto: 'GCY', color1: '#4169E1', color2: '#FFD700', logo: ESPN_LOGO + '11124.png' },
    'OVA': { nombre: 'Orense SC', corto: 'OVA', color1: '#006400', color2: '#FFD700', logo: ESPN_LOGO + '20695.png' },
    'LDN': { nombre: 'Leones del Norte', corto: 'LDN', color1: '#8B0000', color2: '#FFD700', logo: ESPN_LOGO + '131702.png' },
    'EME': { nombre: 'Emelec', corto: 'EME', color1: '#003DA5', color2: '#6CACE4', logo: ESPN_LOGO + '2668.png' },
    'MAN': { nombre: 'Manta FC', corto: 'MAN', color1: '#1B5E20', color2: '#FFF', logo: ESPN_LOGO + '10307.png' }
};

// ===== DATOS FALLBACK — LigaPro 2026 Fecha 10 (23 Abril) =====
const FALLBACK_STANDINGS = [
    { id: 'UCA', pj: 10, g: 6, e: 4, p: 0, gf: 19, gc: 4 },
    { id: 'IDV', pj: 10, g: 7, e: 1, p: 2, gf: 17, gc: 10 },
    { id: 'BSC', pj: 10, g: 5, e: 3, p: 2, gf: 11, gc: 8 },
    { id: 'AUC', pj: 10, g: 3, e: 4, p: 3, gf: 10, gc: 9 },
    { id: 'GCY', pj: 10, g: 4, e: 3, p: 3, gf: 9, gc: 10 },
    { id: 'OVA', pj: 10, g: 3, e: 3, p: 4, gf: 14, gc: 15 },
    { id: 'CUE', pj: 10, g: 4, e: 2, p: 4, gf: 11, gc: 11 },
    { id: 'MUS', pj: 10, g: 3, e: 4, p: 3, gf: 11, gc: 11 },
    { id: 'DLF', pj: 10, g: 3, e: 3, p: 4, gf: 4, gc: 5 },
    { id: 'LDU', pj: 10, g: 4, e: 2, p: 4, gf: 9, gc: 9 },
    { id: 'MAC', pj: 10, g: 3, e: 4, p: 3, gf: 9, gc: 10 },
    { id: 'EME', pj: 10, g: 3, e: 2, p: 5, gf: 8, gc: 13 },
    { id: 'TEC', pj: 10, g: 3, e: 2, p: 5, gf: 8, gc: 10 },
    { id: 'LDN', pj: 10, g: 2, e: 4, p: 4, gf: 7, gc: 10 },
    { id: 'LIB', pj: 10, g: 2, e: 4, p: 4, gf: 8, gc: 11 },
    { id: 'MAN', pj: 10, g: 1, e: 1, p: 8, gf: 2, gc: 13 }
];
// Nota: Emelec recupero los 3 pts (FEF devolvio sancion)
// Datos actualizados - Liga Pro Ecuador 2026 - Fecha 10 (23 Abril 2026)

const FALLBACK_GOLEADORES = [
    { nombre: 'Bryan Miranda', equipo: 'AUC', goles: 6 },
    { nombre: 'Dario Benedetto', equipo: 'BSC', goles: 3 },
    { nombre: 'Byron Palacios', equipo: 'UCA', goles: 3 },
    { nombre: 'Emiliano Mero', equipo: 'GCY', goles: 3 },
    { nombre: 'Martin Perello', equipo: 'IDV', goles: 2 },
    { nombre: 'Gonzalo Rivero', equipo: 'CUE', goles: 2 },
    { nombre: 'Ariel Rodriguez', equipo: 'IDV', goles: 2 },
    { nombre: 'Djorkaeff Reasco', equipo: 'IDV', goles: 2 },
    { nombre: 'Junior Sornoza', equipo: 'IDV', goles: 2 },
    { nombre: 'Matias Castano', equipo: 'TEC', goles: 2 }
];

const FALLBACK_ASISTENCIAS = [
    { nombre: 'Martin Perello', equipo: 'IDV', asistencias: 2 },
    { nombre: 'Gonzalo Rivero', equipo: 'CUE', asistencias: 2 },
    { nombre: 'Ariel Rodriguez', equipo: 'IDV', asistencias: 2 },
    { nombre: 'Jhon Chancellor', equipo: 'UCA', asistencias: 2 },
    { nombre: 'Dario Benedetto', equipo: 'BSC', asistencias: 1 },
    { nombre: 'Byron Palacios', equipo: 'UCA', asistencias: 1 },
    { nombre: 'Vicente Branda', equipo: 'LIB', asistencias: 1 },
    { nombre: 'Edison Clavijo', equipo: 'UCA', asistencias: 1 }
];

// Resultados pasados para seccion Hinchas (BSC y todos los equipos)
const RESULTADOS_PASADOS = [
    // Jornada 1
    { jornada: 1, fecha: '2026-02-20', local: 'OVA', visitante: 'LDU', gl: 1, gv: 2 },
    { jornada: 1, fecha: '2026-02-21', local: 'BSC', visitante: 'TEC', gl: 1, gv: 0 },
    { jornada: 1, fecha: '2026-02-21', local: 'AUC', visitante: 'MUS', gl: 1, gv: 1 },
    { jornada: 1, fecha: '2026-02-22', local: 'IDV', visitante: 'GCY', gl: 2, gv: 0 },
    { jornada: 1, fecha: '2026-02-22', local: 'DLF', visitante: 'CUE', gl: 1, gv: 0 },
    { jornada: 1, fecha: '2026-02-22', local: 'MAC', visitante: 'LDN', gl: 0, gv: 0 },
    { jornada: 1, fecha: '2026-02-23', local: 'LIB', visitante: 'MAN', gl: 1, gv: 0 },
    { jornada: 1, fecha: '2026-04-08', local: 'UCA', visitante: 'EME', gl: 1, gv: 1 },
    // Jornada 2
    { jornada: 2, fecha: '2026-02-27', local: 'TEC', visitante: 'OVA', gl: 1, gv: 1 },
    { jornada: 2, fecha: '2026-02-28', local: 'EME', visitante: 'DLF', gl: 1, gv: 1 },
    { jornada: 2, fecha: '2026-02-28', local: 'GCY', visitante: 'AUC', gl: 1, gv: 1 },
    { jornada: 2, fecha: '2026-02-28', local: 'LDN', visitante: 'LIB', gl: 1, gv: 1 },
    { jornada: 2, fecha: '2026-03-01', local: 'CUE', visitante: 'BSC', gl: 2, gv: 1 },
    { jornada: 2, fecha: '2026-03-01', local: 'MUS', visitante: 'UCA', gl: 0, gv: 0 },
    { jornada: 2, fecha: '2026-03-01', local: 'LDU', visitante: 'MAC', gl: 0, gv: 2 },
    { jornada: 2, fecha: '2026-03-02', local: 'MAN', visitante: 'IDV', gl: 0, gv: 2 },
    // Jornada 3
    { jornada: 3, fecha: '2026-03-06', local: 'DLF', visitante: 'GCY', gl: 1, gv: 0 },
    { jornada: 3, fecha: '2026-03-07', local: 'LIB', visitante: 'LDU', gl: 2, gv: 1 },
    { jornada: 3, fecha: '2026-03-07', local: 'BSC', visitante: 'EME', gl: 1, gv: 0 },
    { jornada: 3, fecha: '2026-03-07', local: 'IDV', visitante: 'MUS', gl: 3, gv: 1 },
    { jornada: 3, fecha: '2026-03-08', local: 'UCA', visitante: 'LDN', gl: 3, gv: 0 },
    { jornada: 3, fecha: '2026-03-08', local: 'MAC', visitante: 'TEC', gl: 1, gv: 1 },
    { jornada: 3, fecha: '2026-03-08', local: 'AUC', visitante: 'CUE', gl: 0, gv: 1 },
    { jornada: 3, fecha: '2026-03-09', local: 'OVA', visitante: 'MAN', gl: 1, gv: 1 },
    // Jornada 4
    { jornada: 4, fecha: '2026-03-13', local: 'CUE', visitante: 'LDN', gl: 1, gv: 1 },
    { jornada: 4, fecha: '2026-03-13', local: 'TEC', visitante: 'LIB', gl: 2, gv: 1 },
    { jornada: 4, fecha: '2026-03-14', local: 'LDU', visitante: 'UCA', gl: 1, gv: 1 },
    { jornada: 4, fecha: '2026-03-14', local: 'DLF', visitante: 'MAN', gl: 0, gv: 1 },
    { jornada: 4, fecha: '2026-03-14', local: 'IDV', visitante: 'AUC', gl: 2, gv: 2 },
    { jornada: 4, fecha: '2026-03-15', local: 'GCY', visitante: 'BSC', gl: 0, gv: 0 },
    { jornada: 4, fecha: '2026-03-15', local: 'EME', visitante: 'OVA', gl: 2, gv: 1 },
    { jornada: 4, fecha: '2026-03-15', local: 'MUS', visitante: 'MAC', gl: 0, gv: 0 },
    // Jornada 5
    { jornada: 5, fecha: '2026-03-17', local: 'LDN', visitante: 'LDU', gl: 0, gv: 2 },
    { jornada: 5, fecha: '2026-03-17', local: 'UCA', visitante: 'CUE', gl: 1, gv: 0 },
    { jornada: 5, fecha: '2026-03-18', local: 'LIB', visitante: 'BSC', gl: 0, gv: 0 },
    { jornada: 5, fecha: '2026-03-18', local: 'MAN', visitante: 'GCY', gl: 0, gv: 1 },
    { jornada: 5, fecha: '2026-03-18', local: 'MAC', visitante: 'DLF', gl: 1, gv: 0 },
    { jornada: 5, fecha: '2026-03-19', local: 'EME', visitante: 'IDV', gl: 2, gv: 0 },
    { jornada: 5, fecha: '2026-03-19', local: 'OVA', visitante: 'MUS', gl: 3, gv: 2 },
    { jornada: 5, fecha: '2026-03-19', local: 'AUC', visitante: 'TEC', gl: 0, gv: 1 },
    // Jornada 6
    { jornada: 6, fecha: '2026-03-21', local: 'LDU', visitante: 'MAN', gl: 1, gv: 0 },
    { jornada: 6, fecha: '2026-03-21', local: 'CUE', visitante: 'MAC', gl: 1, gv: 1 },
    { jornada: 6, fecha: '2026-03-21', local: 'DLF', visitante: 'LIB', gl: 0, gv: 0 },
    { jornada: 6, fecha: '2026-03-22', local: 'MUS', visitante: 'EME', gl: 2, gv: 0 },
    { jornada: 6, fecha: '2026-03-22', local: 'BSC', visitante: 'UCA', gl: 1, gv: 1 },
    { jornada: 6, fecha: '2026-03-22', local: 'TEC', visitante: 'IDV', gl: 1, gv: 2 },
    { jornada: 6, fecha: '2026-03-23', local: 'AUC', visitante: 'OVA', gl: 3, gv: 2 },
    { jornada: 6, fecha: '2026-03-23', local: 'GCY', visitante: 'LDN', gl: 0, gv: 0 },
    // Jornada 7
    { jornada: 7, fecha: '2026-04-03', local: 'LDU', visitante: 'BSC', gl: 0, gv: 2 },
    { jornada: 7, fecha: '2026-04-04', local: 'IDV', visitante: 'OVA', gl: 2, gv: 0 },
    { jornada: 7, fecha: '2026-04-04', local: 'UCA', visitante: 'GCY', gl: 4, gv: 1 },
    { jornada: 7, fecha: '2026-04-04', local: 'EME', visitante: 'CUE', gl: 0, gv: 2 },
    { jornada: 7, fecha: '2026-04-05', local: 'LDN', visitante: 'DLF', gl: 1, gv: 0 },
    { jornada: 7, fecha: '2026-04-05', local: 'MAN', visitante: 'TEC', gl: 0, gv: 2 },
    { jornada: 7, fecha: '2026-04-05', local: 'MAC', visitante: 'AUC', gl: 0, gv: 1 },
    { jornada: 7, fecha: '2026-04-06', local: 'LIB', visitante: 'MUS', gl: 2, gv: 2 },
    // Jornada 8
    { jornada: 8, fecha: '2026-04-10', local: 'BSC', visitante: 'LDN', gl: 2, gv: 1 },
    { jornada: 8, fecha: '2026-04-10', local: 'DLF', visitante: 'LDU', gl: 1, gv: 0 },
    { jornada: 8, fecha: '2026-04-11', local: 'OVA', visitante: 'LIB', gl: 2, gv: 1 },
    { jornada: 8, fecha: '2026-04-11', local: 'MUS', visitante: 'MAN', gl: 1, gv: 0 },
    { jornada: 8, fecha: '2026-04-12', local: 'TEC', visitante: 'UCA', gl: 0, gv: 2 },
    { jornada: 8, fecha: '2026-04-12', local: 'CUE', visitante: 'IDV', gl: 2, gv: 3 },
    { jornada: 8, fecha: '2026-04-12', local: 'GCY', visitante: 'MAC', gl: 2, gv: 1 },
    { jornada: 8, fecha: '2026-04-12', local: 'AUC', visitante: 'EME', gl: 2, gv: 0 },
    // Jornada 9
    { jornada: 9, fecha: '2026-04-17', local: 'LDN', visitante: 'AUC', gl: 0, gv: 1 },
    { jornada: 9, fecha: '2026-04-17', local: 'EME', visitante: 'GCY', gl: 1, gv: 3 },
    { jornada: 9, fecha: '2026-04-18', local: 'MUS', visitante: 'TEC', gl: 1, gv: 0 },
    { jornada: 9, fecha: '2026-04-18', local: 'UCA', visitante: 'LIB', gl: 2, gv: 0 },
    { jornada: 9, fecha: '2026-04-18', local: 'OVA', visitante: 'DLF', gl: 0, gv: 0 },
    { jornada: 9, fecha: '2026-04-19', local: 'MAN', visitante: 'CUE', gl: 0, gv: 1 },
    { jornada: 9, fecha: '2026-04-19', local: 'IDV', visitante: 'LDU', gl: 0, gv: 2 },
    { jornada: 9, fecha: '2026-04-19', local: 'MAC', visitante: 'BSC', gl: 3, gv: 1 },
    // Jornada 10
    { jornada: 10, fecha: '2026-04-21', local: 'LIB', visitante: 'GCY', gl: 0, gv: 1 },
    { jornada: 10, fecha: '2026-04-21', local: 'TEC', visitante: 'EME', gl: 0, gv: 1 },
    { jornada: 10, fecha: '2026-04-22', local: 'LDN', visitante: 'MAN', gl: 3, gv: 0 },
    { jornada: 10, fecha: '2026-04-22', local: 'DLF', visitante: 'IDV', gl: 0, gv: 1 },
    { jornada: 10, fecha: '2026-04-22', local: 'CUE', visitante: 'OVA', gl: 1, gv: 3 },
    { jornada: 10, fecha: '2026-04-22', local: 'BSC', visitante: 'MUS', gl: 2, gv: 1 },
    { jornada: 10, fecha: '2026-04-22', local: 'LDU', visitante: 'AUC', gl: 0, gv: 0 },
    { jornada: 10, fecha: '2026-04-23', local: 'UCA', visitante: 'MAC', gl: 4, gv: 0 }
];

const JORNADA_PRODE = [
    { jornada: 11, local: 'MUS', visitante: 'CUE', fecha: '2026-04-25' },
    { jornada: 11, local: 'IDV', visitante: 'LDN', fecha: '2026-04-25' },
    { jornada: 11, local: 'EME', visitante: 'LDU', fecha: '2026-04-25' },
    { jornada: 11, local: 'MAC', visitante: 'LIB', fecha: '2026-04-26' },
    { jornada: 11, local: 'GCY', visitante: 'TEC', fecha: '2026-04-26' },
    { jornada: 11, local: 'OVA', visitante: 'BSC', fecha: '2026-04-26' },
    { jornada: 11, local: 'MAN', visitante: 'UCA', fecha: '2026-04-27' },
    { jornada: 11, local: 'AUC', visitante: 'DLF', fecha: '2026-04-27' }
];
const CURRENT_JORNADA = 11; // Jornada activa para el Prode

// Orden de partidos que se uso en el Prode para cada jornada pasada
// (necesario para mapear indices de predicciones a partidos reales)
const PRODE_MATCH_ORDER = {
    9: [
        { local: 'LDN', visitante: 'AUC' },
        { local: 'EME', visitante: 'GCY' },
        { local: 'MUS', visitante: 'TEC' },
        { local: 'UCA', visitante: 'LIB' },
        { local: 'OVA', visitante: 'DLF' },
        { local: 'MAN', visitante: 'CUE' },
        { local: 'IDV', visitante: 'LDU' },
        { local: 'MAC', visitante: 'BSC' }
    ],
    10: [
        { local: 'LIB', visitante: 'GCY' },
        { local: 'TEC', visitante: 'EME' },
        { local: 'LDN', visitante: 'MAN' },
        { local: 'DLF', visitante: 'IDV' },
        { local: 'CUE', visitante: 'OVA' },
        { local: 'BSC', visitante: 'MUS' },
        { local: 'LDU', visitante: 'AUC' },
        { local: 'UCA', visitante: 'MAC' }
    ]
};

// ===== CALENDARIO COMPLETO LIGAPRO 2026 =====
const CALENDARIO_FECHAS = [
    // Fecha 11 (25-27 Abril)
    { fecha: 11, inicio: '2026-04-25', partidos: [
        { local: 'MUS', visitante: 'CUE', dia: '2026-04-25' },
        { local: 'IDV', visitante: 'LDN', dia: '2026-04-25' },
        { local: 'EME', visitante: 'LDU', dia: '2026-04-25' },
        { local: 'MAC', visitante: 'LIB', dia: '2026-04-26' },
        { local: 'GCY', visitante: 'TEC', dia: '2026-04-26' },
        { local: 'OVA', visitante: 'BSC', dia: '2026-04-26' },
        { local: 'MAN', visitante: 'UCA', dia: '2026-04-27' },
        { local: 'AUC', visitante: 'DLF', dia: '2026-04-27' }
    ]},
    // Fecha 12 (1-3 Mayo)
    { fecha: 12, inicio: '2026-05-01', partidos: [
        { local: 'UCA', visitante: 'IDV', dia: '2026-05-01' },
        { local: 'LIB', visitante: 'AUC', dia: '2026-05-01' },
        { local: 'CUE', visitante: 'TEC', dia: '2026-05-02' },
        { local: 'LDU', visitante: 'GCY', dia: '2026-05-02' },
        { local: 'BSC', visitante: 'MAN', dia: '2026-05-02' },
        { local: 'MAC', visitante: 'OVA', dia: '2026-05-03' },
        { local: 'DLF', visitante: 'MUS', dia: '2026-05-03' },
        { local: 'LDN', visitante: 'EME', dia: '2026-05-03' }
    ]},
    // Fecha 13 (8-11 Mayo)
    { fecha: 13, inicio: '2026-05-08', partidos: [
        { local: 'OVA', visitante: 'LDN', dia: '2026-05-08' },
        { local: 'TEC', visitante: 'DLF', dia: '2026-05-09' },
        { local: 'GCY', visitante: 'CUE', dia: '2026-05-09' },
        { local: 'IDV', visitante: 'BSC', dia: '2026-05-09' },
        { local: 'AUC', visitante: 'UCA', dia: '2026-05-10' },
        { local: 'EME', visitante: 'LIB', dia: '2026-05-10' },
        { local: 'MAN', visitante: 'MAC', dia: '2026-05-10' },
        { local: 'MUS', visitante: 'LDU', dia: '2026-05-11' }
    ]},
    // Fecha 14 (15-18 Mayo)
    { fecha: 14, inicio: '2026-05-15', partidos: [
        { local: 'LIB', visitante: 'CUE', dia: '2026-05-15' },
        { local: 'MAC', visitante: 'IDV', dia: '2026-05-16' },
        { local: 'LDU', visitante: 'TEC', dia: '2026-05-16' },
        { local: 'BSC', visitante: 'AUC', dia: '2026-05-16' },
        { local: 'LDN', visitante: 'MUS', dia: '2026-05-17' },
        { local: 'UCA', visitante: 'DLF', dia: '2026-05-17' },
        { local: 'MAN', visitante: 'EME', dia: '2026-05-17' },
        { local: 'GCY', visitante: 'OVA', dia: '2026-05-18' }
    ]},
    // Fecha 15 (22-25 Mayo)
    { fecha: 15, inicio: '2026-05-22', partidos: [
        { local: 'IDV', visitante: 'LIB', dia: '2026-05-22' },
        { local: 'MUS', visitante: 'GCY', dia: '2026-05-23' },
        { local: 'OVA', visitante: 'UCA', dia: '2026-05-23' },
        { local: 'CUE', visitante: 'LDU', dia: '2026-05-23' },
        { local: 'TEC', visitante: 'LDN', dia: '2026-05-24' },
        { local: 'EME', visitante: 'MAC', dia: '2026-05-24' },
        { local: 'DLF', visitante: 'BSC', dia: '2026-05-24' },
        { local: 'AUC', visitante: 'MAN', dia: '2026-05-25' }
    ]},
    // Fecha 16 (30 Mayo - 1 Junio)
    { fecha: 16, inicio: '2026-05-30', partidos: [
        { local: 'MAN', visitante: 'LIB', dia: '2026-05-30' },
        { local: 'LDU', visitante: 'OVA', dia: '2026-05-30' },
        { local: 'CUE', visitante: 'DLF', dia: '2026-05-30' },
        { local: 'MUS', visitante: 'AUC', dia: '2026-05-31' },
        { local: 'GCY', visitante: 'IDV', dia: '2026-05-31' },
        { local: 'EME', visitante: 'UCA', dia: '2026-05-31' },
        { local: 'LDN', visitante: 'MAC', dia: '2026-06-01' },
        { local: 'TEC', visitante: 'BSC', dia: '2026-06-01' }
    ]},
    // Fecha 17 (1 Julio)
    { fecha: 17, inicio: '2026-07-01', partidos: [
        { local: 'DLF', visitante: 'EME', dia: '2026-07-01' },
        { local: 'AUC', visitante: 'GCY', dia: '2026-07-01' },
        { local: 'MAC', visitante: 'LDU', dia: '2026-07-01' },
        { local: 'OVA', visitante: 'TEC', dia: '2026-07-01' },
        { local: 'UCA', visitante: 'MUS', dia: '2026-07-01' },
        { local: 'IDV', visitante: 'MAN', dia: '2026-07-01' },
        { local: 'BSC', visitante: 'CUE', dia: '2026-07-01' },
        { local: 'LIB', visitante: 'LDN', dia: '2026-07-01' }
    ]},
    // Fecha 18 (5 Julio)
    { fecha: 18, inicio: '2026-07-05', partidos: [
        { local: 'EME', visitante: 'BSC', dia: '2026-07-05' },
        { local: 'LDN', visitante: 'UCA', dia: '2026-07-05' },
        { local: 'CUE', visitante: 'AUC', dia: '2026-07-05' },
        { local: 'MUS', visitante: 'IDV', dia: '2026-07-05' },
        { local: 'TEC', visitante: 'MAC', dia: '2026-07-05' },
        { local: 'GCY', visitante: 'DLF', dia: '2026-07-05' },
        { local: 'MAN', visitante: 'OVA', dia: '2026-07-05' },
        { local: 'LDU', visitante: 'LIB', dia: '2026-07-05' }
    ]},
    // Fecha 19 (12 Julio)
    { fecha: 19, inicio: '2026-07-12', partidos: [
        { local: 'OVA', visitante: 'EME', dia: '2026-07-12' },
        { local: 'BSC', visitante: 'GCY', dia: '2026-07-12' },
        { local: 'UCA', visitante: 'LDU', dia: '2026-07-12' },
        { local: 'AUC', visitante: 'IDV', dia: '2026-07-12' },
        { local: 'LIB', visitante: 'TEC', dia: '2026-07-12' },
        { local: 'MAC', visitante: 'MUS', dia: '2026-07-12' },
        { local: 'MAN', visitante: 'DLF', dia: '2026-07-12' },
        { local: 'LDN', visitante: 'CUE', dia: '2026-07-12' }
    ]},
    // Fecha 20 (15 Julio)
    { fecha: 20, inicio: '2026-07-15', partidos: [
        { local: 'IDV', visitante: 'EME', dia: '2026-07-15' },
        { local: 'CUE', visitante: 'UCA', dia: '2026-07-15' },
        { local: 'TEC', visitante: 'AUC', dia: '2026-07-15' },
        { local: 'DLF', visitante: 'MAC', dia: '2026-07-15' },
        { local: 'GCY', visitante: 'MAN', dia: '2026-07-15' },
        { local: 'MUS', visitante: 'OVA', dia: '2026-07-15' },
        { local: 'BSC', visitante: 'LIB', dia: '2026-07-15' },
        { local: 'LDU', visitante: 'LDN', dia: '2026-07-15' }
    ]},
    // Fecha 21 (19 Julio)
    { fecha: 21, inicio: '2026-07-19', partidos: [
        { local: 'UCA', visitante: 'BSC', dia: '2026-07-19' },
        { local: 'LDN', visitante: 'GCY', dia: '2026-07-19' },
        { local: 'MAN', visitante: 'LDU', dia: '2026-07-19' },
        { local: 'OVA', visitante: 'AUC', dia: '2026-07-19' },
        { local: 'IDV', visitante: 'TEC', dia: '2026-07-19' },
        { local: 'EME', visitante: 'MUS', dia: '2026-07-19' },
        { local: 'LIB', visitante: 'DLF', dia: '2026-07-19' },
        { local: 'MAC', visitante: 'CUE', dia: '2026-07-19' }
    ]},
    // Fecha 22 (26 Julio)
    { fecha: 22, inicio: '2026-07-26', partidos: [
        { local: 'CUE', visitante: 'EME', dia: '2026-07-26' },
        { local: 'BSC', visitante: 'LDU', dia: '2026-07-26' },
        { local: 'GCY', visitante: 'UCA', dia: '2026-07-26' },
        { local: 'OVA', visitante: 'IDV', dia: '2026-07-26' },
        { local: 'AUC', visitante: 'MAC', dia: '2026-07-26' },
        { local: 'TEC', visitante: 'MAN', dia: '2026-07-26' },
        { local: 'MUS', visitante: 'LIB', dia: '2026-07-26' },
        { local: 'DLF', visitante: 'LDN', dia: '2026-07-26' }
    ]},
    // Fecha 23 (2 Agosto)
    { fecha: 23, inicio: '2026-08-02', partidos: [
        { local: 'LDN', visitante: 'BSC', dia: '2026-08-02' },
        { local: 'MAC', visitante: 'GCY', dia: '2026-08-02' },
        { local: 'EME', visitante: 'AUC', dia: '2026-08-02' },
        { local: 'UCA', visitante: 'TEC', dia: '2026-08-02' },
        { local: 'MAN', visitante: 'MUS', dia: '2026-08-02' },
        { local: 'LDU', visitante: 'DLF', dia: '2026-08-02' },
        { local: 'LIB', visitante: 'OVA', dia: '2026-08-02' },
        { local: 'IDV', visitante: 'CUE', dia: '2026-08-02' }
    ]},
    // Fecha 24 (9 Agosto)
    { fecha: 24, inicio: '2026-08-09', partidos: [
        { local: 'GCY', visitante: 'EME', dia: '2026-08-09' },
        { local: 'LIB', visitante: 'UCA', dia: '2026-08-09' },
        { local: 'LDU', visitante: 'IDV', dia: '2026-08-09' },
        { local: 'BSC', visitante: 'MAC', dia: '2026-08-09' },
        { local: 'TEC', visitante: 'MUS', dia: '2026-08-09' },
        { local: 'CUE', visitante: 'MAN', dia: '2026-08-09' },
        { local: 'DLF', visitante: 'OVA', dia: '2026-08-09' },
        { local: 'AUC', visitante: 'LDN', dia: '2026-08-09' }
    ]},
    // Fecha 25 (16 Agosto)
    { fecha: 25, inicio: '2026-08-16', partidos: [
        { local: 'MUS', visitante: 'BSC', dia: '2026-08-16' },
        { local: 'AUC', visitante: 'LDU', dia: '2026-08-16' },
        { local: 'MAC', visitante: 'UCA', dia: '2026-08-16' },
        { local: 'EME', visitante: 'TEC', dia: '2026-08-16' },
        { local: 'IDV', visitante: 'DLF', dia: '2026-08-16' },
        { local: 'OVA', visitante: 'CUE', dia: '2026-08-16' },
        { local: 'GCY', visitante: 'LIB', dia: '2026-08-16' },
        { local: 'MAN', visitante: 'LDN', dia: '2026-08-16' }
    ]},
    // Fecha 26 (23 Agosto)
    { fecha: 26, inicio: '2026-08-23', partidos: [
        { local: 'LDU', visitante: 'EME', dia: '2026-08-23' },
        { local: 'TEC', visitante: 'GCY', dia: '2026-08-23' },
        { local: 'DLF', visitante: 'AUC', dia: '2026-08-23' },
        { local: 'LDN', visitante: 'IDV', dia: '2026-08-23' },
        { local: 'LIB', visitante: 'MAC', dia: '2026-08-23' },
        { local: 'CUE', visitante: 'MUS', dia: '2026-08-23' },
        { local: 'UCA', visitante: 'MAN', dia: '2026-08-23' },
        { local: 'BSC', visitante: 'OVA', dia: '2026-08-23' }
    ]},
    // Fecha 27 (30 Agosto)
    { fecha: 27, inicio: '2026-08-30', partidos: [
        { local: 'MAN', visitante: 'BSC', dia: '2026-08-30' },
        { local: 'GCY', visitante: 'LDU', dia: '2026-08-30' },
        { local: 'IDV', visitante: 'UCA', dia: '2026-08-30' },
        { local: 'OVA', visitante: 'MAC', dia: '2026-08-30' },
        { local: 'MUS', visitante: 'DLF', dia: '2026-08-30' },
        { local: 'TEC', visitante: 'CUE', dia: '2026-08-30' },
        { local: 'AUC', visitante: 'LIB', dia: '2026-08-30' },
        { local: 'EME', visitante: 'LDN', dia: '2026-08-30' }
    ]},
    // Fecha 28 (2 Septiembre)
    { fecha: 28, inicio: '2026-09-02', partidos: [
        { local: 'LIB', visitante: 'EME', dia: '2026-09-02' },
        { local: 'CUE', visitante: 'GCY', dia: '2026-09-02' },
        { local: 'UCA', visitante: 'AUC', dia: '2026-09-02' },
        { local: 'BSC', visitante: 'IDV', dia: '2026-09-02' },
        { local: 'DLF', visitante: 'TEC', dia: '2026-09-02' },
        { local: 'LDU', visitante: 'MUS', dia: '2026-09-02' },
        { local: 'MAC', visitante: 'MAN', dia: '2026-09-02' },
        { local: 'LDN', visitante: 'OVA', dia: '2026-09-02' }
    ]},
    // Fecha 29 (6 Septiembre)
    { fecha: 29, inicio: '2026-09-06', partidos: [
        { local: 'AUC', visitante: 'BSC', dia: '2026-09-06' },
        { local: 'OVA', visitante: 'GCY', dia: '2026-09-06' },
        { local: 'TEC', visitante: 'LDU', dia: '2026-09-06' },
        { local: 'DLF', visitante: 'UCA', dia: '2026-09-06' },
        { local: 'IDV', visitante: 'MAC', dia: '2026-09-06' },
        { local: 'EME', visitante: 'MAN', dia: '2026-09-06' },
        { local: 'CUE', visitante: 'LIB', dia: '2026-09-06' },
        { local: 'MUS', visitante: 'LDN', dia: '2026-09-06' }
    ]},
    // Fecha 30 (13 Septiembre)
    { fecha: 30, inicio: '2026-09-13', partidos: [
        { local: 'MAC', visitante: 'EME', dia: '2026-09-13' },
        { local: 'MAN', visitante: 'AUC', dia: '2026-09-13' },
        { local: 'LIB', visitante: 'IDV', dia: '2026-09-13' },
        { local: 'LDN', visitante: 'TEC', dia: '2026-09-13' },
        { local: 'GCY', visitante: 'MUS', dia: '2026-09-13' },
        { local: 'BSC', visitante: 'DLF', dia: '2026-09-13' },
        { local: 'UCA', visitante: 'OVA', dia: '2026-09-13' },
        { local: 'LDU', visitante: 'CUE', dia: '2026-09-13' }
    ]}
];

// ===== APP STATE =====
let currentUser = null;
let currentTab = 'tabla';
let authMode = 'login';
let standingsData = null;
let goleadoresData = null;
let asistenciasData = null;
let userAsistencias = [];
let dynamicResultados = null; // Resultados cargados de Supabase
let dynamicJornada = null; // Jornada activa del Prode desde config

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAuth();
    initLigas();
    initHinchas();
    initPerfil();
    initSubTabs();
    initComunidad();
    initEditorial();
    checkSession();
    loadData();
    trackVisit();
});

// ===== API-FOOTBALL =====
async function apiCall(endpoint) {
    if (!API_KEY) return null;
    try {
        const res = await fetch(API_BASE + endpoint, {
            headers: { 'x-apisports-key': API_KEY }
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.response || null;
    } catch (e) {
        console.warn('API error:', e);
        return null;
    }
}

function getCached(key) {
    try {
        const raw = localStorage.getItem('tt_' + key);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (Date.now() - obj.ts > CACHE_TTL) return null;
        return obj.data;
    } catch (e) { return null; }
}

function setCache(key, data) {
    try { localStorage.setItem('tt_' + key, JSON.stringify({ ts: Date.now(), data })); }
    catch (e) { /* ignore */ }
}

async function loadData() {
    showDataStatus('Cargando datos...');

    // Try loading from Supabase first (resultados + config)
    if (supabaseClient) {
        try {
            const [resResultados, resConfig] = await Promise.all([
                supabaseClient.from('resultados').select('*').order('jornada').order('id'),
                supabaseClient.from('config').select('*')
            ]);

            if (resResultados.data && resResultados.data.length > 0) {
                dynamicResultados = resResultados.data;
                // Build standings dynamically from all results
                standingsData = buildStandingsFromResults(dynamicResultados);
                goleadoresData = FALLBACK_GOLEADORES;
                asistenciasData = FALLBACK_ASISTENCIAS;

                const maxJ = Math.max(...dynamicResultados.map(r => r.jornada));
                showDataStatus('Datos en vivo - Fecha ' + maxJ, true);
            }

            if (resConfig.data) {
                const jornadaCfg = resConfig.data.find(c => c.key === 'current_jornada');
                if (jornadaCfg) {
                    dynamicJornada = parseInt(jornadaCfg.value);
                }
            }
        } catch (e) {
            console.warn('Error loading from Supabase, using fallback:', e);
        }
    }

    // Fallback to hardcoded data if Supabase didn't work
    if (!standingsData) useFallback();

    renderAll();

    // Re-init admin panel if admin is logged in (so it picks up fresh Supabase data)
    if (currentUser && currentUser.id === ADMIN_USER_ID) {
        initAdminPanel();
    }
}

function buildStandingsFromResults(results) {
    // Initialize all teams with 0
    const teams = {};
    Object.keys(EQUIPOS).forEach(id => {
        teams[id] = { id, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 };
    });

    // Process each result
    results.forEach(r => {
        const home = teams[r.local];
        const away = teams[r.visitante];
        if (!home || !away) return;

        home.pj++; away.pj++;
        home.gf += r.gl; home.gc += r.gv;
        away.gf += r.gv; away.gc += r.gl;

        if (r.gl > r.gv) { home.g++; away.p++; }
        else if (r.gl < r.gv) { away.g++; home.p++; }
        else { home.e++; away.e++; }
    });

    return Object.values(teams).filter(t => t.pj > 0);
}

function useFallback() {
    standingsData = FALLBACK_STANDINGS;
    goleadoresData = FALLBACK_GOLEADORES;
    asistenciasData = FALLBACK_ASISTENCIAS;
    showDataStatus('Datos fallback - Fecha 10', true);
}

// Get all results (dynamic from Supabase or fallback to hardcoded)
function getAllResultados() {
    if (dynamicResultados && dynamicResultados.length > 0) {
        return dynamicResultados;
    }
    return RESULTADOS_PASADOS;
}

// Get match order for a completed prode jornada (for history comparison)
function getProdeMatchOrder(jornada) {
    // First check hardcoded order (for jornadas where order differed from calendar)
    if (PRODE_MATCH_ORDER[jornada]) return PRODE_MATCH_ORDER[jornada];
    // Fallback: use CALENDARIO_FECHAS order
    const fechaCal = CALENDARIO_FECHAS.find(f => f.fecha === jornada);
    if (fechaCal && fechaCal.partidos) {
        return fechaCal.partidos.map(p => ({ local: p.local, visitante: p.visitante }));
    }
    return null;
}

// Get active jornada (dynamic or fallback)
function getActiveJornada() {
    return dynamicJornada || CURRENT_JORNADA;
}

// Get matches for the active Prode jornada (dynamic from CALENDARIO_FECHAS)
function getProdeMatches() {
    const activeJ = getActiveJornada();
    // First check CALENDARIO_FECHAS
    const fechaCal = CALENDARIO_FECHAS.find(f => f.fecha === activeJ);
    if (fechaCal && fechaCal.partidos) {
        return fechaCal.partidos.map(p => ({
            jornada: activeJ,
            local: p.local,
            visitante: p.visitante,
            fecha: p.dia
        }));
    }
    // Fallback to JORNADA_PRODE if it matches
    if (JORNADA_PRODE.length > 0 && JORNADA_PRODE[0].jornada === activeJ) {
        return JORNADA_PRODE;
    }
    // Last resort: return empty
    return [];
}

function parseAPIStandings(raw) {
    return raw.map(t => {
        const teamName = t.team.name;
        const id = findTeamId(teamName);
        return {
            id: id || teamName,
            pj: t.all.played, g: t.all.win, e: t.all.draw, p: t.all.lose,
            gf: t.all.goals.for, gc: t.all.goals.against
        };
    });
}

function parseAPIScorers(raw) {
    return raw.slice(0, 10).map(p => ({
        nombre: p.player.name,
        equipo: findTeamId(p.statistics[0].team.name) || p.statistics[0].team.name,
        goles: p.statistics[0].goals.total || 0
    }));
}

function parseAPIAssists(raw) {
    return raw.slice(0, 10).map(p => ({
        nombre: p.player.name,
        equipo: findTeamId(p.statistics[0].team.name) || p.statistics[0].team.name,
        asistencias: p.statistics[0].goals.assists || 0
    }));
}

function findTeamId(apiName) {
    const lower = (apiName || '').toLowerCase();
    for (const [id, eq] of Object.entries(EQUIPOS)) {
        if (lower.includes(eq.nombre.toLowerCase().split(' ')[0]) || lower.includes(id.toLowerCase())) return id;
    }
    const mappings = {
        'independiente': 'IDV', 'valle': 'IDV', 'catolica': 'UCA', 'universidad c': 'UCA',
        'barcelona': 'BSC', 'aucas': 'AUC', 'cuenca': 'CUE', 'tecnico': 'TEC',
        'delfin': 'DLF', 'mushuc': 'MUS', 'liga': 'LDU', 'libertad': 'LIB',
        'macara': 'MAC', 'guayaquil city': 'GCY', 'orense': 'OVA',
        'leones': 'LDN', 'emelec': 'EME', 'manta': 'MAN'
    };
    for (const [key, val] of Object.entries(mappings)) {
        if (lower.includes(key)) return val;
    }
    return null;
}

function showDataStatus(msg, live) {
    const el = document.getElementById('dataStatus');
    if (!el) return;
    el.innerHTML = live ? '<span class="live-dot"></span> ' + msg : msg;
}

function renderAll() {
    renderStandings();
    renderStats();
    renderProde();
    loadRankingHinchas();
}

// ===== TAB NAVIGATION =====
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tabId));
    currentTab = tabId;
    if (tabId === 'calendario') initCalendario();
}

// ===== STANDINGS TABLE =====
function renderStandings() {
    const tbody = document.getElementById('standingsBody');
    if (!tbody || !standingsData) return;

    const teams = standingsData.map(t => ({
        ...t,
        pts: t.g * 3 + t.e,
        dg: t.gf - t.gc
    }));
    teams.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

    const maxJornada = Math.max(...teams.map(t => t.pj));
    const fechaBadge = document.getElementById('fechaBadge');
    if (fechaBadge) fechaBadge.textContent = 'Fecha ' + maxJornada;

    tbody.innerHTML = teams.map((t, i) => {
        const pos = i + 1;
        const equipo = EQUIPOS[t.id] || { nombre: t.id, svg: '', corto: t.id };
        let zoneClass = '';
        if (pos <= 6) zoneClass = 'zone-libertadores';
        else if (pos <= 10) zoneClass = 'zone-sudamericana';
        else zoneClass = 'zone-descenso';
        const dgStr = t.dg > 0 ? '+' + t.dg : t.dg;
        return '<tr class="' + zoneClass + '">' +
            '<td class="col-pos">' + pos + '</td>' +
            '<td class="col-team"><div class="team-cell"><div class="team-badge"><img src="' + equipo.logo + '" alt="' + equipo.corto + '" onerror="this.outerHTML=\'<span class=badge-fallback>' + equipo.corto + '</span>\'"></div><span class="team-name">' + equipo.nombre + '</span></div></td>' +
            '<td class="col-stat">' + t.pj + '</td>' +
            '<td class="col-stat">' + t.g + '</td>' +
            '<td class="col-stat">' + t.e + '</td>' +
            '<td class="col-stat">' + t.p + '</td>' +
            '<td class="col-stat">' + t.gf + '</td>' +
            '<td class="col-stat">' + t.gc + '</td>' +
            '<td class="col-stat">' + dgStr + '</td>' +
            '<td class="col-pts">' + t.pts + '</td></tr>';
    }).join('');

    // Refresh button
    document.getElementById('btnRefreshStandings')?.addEventListener('click', () => {
        localStorage.removeItem('tt_standings');
        localStorage.removeItem('tt_scorers');
        localStorage.removeItem('tt_assists');
        loadData();
    });
}

// ===== STATISTICS =====
function renderStats() {
    renderStatList('goleadoresList', goleadoresData || FALLBACK_GOLEADORES, 'goles');
    renderStatList('asistenciasList', asistenciasData || FALLBACK_ASISTENCIAS, 'asistencias');
    renderAtaqueDefensa();
}

function renderStatList(containerId, data, key) {
    const container = document.getElementById(containerId);
    if (!container || !data) return;
    container.innerHTML = data.map((item, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        const equipo = EQUIPOS[item.equipo];
        return '<div class="stat-row"><span class="stat-rank ' + rankClass + '">' + (i + 1) + '</span>' +
            '<div class="stat-player"><div class="stat-player-name">' + item.nombre + '</div>' +
            '<div class="stat-player-team">' + (equipo ? equipo.nombre : item.equipo) + '</div></div>' +
            '<span class="stat-value">' + item[key] + '</span></div>';
    }).join('');
}

function renderAtaqueDefensa() {
    if (!standingsData) return;
    const teams = standingsData.map(t => ({ ...t }));
    const ataque = [...teams].sort((a, b) => b.gf - a.gf).slice(0, 6);
    const defensa = [...teams].sort((a, b) => a.gc - b.gc).slice(0, 6);

    const renderTeamStat = (list, label, valueKey) => {
        return list.map((t, i) => {
            const equipo = EQUIPOS[t.id] || { nombre: t.id };
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return '<div class="stat-row"><span class="stat-rank ' + rankClass + '">' + (i + 1) + '</span>' +
                '<div class="stat-player"><div class="stat-player-name">' + equipo.nombre + '</div>' +
                '<div class="stat-player-team">' + t[valueKey] + ' ' + label + '</div></div>' +
                '<span class="stat-value">' + t[valueKey] + '</span></div>';
        }).join('');
    };

    const ac = document.getElementById('ataqueList');
    if (ac) ac.innerHTML = renderTeamStat(ataque, 'goles en ' + ataque[0].pj + ' PJ', 'gf');
    const dc = document.getElementById('defensaList');
    if (dc) dc.innerHTML = renderTeamStat(defensa, 'goles recibidos', 'gc');
}

// ===== PRODE =====
function renderProde() {
    updateProdeGate();
    const grid = document.getElementById('prodeGrid');
    if (!grid) return;

    const prodeMatches = getProdeMatches();
    grid.innerHTML = prodeMatches.map((match, i) => {
        const local = EQUIPOS[match.local] || { svg: '', corto: match.local };
        const visitante = EQUIPOS[match.visitante] || { svg: '', corto: match.visitante };
        return '<div class="prode-match">' +
            '<div class="prode-team home"><div class="team-badge"><img src="' + local.logo + '" alt="' + local.corto + '"></div><span>' + local.corto + '</span></div>' +
            '<div class="prode-score">' +
            '<input type="number" min="0" max="20" class="prode-input" data-match="' + i + '" data-side="home" placeholder="-">' +
            '<span class="prode-vs">vs</span>' +
            '<input type="number" min="0" max="20" class="prode-input" data-match="' + i + '" data-side="away" placeholder="-">' +
            '</div>' +
            '<div class="prode-team away"><span>' + visitante.corto + '</span><div class="team-badge"><img src="' + visitante.logo + '" alt="' + visitante.corto + '"></div></div></div>';
    }).join('');

    document.getElementById('prodeJornada').textContent = 'Jornada ' + getActiveJornada();
    document.getElementById('btnGuardarProde')?.addEventListener('click', guardarPronosticos);
    loadMyPronosticos();
    loadComunidadPronosticos();
    loadProdeHistory();
}

function updateProdeGate() {
    const gate = document.getElementById('prodeGate');
    const content = document.getElementById('prodeContent');
    if (!gate || !content) return;
    if (currentUser) {
        gate.classList.add('hidden');
        content.classList.remove('hidden');
    } else {
        gate.classList.remove('hidden');
        content.classList.add('hidden');
    }
}

function guardarPronosticos() {
    if (!currentUser || currentUser.id === 'demo') { showToast('Inicia sesion con tu cuenta para guardar'); return; }
    const inputs = document.querySelectorAll('.prode-input');
    const pronosticos = {};
    let completo = true;
    inputs.forEach(input => {
        const m = input.dataset.match, s = input.dataset.side;
        if (!pronosticos[m]) pronosticos[m] = {};
        pronosticos[m][s] = input.value;
        if (input.value === '') completo = false;
    });
    if (!completo) { showToast('Completa todos los marcadores'); return; }
    if (supabaseClient) { savePronosticosDB(pronosticos); }
    else { showToast('Pronosticos guardados (modo demo)'); }
}

async function savePronosticosDB(pronosticos) {
    try {
        // Build marcadores JSONB: { "0": {"home":1,"away":2}, "1": {...}, ... }
        const marcadores = {};
        Object.entries(pronosticos).forEach(([idx, scores]) => {
            marcadores[idx] = { home: parseInt(scores.home), away: parseInt(scores.away) };
        });
        const record = {
            user_id: currentUser.id,
            jornada: getActiveJornada(),
            marcadores: marcadores,
            updated_at: new Date().toISOString()
        };
        const { error } = await supabaseClient.from('pronosticos')
            .upsert(record, { onConflict: 'user_id,jornada' });
        if (error) throw error;
        showToast('Pronosticos guardados ✓');
        loadComunidadPronosticos();
    } catch (e) {
        console.error('Error saving pronosticos:', e);
        if (e.message && e.message.toLowerCase().includes('not confirmed')) {
            showToast('Tu email no esta confirmado. Inicia sesion de nuevo para reenviar confirmacion.');
        } else if (!currentUser || currentUser.id === 'demo') {
            showToast('Inicia sesion para guardar pronosticos.');
        } else {
            showToast('Error al guardar: ' + (e.message || 'intenta de nuevo'));
        }
    }
}

async function loadMyPronosticos() {
    if (!currentUser || !supabaseClient) return;
    try {
        const { data } = await supabaseClient.from('pronosticos')
            .select('marcadores')
            .eq('user_id', currentUser.id)
            .eq('jornada', getActiveJornada())
            .single();
        if (data && data.marcadores) {
            Object.entries(data.marcadores).forEach(([idx, scores]) => {
                const homeInput = document.querySelector('.prode-input[data-match="' + idx + '"][data-side="home"]');
                const awayInput = document.querySelector('.prode-input[data-match="' + idx + '"][data-side="away"]');
                if (homeInput) homeInput.value = scores.home;
                if (awayInput) awayInput.value = scores.away;
            });
        }
    } catch (e) { console.warn('Error loading my pronosticos:', e); }
}

async function loadComunidadPronosticos() {
    if (!supabaseClient) return;
    const container = document.getElementById('comunidadPreds');
    if (!container) return;
    try {
        const { data } = await supabaseClient.from('pronosticos')
            .select('user_id, marcadores')
            .eq('jornada', getActiveJornada());
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="ranking-empty">Aun nadie ha enviado pronosticos para esta jornada.</div>';
            return;
        }
        // Get user names from perfiles
        let userNames = {};
        try {
            const userIds = data.map(d => d.user_id);
            const { data: perfiles } = await supabaseClient.from('perfiles')
                .select('id, nombre')
                .in('id', userIds);
            if (perfiles) {
                perfiles.forEach(p => { userNames[p.id] = p.nombre; });
            }
            userIds.forEach(uid => {
                if (!userNames[uid] && currentUser && uid === currentUser.id) {
                    userNames[uid] = currentUser.nombre || currentUser.email?.split('@')[0] || 'Tu';
                } else if (!userNames[uid]) {
                    userNames[uid] = 'Jugador ' + uid.substring(0, 6);
                }
            });
        } catch(e) { /* ignore */ }

        let html = '';
        // Sort: current user first
        data.sort((a, b) => {
            if (currentUser && a.user_id === currentUser.id) return -1;
            if (currentUser && b.user_id === currentUser.id) return 1;
            return 0;
        });
        data.forEach(row => {
            const uid = row.user_id;
            const marcadores = row.marcadores || {};
            const isMe = currentUser && uid === currentUser.id;
            const name = userNames[uid] || ('Jugador ' + uid.substring(0, 6));
            const predCount = Object.keys(marcadores).length;
            html += '<div class="comunidad-user' + (isMe ? ' comunidad-me' : '') + '">';
            html += '<div class="comunidad-user-header">';
            html += '<span class="comunidad-name">' + (isMe ? '⭐ ' : '👤 ') + name + '</span>';
            html += '<span class="comunidad-count">' + predCount + '/8 partidos</span>';
            html += '</div>';
            html += '<div class="comunidad-user-preds">';
            Object.entries(marcadores).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([idx, scores]) => {
                const prodeMatchesCom = getProdeMatches();
                const match = prodeMatchesCom[parseInt(idx)];
                if (!match) return;
                const eqL = EQUIPOS[match.local] || { corto: match.local, logo: '' };
                const eqV = EQUIPOS[match.visitante] || { corto: match.visitante, logo: '' };
                html += '<div class="comunidad-pred">';
                html += '<img src="' + eqL.logo + '" class="comunidad-logo">';
                html += '<span class="comunidad-team">' + eqL.corto + '</span>';
                html += '<span class="comunidad-score">' + scores.home + ' - ' + scores.away + '</span>';
                html += '<span class="comunidad-team">' + eqV.corto + '</span>';
                html += '<img src="' + eqV.logo + '" class="comunidad-logo">';
                html += '</div>';
            });
            html += '</div></div>';
        });
        container.innerHTML = html;
    } catch (e) {
        console.warn('Error loading comunidad pronosticos:', e);
        container.innerHTML = '<div class="ranking-empty">Error al cargar predicciones.</div>';
    }
}

// ===== PRODE HISTORY & GLOBAL RANKING =====
async function loadProdeHistory() {
    if (!supabaseClient) return;
    const tabsContainer = document.getElementById('prodeHistoryTabs');
    if (!tabsContainer) return;

    // Find completed jornadas that had Prode (with match order available)
    const allResults = getAllResultados();
    const completedJornadaSet = new Set(allResults.map(r => typeof r.jornada === 'number' ? r.jornada : parseInt(r.jornada)));
    const activeJ = getActiveJornada();
    const completedProdeJornadas = [...completedJornadaSet]
        .filter(j => j < activeJ && getProdeMatchOrder(j) !== null)
        .sort((a, b) => b - a);

    if (completedProdeJornadas.length === 0) {
        tabsContainer.innerHTML = '';
        document.getElementById('prodeHistoryContent').innerHTML = '<div class="ranking-empty">Aun no hay jornadas completadas con predicciones.</div>';
        return;
    }

    // Render jornada tabs
    tabsContainer.innerHTML = completedProdeJornadas.map(j =>
        '<button class="prode-history-tab" data-jornada="' + j + '">Fecha ' + j + '</button>'
    ).join('');

    tabsContainer.querySelectorAll('.prode-history-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            tabsContainer.querySelectorAll('.prode-history-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProdeJornadaResults(parseInt(btn.dataset.jornada));
        });
    });

    // Auto-load the most recent completed jornada
    const firstTab = tabsContainer.querySelector('.prode-history-tab');
    if (firstTab) {
        firstTab.classList.add('active');
        loadProdeJornadaResults(completedProdeJornadas[0]);
    }

    // Load global ranking
    loadProdeGlobalRanking(completedProdeJornadas);
}

async function loadProdeJornadaResults(jornada) {
    const container = document.getElementById('prodeHistoryContent');
    if (!container || !supabaseClient) return;

    container.innerHTML = '<div class="ranking-empty">Cargando resultados...</div>';

    const matchOrder = getProdeMatchOrder(jornada);
    if (!matchOrder) { container.innerHTML = '<div class="ranking-empty">No hay datos del Prode para esta jornada.</div>'; return; }

    // Get real results
    const realResults = getAllResultados().filter(r => r.jornada === jornada);

    // Map match order indices to real results
    const matchResults = matchOrder.map(m => {
        return realResults.find(r => r.local === m.local && r.visitante === m.visitante) || null;
    });

    try {
        // Get all predictions for this jornada
        const { data: predictions } = await supabaseClient.from('pronosticos')
            .select('user_id, marcadores')
            .eq('jornada', jornada);

        if (!predictions || predictions.length === 0) {
            container.innerHTML = '<div class="ranking-empty">Nadie envio predicciones para la Fecha ' + jornada + '.</div>';
            return;
        }

        // Get user names
        const userIds = predictions.map(p => p.user_id);
        let userNames = {};
        try {
            const { data: perfiles } = await supabaseClient.from('perfiles')
                .select('id, nombre, equipo')
                .in('id', userIds);
            if (perfiles) perfiles.forEach(p => { userNames[p.id] = { nombre: p.nombre, equipo: p.equipo }; });
        } catch(e) {}

        // Calculate points for each user
        const userScores = predictions.map(pred => {
            const marcadores = pred.marcadores || {};
            let totalPts = 0;
            let exactos = 0;
            let aciertos = 0;
            const matchDetails = [];

            matchOrder.forEach((m, idx) => {
                const real = matchResults[idx];
                const userPred = marcadores[String(idx)];
                let pts = 0;
                let status = 'miss';

                if (real && userPred) {
                    pts = calcMatchPoints(userPred.home, userPred.away, real.gl, real.gv);
                    if (pts === 3) { exactos++; status = 'exact'; }
                    else if (pts === 1) { aciertos++; status = 'correct'; }
                }

                matchDetails.push({
                    local: m.local, visitante: m.visitante,
                    predL: userPred ? userPred.home : '-', predV: userPred ? userPred.away : '-',
                    realL: real ? real.gl : '?', realV: real ? real.gv : '?',
                    pts, status
                });
                totalPts += pts;
            });

            const info = userNames[pred.user_id] || { nombre: 'Jugador ' + pred.user_id.substring(0, 6), equipo: null };
            return {
                user_id: pred.user_id,
                nombre: info.nombre,
                equipo: info.equipo,
                totalPts, exactos, aciertos, matchDetails
            };
        });

        // Sort by points descending
        userScores.sort((a, b) => b.totalPts - a.totalPts || b.exactos - a.exactos);

        // Render results header (real results)
        let html = '<div class="prode-results-real">';
        html += '<h4>Resultados Reales — Fecha ' + jornada + '</h4>';
        html += '<div class="prode-real-matches">';
        matchOrder.forEach((m, idx) => {
            const real = matchResults[idx];
            const eqL = EQUIPOS[m.local] || { corto: m.local, logo: '' };
            const eqV = EQUIPOS[m.visitante] || { corto: m.visitante, logo: '' };
            html += '<div class="prode-real-match">' +
                '<img src="' + eqL.logo + '" class="prode-real-logo">' +
                '<span class="prode-real-team">' + eqL.corto + '</span>' +
                '<span class="prode-real-score">' + (real ? real.gl : '?') + ' - ' + (real ? real.gv : '?') + '</span>' +
                '<span class="prode-real-team">' + eqV.corto + '</span>' +
                '<img src="' + eqV.logo + '" class="prode-real-logo"></div>';
        });
        html += '</div></div>';

        // Render each user's predictions with comparison
        html += '<div class="prode-results-users">';
        userScores.forEach((user, rank) => {
            const isMe = currentUser && user.user_id === currentUser.id;
            const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : (rank + 1);
            const eqTag = user.equipo && EQUIPOS[user.equipo] ? '<span class="prode-user-equipo" style="background:' + EQUIPOS[user.equipo].color1 + '; color:' + EQUIPOS[user.equipo].color2 + ';">' + user.equipo + '</span>' : '';

            html += '<div class="prode-result-user' + (isMe ? ' prode-result-me' : '') + '">';
            html += '<div class="prode-result-user-header" data-uid="' + user.user_id + '">';
            html += '<span class="prode-result-rank">' + medal + '</span>';
            html += '<span class="prode-result-name">' + (isMe ? '⭐ ' : '') + user.nombre + ' ' + eqTag + '</span>';
            html += '<span class="prode-result-stats">' + user.exactos + ' exacto' + (user.exactos !== 1 ? 's' : '') + ' · ' + user.aciertos + ' acierto' + (user.aciertos !== 1 ? 's' : '') + '</span>';
            html += '<span class="prode-result-pts">' + user.totalPts + ' pts</span>';
            html += '<span class="prode-result-toggle">▼</span>';
            html += '</div>';

            // Collapsible detail
            html += '<div class="prode-result-detail hidden" id="prodeDetail_' + user.user_id.substring(0, 8) + '">';
            user.matchDetails.forEach(md => {
                const eqL = EQUIPOS[md.local] || { corto: md.local, logo: '' };
                const eqV = EQUIPOS[md.visitante] || { corto: md.visitante, logo: '' };
                const statusClass = md.status === 'exact' ? 'prode-exact' : md.status === 'correct' ? 'prode-correct' : 'prode-miss';
                const statusLabel = md.status === 'exact' ? '+3' : md.status === 'correct' ? '+1' : '0';
                html += '<div class="prode-detail-match ' + statusClass + '">' +
                    '<span class="prode-detail-teams">' + eqL.corto + ' vs ' + eqV.corto + '</span>' +
                    '<span class="prode-detail-pred">Pred: ' + md.predL + '-' + md.predV + '</span>' +
                    '<span class="prode-detail-real">Real: ' + md.realL + '-' + md.realV + '</span>' +
                    '<span class="prode-detail-pts ' + statusClass + '">' + statusLabel + '</span></div>';
            });
            html += '</div></div>';
        });
        html += '</div>';

        container.innerHTML = html;

        // Add toggle listeners for detail expand
        container.querySelectorAll('.prode-result-user-header').forEach(hdr => {
            hdr.addEventListener('click', () => {
                const uid = hdr.dataset.uid.substring(0, 8);
                const detail = document.getElementById('prodeDetail_' + uid);
                if (detail) {
                    detail.classList.toggle('hidden');
                    hdr.querySelector('.prode-result-toggle').textContent = detail.classList.contains('hidden') ? '▼' : '▲';
                }
            });
        });

    } catch (e) {
        console.warn('Error loading prode jornada results:', e);
        container.innerHTML = '<div class="ranking-empty">Error al cargar resultados.</div>';
    }
}

async function loadProdeGlobalRanking(completedJornadas) {
    const container = document.getElementById('rankingList');
    if (!container || !supabaseClient) return;

    try {
        // Get ALL predictions for completed jornadas
        const { data: allPreds } = await supabaseClient.from('pronosticos')
            .select('user_id, jornada, marcadores')
            .in('jornada', completedJornadas);

        if (!allPreds || allPreds.length === 0) {
            container.innerHTML = '<div class="ranking-empty">Aun no hay predicciones registradas.</div>';
            return;
        }

        // Get user names
        const uniqueUserIds = [...new Set(allPreds.map(p => p.user_id))];
        let userNames = {};
        try {
            const { data: perfiles } = await supabaseClient.from('perfiles')
                .select('id, nombre, equipo')
                .in('id', uniqueUserIds);
            if (perfiles) perfiles.forEach(p => { userNames[p.id] = { nombre: p.nombre, equipo: p.equipo }; });
        } catch(e) {}

        // Calculate total points per user across all jornadas
        const userTotals = {};
        allPreds.forEach(pred => {
            if (!userTotals[pred.user_id]) {
                const info = userNames[pred.user_id] || { nombre: 'Jugador ' + pred.user_id.substring(0, 6), equipo: null };
                userTotals[pred.user_id] = { nombre: info.nombre, equipo: info.equipo, totalPts: 0, exactos: 0, aciertos: 0, jornadas: 0 };
            }

            const matchOrder = getProdeMatchOrder(pred.jornada);
            if (!matchOrder) return;

            const realResults = getAllResultados().filter(r => r.jornada === pred.jornada);
            const marcadores = pred.marcadores || {};
            let hadPreds = false;

            matchOrder.forEach((m, idx) => {
                const real = realResults.find(r => r.local === m.local && r.visitante === m.visitante);
                const userPred = marcadores[String(idx)];
                if (real && userPred) {
                    hadPreds = true;
                    const pts = calcMatchPoints(userPred.home, userPred.away, real.gl, real.gv);
                    userTotals[pred.user_id].totalPts += pts;
                    if (pts === 3) userTotals[pred.user_id].exactos++;
                    else if (pts === 1) userTotals[pred.user_id].aciertos++;
                }
            });
            if (hadPreds) userTotals[pred.user_id].jornadas++;
        });

        // Sort by total points
        const ranking = Object.entries(userTotals)
            .map(([uid, data]) => ({ user_id: uid, ...data }))
            .sort((a, b) => b.totalPts - a.totalPts || b.exactos - a.exactos);

        if (ranking.length === 0) {
            container.innerHTML = '<div class="ranking-empty">Aun no hay puntos calculados.</div>';
            return;
        }

        let html = '<div class="prode-global-ranking">';
        ranking.forEach((user, i) => {
            const isMe = currentUser && user.user_id === currentUser.id;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            const posClass = i === 0 ? ' rank-gold' : i === 1 ? ' rank-silver' : i === 2 ? ' rank-bronze' : '';
            const eqTag = user.equipo && EQUIPOS[user.equipo] ? '<span class="prode-user-equipo" style="background:' + EQUIPOS[user.equipo].color1 + '; color:' + EQUIPOS[user.equipo].color2 + ';">' + user.equipo + '</span>' : '';

            html += '<div class="rank-row' + posClass + (isMe ? ' rank-me' : '') + '">' +
                '<span class="rank-pos">' + (medal || (i + 1)) + '</span>' +
                '<div class="rank-info"><span class="rank-name">' + (isMe ? '⭐ ' : '') + user.nombre + ' ' + eqTag + '</span>' +
                '<span class="rank-detail">' + user.exactos + ' exactos · ' + user.aciertos + ' aciertos · ' + user.jornadas + ' jornada' + (user.jornadas !== 1 ? 's' : '') + '</span></div>' +
                '<span class="rank-pts">' + user.totalPts + '</span></div>';
        });
        html += '</div>';
        container.innerHTML = html;

    } catch (e) {
        console.warn('Error loading global ranking:', e);
        container.innerHTML = '<div class="ranking-empty">Error al cargar ranking.</div>';
    }
}

// ===== CALENDARIO =====
function initCalendario() {
    renderCalendario();
}

function renderCalendario() {
    const container = document.getElementById('calendarioContainer');
    if (!container) return;

    const allResults = getAllResultados();
    const pastJornadas = {};
    allResults.forEach(r => {
        if (!pastJornadas[r.jornada]) pastJornadas[r.jornada] = [];
        pastJornadas[r.jornada].push(r);
    });

    let html = '';

    const maxCompletedJ = Object.keys(pastJornadas).map(Number).sort((a, b) => a - b);
    maxCompletedJ.forEach(j => {
        const matches = pastJornadas[j] || [];
        const firstDate = matches[0] ? matches[0].fecha : '';
        html += '<div class="calendario-jornada">';
        html += '<div class="calendario-header" data-jornada="' + j + '">';
        html += '<span class="calendario-fecha-num">Fecha ' + j + '</span>';
        html += '<span class="calendario-fecha-date">' + formatCalDate(firstDate) + '</span>';
        html += '<span class="calendario-status completada">Completada</span>';
        html += '<span class="calendario-toggle">&#9660;</span>';
        html += '</div>';
        html += '<div class="calendario-body" id="calBody' + j + '" style="display:none">';
        matches.forEach(m => {
            const eqL = EQUIPOS[m.local] || { nombre: m.local, logo: '' };
            const eqV = EQUIPOS[m.visitante] || { nombre: m.visitante, logo: '' };
            html += '<div class="calendario-match resultado">';
            html += '<div class="cal-team cal-home">';
            html += '<img src="' + eqL.logo + '" alt="" class="cal-logo">';
            html += '<span>' + eqL.nombre + '</span></div>';
            html += '<div class="cal-score">' + m.gl + ' - ' + m.gv + '</div>';
            html += '<div class="cal-team cal-away">';
            html += '<span>' + eqV.nombre + '</span>';
            html += '<img src="' + eqV.logo + '" alt="" class="cal-logo"></div>';
            html += '</div>';
        });
        html += '</div></div>';
    });

    CALENDARIO_FECHAS.forEach(cf => {
        // Skip if already in completed results
        if (pastJornadas[cf.fecha]) return;
        const activeJ = getActiveJornada();
        const isActive = cf.fecha === activeJ;
        html += '<div class="calendario-jornada">';
        html += '<div class="calendario-header' + (isActive ? ' activa' : '') + '" data-jornada="' + cf.fecha + '">';
        html += '<span class="calendario-fecha-num">Fecha ' + cf.fecha + '</span>';
        html += '<span class="calendario-fecha-date">' + formatCalDate(cf.inicio) + '</span>';
        html += '<span class="calendario-status ' + (isActive ? 'activa' : 'proxima') + '">' + (isActive ? 'Proxima' : 'Programada') + '</span>';
        html += '<span class="calendario-toggle">&#9660;</span>';
        html += '</div>';
        html += '<div class="calendario-body" id="calBody' + cf.fecha + '" style="display:' + (isActive ? 'block' : 'none') + '">';
        cf.partidos.forEach(m => {
            const eqL = EQUIPOS[m.local] || { nombre: m.local, logo: '' };
            const eqV = EQUIPOS[m.visitante] || { nombre: m.visitante, logo: '' };
            html += '<div class="calendario-match proxima">';
            html += '<div class="cal-team cal-home">';
            html += '<img src="' + eqL.logo + '" alt="" class="cal-logo">';
            html += '<span>' + eqL.nombre + '</span></div>';
            html += '<div class="cal-score cal-vs">vs</div>';
            html += '<div class="cal-team cal-away">';
            html += '<span>' + eqV.nombre + '</span>';
            html += '<img src="' + eqV.logo + '" alt="" class="cal-logo"></div>';
            html += '<div class="cal-date">' + formatCalDate(m.dia) + '</div>';
            html += '</div>';
        });
        html += '</div></div>';
    });

    container.innerHTML = html;

    container.querySelectorAll('.calendario-header').forEach(hdr => {
        hdr.addEventListener('click', () => {
            const j = hdr.dataset.jornada;
            const body = document.getElementById('calBody' + j);
            if (body) {
                body.style.display = body.style.display === 'none' ? 'block' : 'none';
                hdr.querySelector('.calendario-toggle').textContent = body.style.display === 'none' ? '\u25BC' : '\u25B2';
            }
        });
    });
}

function formatCalDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const days = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
}

// ===== AUTH SYSTEM =====
function initAuth() {
    document.getElementById('btnLogin')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btnRegister')?.addEventListener('click', () => openAuthModal('register'));
    document.getElementById('btnPerfilLogin')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btnProdeLogin')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btnProdeRegister')?.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('register'); });
    document.getElementById('btnHinchasLogin')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btnLogout')?.addEventListener('click', logout);
    document.getElementById('modalClose')?.addEventListener('click', closeAuthModal);
    document.getElementById('modalSwitchLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal(authMode === 'login' ? 'register' : 'login');
    });
    document.getElementById('authForm')?.addEventListener('submit', handleAuth);
    document.getElementById('authModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'authModal') closeAuthModal();
    });

    // selectEquipo options are now in the HTML (including Hincha neutral and Otro equipo)
}

function openAuthModal(mode) {
    authMode = mode;
    const m = document.getElementById('authModal');
    document.getElementById('modalTitle').textContent = mode === 'login' ? 'Iniciar Sesion' : 'Crear Cuenta';
    document.getElementById('btnAuthSubmit').textContent = mode === 'login' ? 'Entrar' : 'Registrarme';
    document.getElementById('registerNameGroup').classList.toggle('hidden', mode === 'login');
    document.getElementById('registerTeamGroup').classList.toggle('hidden', mode === 'login');
    if (mode === 'login') document.getElementById('equipoManualGroup').style.display = 'none';
    document.getElementById('modalSwitchText').textContent = mode === 'login' ? 'No tienes cuenta?' : 'Ya tienes cuenta?';
    document.getElementById('modalSwitchLink').textContent = mode === 'login' ? 'Registrate' : 'Inicia sesion';
    m.classList.remove('hidden');
}
function closeAuthModal() { document.getElementById('authModal')?.classList.add('hidden'); }

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    if (!email || !password) { showToast('Completa email y contrasena'); return; }

    if (!supabaseClient) {
        const demoNombre = document.getElementById('inputNombreHincha')?.value || email.split('@')[0];
        let demoEquipo = document.getElementById('selectEquipo')?.value || 'BSC';
        const demoManual = document.getElementById('inputEquipoManual')?.value.trim();
        if (demoEquipo === '_otro' && demoManual) demoEquipo = demoManual;
        currentUser = { id: 'demo', email, nombre: demoNombre, equipo: demoEquipo || 'BSC' };
        onLogin(currentUser); closeAuthModal();
        showToast('Bienvenido, ' + currentUser.nombre + '. (modo demo)');
        return;
    }
    try {
        if (authMode === 'login') {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
                    showToast('Tu email no esta confirmado. Reenviando correo...');
                    try {
                        await supabaseClient.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin } });
                        showToast('Correo de confirmacion reenviado. Revisa tu bandeja de entrada y spam.');
                    } catch (re) { showToast('Revisa tu email para confirmar tu cuenta.'); }
                    return;
                }
                throw error;
            }
            currentUser = { id: data.user.id, email: data.user.email, nombre: data.user.email.split('@')[0] };
            const isNew = await loadProfile(data.user.id);
            onLogin(currentUser); closeAuthModal();
            if (isNew) {
                switchTab('perfil');
                showToast('¡Bienvenido! Completa tu perfil para empezar.');
                showProfileSetupBanner();
            } else {
                showToast('Bienvenido, ' + currentUser.nombre + '.');
            }
        } else {
            const nombre = document.getElementById('inputNombreHincha').value;
            let equipo = document.getElementById('selectEquipo').value;
            const equipoManual = document.getElementById('inputEquipoManual')?.value.trim();
            if (equipo === '_otro' && equipoManual) equipo = equipoManual;
            if (!equipo) equipo = 'NEUTRAL';
            const { data, error } = await supabaseClient.auth.signUp({
                email, password,
                options: { emailRedirectTo: window.location.origin }
            });
            if (error) throw error;
            if (data.user) {
                // Check if email confirmation is required (identities will be empty)
                if (data.user.identities && data.user.identities.length === 0) {
                    showToast('Ya existe una cuenta con este email. Intenta iniciar sesion.');
                    return;
                }
                await supabaseClient.from('perfiles').insert({
                    id: data.user.id, nombre: nombre || email.split('@')[0],
                    username: email.split('@')[0], equipo: equipo
                });
                if (data.session) {
                    // Auto-confirmed: user is logged in
                    currentUser = { id: data.user.id, email, nombre: nombre || email.split('@')[0], equipo: equipo };
                    onLogin(currentUser); closeAuthModal();
                    showToast('Cuenta creada. Bienvenido, ' + currentUser.nombre + '.');
                } else {
                    // Email confirmation required
                    showToast('Cuenta creada. Revisa tu email para confirmar.');
                    closeAuthModal();
                }
            }
        }
    } catch (err) { showToast(err.message || 'Error de autenticacion'); console.error(err); }
}

async function loadProfile(userId) {
    if (!supabaseClient) return false;
    let isNewProfile = false;
    try {
        const { data, error } = await supabaseClient.from('perfiles').select('*').eq('id', userId).single();
        if (data) {
            currentUser.nombre = data.nombre || currentUser.nombre;
            currentUser.equipo = data.equipo || 'BSC';
            currentUser.username = data.username || currentUser.nombre;
        } else if (!data) {
            // Profile doesn't exist - auto-create it so FK constraints work
            console.log('No profile found, creating one for user:', userId);
            const defaultName = currentUser.email ? currentUser.email.split('@')[0] : 'Usuario';
            const { error: insertErr } = await supabaseClient.from('perfiles').insert({
                id: userId,
                nombre: defaultName,
                username: defaultName,
                equipo: 'BSC'
            });
            if (insertErr) {
                console.error('Error creating profile:', insertErr);
            } else {
                console.log('Profile auto-created for user:', userId);
                currentUser.nombre = defaultName;
                currentUser.username = defaultName;
                currentUser.equipo = 'BSC';
                isNewProfile = true;
            }
        }
    } catch (e) { console.warn('Profile load error:', e); }
    return isNewProfile;
}

async function checkSession() {
    if (!supabaseClient) return;
    try {
        // Handle email confirmation callback (token in URL hash)
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery'))) {
            // Supabase client auto-processes the hash on init, just wait a moment
            await new Promise(r => setTimeout(r, 500));
            // Clean up URL
            if (window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
            currentUser = { id: session.user.id, email: session.user.email, nombre: session.user.email.split('@')[0] };
            const isNew = await loadProfile(session.user.id);
            onLogin(currentUser);
            if (isNew) {
                switchTab('perfil');
                showToast('¡Bienvenido! Completa tu perfil para empezar.');
                showProfileSetupBanner();
            } else {
                showToast('Sesion activa. Bienvenido, ' + currentUser.nombre + '.');
            }
        }
    } catch (e) { console.warn('Session check:', e); }

    // Listen for auth state changes (e.g., after email confirmation redirect)
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user && !currentUser) {
                currentUser = { id: session.user.id, email: session.user.email, nombre: session.user.email.split('@')[0] };
                const isNew = await loadProfile(session.user.id);
                onLogin(currentUser);
                if (isNew) {
                    switchTab('perfil');
                    showToast('¡Bienvenido! Completa tu perfil para empezar.');
                    showProfileSetupBanner();
                } else {
                    showToast('Email confirmado. Bienvenido, ' + currentUser.nombre + '!');
                }
            }
        });
    }
}

function onLogin(user) {
    document.getElementById('authArea')?.classList.add('hidden');
    document.getElementById('userArea')?.classList.remove('hidden');
    document.getElementById('userName').textContent = user.nombre;

    // Prode gate
    updateProdeGate();

    // Hinchas gate
    document.getElementById('hinchasGate')?.classList.add('hidden');
    document.getElementById('hinchasContent')?.classList.remove('hidden');

    // Perfil
    document.getElementById('perfilLoginPrompt')?.classList.add('hidden');
    document.getElementById('perfilContent')?.classList.remove('hidden');
    document.getElementById('perfilNombre').textContent = user.nombre;
    const eq = EQUIPOS[user.equipo];
    document.getElementById('perfilEquipo').textContent = eq ? eq.nombre : (user.equipo || 'Sin equipo');

    // Load hinchas data
    loadAsistencias();
    updateRivalSelect();
    loadHinchaProfilesEstadio();
    fillPerfilForm();

    // Editorial: show editor if admin
    const editorPanel = document.getElementById('editorialEditor');
    if (editorPanel) {
        if (user.id === ADMIN_USER_ID) editorPanel.classList.remove('hidden');
        else editorPanel.classList.add('hidden');
    }
    loadEditoriales();
    loadLigas(); // Reload leagues after login
    trackVisit(); // Register visit after login

    // Admin tab: show only for admin
    if (user.id === ADMIN_USER_ID) {
        document.getElementById('adminTabBtn')?.classList.remove('hidden');
        initAdminPanel();
    }
}

function onLogout() {
    document.getElementById('authArea')?.classList.remove('hidden');
    document.getElementById('userArea')?.classList.add('hidden');
    document.getElementById('perfilLoginPrompt')?.classList.remove('hidden');
    document.getElementById('perfilContent')?.classList.add('hidden');
    document.getElementById('hinchasGate')?.classList.remove('hidden');
    document.getElementById('hinchasContent')?.classList.add('hidden');
    updateProdeGate();
}

async function logout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    currentUser = null; userAsistencias = [];
    onLogout();
    showToast('Sesion cerrada correctamente.');
}

// ===== LIGAS PRIVADAS =====
let localLigas = [];
let currentLiga = null;
let currentLigaTab = 'ranking';

function initLigas() {
    document.getElementById('btnCrearLiga')?.addEventListener('click', () => {
        if (!currentUser) { showToast('Inicia sesion para crear una liga'); openAuthModal('login'); return; }
        document.getElementById('crearLigaModal')?.classList.remove('hidden');
    });
    document.getElementById('ligaModalClose')?.addEventListener('click', () => {
        document.getElementById('crearLigaModal')?.classList.add('hidden');
    });
    document.getElementById('crearLigaModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'crearLigaModal') document.getElementById('crearLigaModal')?.classList.add('hidden');
    });
    document.getElementById('crearLigaForm')?.addEventListener('submit', crearLiga);
    document.getElementById('btnUnirseLiga')?.addEventListener('click', unirseLiga);
    document.getElementById('btnVolverLigas')?.addEventListener('click', () => {
        document.getElementById('ligaDetail')?.classList.add('hidden');
        document.getElementById('ligasList')?.parentElement.querySelector('.ligas-actions')?.classList.remove('hidden');
        document.getElementById('ligasList')?.classList.remove('hidden');
        currentLiga = null;
    });
    loadLigas();
}

async function crearLiga(e) {
    e.preventDefault();
    if (!currentUser) { showToast('Inicia sesion para crear una liga'); openAuthModal('login'); return; }
    const nombre = document.getElementById('inputNombreLiga').value.trim();
    if (!nombre) return;
    const codigo = generarCodigo();
    let success = false;

    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.from('ligas').insert({
                nombre, codigo, creador_id: currentUser.id, created_at: new Date().toISOString()
            }).select().single();
            if (error) throw error;
            await supabaseClient.from('liga_miembros').insert({ liga_id: data.id, user_id: currentUser.id });
            success = true;
        } catch (err) {
            console.warn('Supabase ligas insert failed, using local storage:', err);
            const liga = { id: 'local_' + Date.now(), nombre, codigo, creador_id: currentUser.id, miembros: [{ user_id: currentUser.id, nombre: currentUser.user_metadata?.nombre || currentUser.email?.split('@')[0] || 'Tu' }] };
            localLigas.push(liga);
            success = true;
        }
    } else {
        const liga = { id: 'local_' + Date.now(), nombre, codigo, creador_id: currentUser.id, miembros: [{ user_id: currentUser.id, nombre: currentUser.user_metadata?.nombre || currentUser.email?.split('@')[0] || 'Tu' }] };
        localLigas.push(liga);
        success = true;
    }

    if (success) {
        showToast('Liga "' + nombre + '" creada. Codigo: ' + codigo);
        document.getElementById('crearLigaModal')?.classList.add('hidden');
        document.getElementById('inputNombreLiga').value = '';
        loadLigas();
    }
}

async function unirseLiga() {
    if (!currentUser) { showToast('Inicia sesion primero'); openAuthModal('login'); return; }
    const codigo = document.getElementById('inputCodigoLiga')?.value.trim();
    if (!codigo) { showToast('Ingresa un codigo de liga'); return; }

    // Check local ligas first
    const localLiga = localLigas.find(l => l.codigo === codigo.toUpperCase());
    if (localLiga) {
        if (!localLiga.miembros) localLiga.miembros = [];
        if (!localLiga.miembros.find(m => m.user_id === currentUser.id)) {
            localLiga.miembros.push({ user_id: currentUser.id, nombre: currentUser.user_metadata?.nombre || currentUser.email?.split('@')[0] || 'Tu' });
        }
        showToast('Te has unido a "' + localLiga.nombre + '".');
        document.getElementById('inputCodigoLiga').value = '';
        loadLigas();
        return;
    }

    if (supabaseClient) {
        try {
            const { data: liga, error } = await supabaseClient.from('ligas').select('id, nombre').eq('codigo', codigo.toUpperCase()).single();
            if (error || !liga) { showToast('Codigo no encontrado'); return; }
            await supabaseClient.from('liga_miembros').insert({ liga_id: liga.id, user_id: currentUser.id });
            showToast('Te has unido a "' + liga.nombre + '".');
            document.getElementById('inputCodigoLiga').value = '';
            loadLigas();
        } catch (err) { showToast('Error al unirse'); console.error(err); }
    } else { showToast('Codigo no encontrado'); }
}

async function eliminarLiga(liga) {
    if (!currentUser || currentUser.id !== ADMIN_USER_ID) { showToast('No tienes permisos.'); return; }
    if (!confirm('¿Seguro que quieres eliminar la liga "' + liga.nombre + '"? Esta accion no se puede deshacer.')) return;

    if (supabaseClient && !String(liga.id).startsWith('local_')) {
        try {
            // Delete members first (FK), then the league
            await supabaseClient.from('liga_miembros').delete().eq('liga_id', liga.id);
            const { error } = await supabaseClient.from('ligas').delete().eq('id', liga.id);
            if (error) throw error;
        } catch (e) { showToast('Error al eliminar: ' + e.message); console.error(e); return; }
    }

    // Remove from local
    localLigas = localLigas.filter(l => l.id !== liga.id);
    currentLiga = null;

    // Return to list
    document.getElementById('ligaDetail')?.classList.add('hidden');
    document.getElementById('ligasList')?.classList.remove('hidden');
    document.getElementById('ligasList')?.parentElement.querySelector('.ligas-actions')?.classList.remove('hidden');
    showToast('Liga "' + liga.nombre + '" eliminada.');
    loadLigas();
}

async function loadLigas() {
    if (!currentUser) return;
    const container = document.getElementById('ligasList');
    if (!container) return;
    let allLigas = [];

    if (supabaseClient) {
        try {
            const { data: memberships } = await supabaseClient.from('liga_miembros')
                .select('liga_id, ligas(id, nombre, codigo)').eq('user_id', currentUser.id);
            if (memberships && memberships.length > 0) {
                allLigas = memberships.map(m => m.ligas).filter(Boolean);
            }
        } catch (e) { console.warn('Ligas load from Supabase failed:', e); }
    }

    // Add local ligas where user is member
    localLigas.forEach(l => {
        if (!allLigas.find(x => x.codigo === l.codigo)) {
            if (l.creador_id === currentUser.id || (l.miembros && l.miembros.find(m => m.user_id === currentUser.id))) {
                allLigas.push(l);
            }
        }
    });

    if (allLigas.length > 0) {
        container.innerHTML = allLigas.map(l =>
            '<div class="liga-card" data-liga-id="' + l.id + '" data-liga-codigo="' + l.codigo + '">' +
            '<div class="liga-card-info"><h4>' + l.nombre + '</h4><p>Codigo: ' + l.codigo + '</p></div>' +
            '<span class="liga-card-arrow">&#8594;</span></div>'
        ).join('');
        container.querySelectorAll('.liga-card').forEach(card => {
            card.addEventListener('click', () => {
                const ligaId = card.dataset.ligaId;
                const liga = allLigas.find(l => String(l.id) === ligaId);
                if (liga) openLigaDetail(liga);
            });
        });
    } else {
        container.innerHTML = '<div class="empty-state-sm">No tienes ligas aun. Crea una o unete con un codigo.</div>';
    }
}

async function openLigaDetail(liga) {
    currentLiga = liga;
    currentLigaTab = 'ranking';
    document.getElementById('ligasList')?.classList.add('hidden');
    document.getElementById('ligasList')?.parentElement.querySelector('.ligas-actions')?.classList.add('hidden');
    const detail = document.getElementById('ligaDetail');
    if (!detail) return;
    detail.classList.remove('hidden');

    const header = document.getElementById('ligaHeader');
    if (header) {
        const adminDeleteBtn = (currentUser && currentUser.id === ADMIN_USER_ID)
            ? '<button class="btn btn-sm" id="btnEliminarLiga" style="background:#e74c3c; color:#fff; border:none; border-radius:6px; padding:4px 12px; font-size:0.75rem; cursor:pointer; margin-left:8px;">🗑 Eliminar Liga</button>'
            : '';
        header.innerHTML = '<div style="display:flex; align-items:center; justify-content:space-between;">' +
            '<h2>' + liga.nombre + '</h2>' + adminDeleteBtn + '</div>' +
            '<div class="liga-meta"><span class="liga-codigo-badge">Codigo: ' + liga.codigo + '</span></div>' +
            '<div class="liga-tabs">' +
            '<button class="liga-tab-btn active" data-ltab="ranking">Ranking</button>' +
            '<button class="liga-tab-btn" data-ltab="jornadas">Jornadas</button>' +
            '<button class="liga-tab-btn" data-ltab="miembros">Miembros</button>' +
            '</div>';
        header.querySelectorAll('.liga-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                header.querySelectorAll('.liga-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLigaTab = btn.dataset.ltab;
                renderLigaTab();
            });
        });
        // Admin delete handler
        document.getElementById('btnEliminarLiga')?.addEventListener('click', () => eliminarLiga(liga));
    }

    await loadLigaMembers(liga);
    renderLigaTab();
}

async function loadLigaMembers(liga) {
    liga._members = [];

    // For local ligas, use stored miembros
    if (String(liga.id).startsWith('local_')) {
        liga._members = (liga.miembros || []).map(m => ({
            user_id: m.user_id,
            nombre: m.nombre || 'Usuario',
            puntos: 0
        }));
        // Calculate prode points from local data
        await calcLigaMemberPoints(liga);
        return;
    }

    // From Supabase: get members with profile info
    if (supabaseClient) {
        try {
            const { data: members } = await supabaseClient.from('liga_miembros')
                .select('user_id, perfiles(id, nombre, equipo)')
                .eq('liga_id', liga.id);
            if (members) {
                liga._members = members.map(m => ({
                    user_id: m.user_id,
                    nombre: m.perfiles?.nombre || 'Usuario',
                    equipo: m.perfiles?.equipo || null,
                    puntos: 0
                }));
            }
        } catch (e) { console.warn('Error loading liga members:', e); }
    }

    await calcLigaMemberPoints(liga);
}

// Calculate prode points for all liga members across all completed jornadas
async function calcLigaMemberPoints(liga) {
    if (!liga._members || liga._members.length === 0) return;

    // Get all completed jornadas dynamically
    const allResults = getAllResultados();
    const completedJornadas = [];
    const jornadas = [...new Set(allResults.map(r => r.jornada))].sort((a, b) => a - b);
    jornadas.forEach(j => {
        const matches = allResults.filter(r => r.jornada === j);
        if (matches.length > 0) completedJornadas.push({ jornada: j, matches });
    });

    // Get pronosticos for all members of this liga
    if (supabaseClient && !String(liga.id).startsWith('local_')) {
        const userIds = liga._members.map(m => m.user_id);
        try {
            const { data: pronosticos } = await supabaseClient.from('pronosticos')
                .select('user_id, jornada, marcadores')
                .in('user_id', userIds)
                .in('jornada', completedJornadas.map(j => j.jornada));

            if (pronosticos) {
                liga._members.forEach(member => {
                    let totalPts = 0;
                    member.jornada_pts = {};
                    completedJornadas.forEach(cj => {
                        let jornadaPts = 0;
                        const myPred = pronosticos.find(p => p.user_id === member.user_id && p.jornada === cj.jornada);
                        if (myPred && myPred.marcadores) {
                            Object.entries(myPred.marcadores).forEach(([idx, scores]) => {
                                const match = cj.matches[parseInt(idx)];
                                if (match) {
                                    jornadaPts += calcMatchPoints(scores.home, scores.away, match.gl, match.gv);
                                }
                            });
                        }
                        member.jornada_pts[cj.jornada] = jornadaPts;
                        totalPts += jornadaPts;
                    });
                    member.puntos = totalPts;
                });
            }
        } catch (e) { console.warn('Error loading pronosticos:', e); }
    }

    // Sort by points descending
    liga._members.sort((a, b) => b.puntos - a.puntos);
}

// +3 pts for exact score, +1 pt for correct result (win/draw/loss)
function calcMatchPoints(predL, predV, realL, realV) {
    predL = parseInt(predL); predV = parseInt(predV);
    if (isNaN(predL) || isNaN(predV)) return 0;
    // Exact score
    if (predL === realL && predV === realV) return 3;
    // Correct result (tendency)
    const predResult = predL > predV ? 'L' : predL < predV ? 'V' : 'E';
    const realResult = realL > realV ? 'L' : realL < realV ? 'V' : 'E';
    if (predResult === realResult) return 1;
    return 0;
}

function renderLigaTab() {
    const content = document.getElementById('ligaTabContent');
    if (!content || !currentLiga) return;

    if (currentLigaTab === 'ranking') {
        renderLigaRanking(content);
    } else if (currentLigaTab === 'jornadas') {
        renderLigaJornadas(content);
    } else if (currentLigaTab === 'miembros') {
        renderLigaMiembros(content);
    }
}

function renderLigaRanking(container) {
    const members = currentLiga._members || [];
    if (members.length === 0) {
        container.innerHTML = '<div class="empty-state-sm">No hay miembros en esta liga.</div>';
        return;
    }

    let html = '<div class="liga-ranking">';
    html += '<div class="ranking-header-row"><span class="rk-pos">#</span><span class="rk-name">Jugador</span><span class="rk-pts">Pts</span></div>';
    members.forEach((m, i) => {
        const posClass = i === 0 ? ' rk-gold' : i === 1 ? ' rk-silver' : i === 2 ? ' rk-bronze' : '';
        const isMe = currentUser && m.user_id === currentUser.id;
        html += '<div class="ranking-row' + posClass + (isMe ? ' rk-me' : '') + '">' +
            '<span class="rk-pos">' + (i + 1) + '</span>' +
            '<span class="rk-name">' + m.nombre + (isMe ? ' <em>(tu)</em>' : '') + '</span>' +
            '<span class="rk-pts">' + m.puntos + '</span></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderLigaJornadas(container) {
    const allResults = getAllResultados();
    const activeJ = getActiveJornada();
    const maxJornada = activeJ;
    let html = '<div class="liga-jornadas">';

    for (let j = maxJornada; j >= 1; j--) {
        const matches = allResults.filter(r => r.jornada === j);
        const isActive = j === activeJ;
        const isFuture = matches.length === 0 && isActive;

        html += '<div class="jornada-block' + (isActive ? ' jornada-active' : '') + '">';
        html += '<div class="jornada-header" data-jornada="' + j + '">' +
            '<h4>Jornada ' + j + (isActive ? ' <span class="jornada-live">EN CURSO</span>' : '') + '</h4>' +
            '<span class="jornada-toggle">&#9660;</span></div>';
        html += '<div class="jornada-body hidden" id="jornadaBody' + j + '">';

        if (isActive) {
            // Jornada activa - show prode matches
            html += '<div class="jornada-matches">';
            getProdeMatches().forEach(m => {
                const loc = EQUIPOS[m.local] || { corto: m.local, logo: '' };
                const vis = EQUIPOS[m.visitante] || { corto: m.visitante, logo: '' };
                html += '<div class="jornada-match">' +
                    '<span class="jm-team"><img src="' + loc.logo + '" class="jm-logo"> ' + loc.corto + '</span>' +
                    '<span class="jm-score">vs</span>' +
                    '<span class="jm-team">' + vis.corto + ' <img src="' + vis.logo + '" class="jm-logo"></span></div>';
            });
            html += '</div>';
            // Show member predictions summary
            html += '<div class="jornada-predictions"><p class="jornada-info">Predicciones abiertas — ve al tab Prode para ingresar las tuyas.</p></div>';
        } else if (matches.length > 0) {
            // Completed jornada
            html += '<div class="jornada-matches">';
            matches.forEach((m, idx) => {
                const loc = EQUIPOS[m.local] || { corto: m.local, logo: '' };
                const vis = EQUIPOS[m.visitante] || { corto: m.visitante, logo: '' };
                html += '<div class="jornada-match">' +
                    '<span class="jm-team"><img src="' + loc.logo + '" class="jm-logo"> ' + loc.corto + '</span>' +
                    '<span class="jm-score jm-final">' + m.gl + ' - ' + m.gv + '</span>' +
                    '<span class="jm-team">' + vis.corto + ' <img src="' + vis.logo + '" class="jm-logo"></span></div>';
            });
            html += '</div>';
            // Points earned by members this jornada
            const members = currentLiga._members || [];
            const jPts = members.filter(m => m.jornada_pts && m.jornada_pts[j] !== undefined)
                .map(m => ({ nombre: m.nombre, pts: m.jornada_pts[j], isMe: currentUser && m.user_id === currentUser.id }))
                .sort((a, b) => b.pts - a.pts);
            if (jPts.length > 0 && jPts.some(p => p.pts > 0)) {
                html += '<div class="jornada-pts-summary"><h5>Puntos esta jornada</h5>';
                jPts.forEach(p => {
                    html += '<div class="jpts-row' + (p.isMe ? ' rk-me' : '') + '"><span>' + p.nombre + '</span><span class="jpts-val">' + (p.pts > 0 ? '+' : '') + p.pts + '</span></div>';
                });
                html += '</div>';
            }
        }

        html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Toggle jornada expand/collapse
    container.querySelectorAll('.jornada-header').forEach(hdr => {
        hdr.addEventListener('click', () => {
            const j = hdr.dataset.jornada;
            const body = document.getElementById('jornadaBody' + j);
            if (body) {
                body.classList.toggle('hidden');
                hdr.querySelector('.jornada-toggle').textContent = body.classList.contains('hidden') ? '\u25BC' : '\u25B2';
            }
        });
    });

    // Auto-expand active jornada
    const activeBody = document.getElementById('jornadaBody' + activeJ);
    if (activeBody) {
        activeBody.classList.remove('hidden');
        const hdr = container.querySelector('[data-jornada="' + activeJ + '"] .jornada-toggle');
        if (hdr) hdr.textContent = '\u25B2';
    }
}

function renderLigaMiembros(container) {
    const members = currentLiga._members || [];
    if (members.length === 0) {
        container.innerHTML = '<div class="empty-state-sm">No hay miembros en esta liga.</div>';
        return;
    }

    let html = '<div class="liga-miembros-list">';
    html += '<div class="miembros-count">' + members.length + ' miembro' + (members.length !== 1 ? 's' : '') + '</div>';
    members.forEach((m, i) => {
        const isMe = currentUser && m.user_id === currentUser.id;
        html += '<div class="miembro-row' + (isMe ? ' rk-me' : '') + '">' +
            '<span class="miembro-pos">' + (i + 1) + '</span>' +
            '<div class="miembro-info"><span class="miembro-nombre">' + m.nombre + (isMe ? ' <em>(tu)</em>' : '') + '</span></div>' +
            '<span class="miembro-pts">' + m.puntos + ' pts</span></div>';
    });

    // Share code section
    html += '<div class="liga-share"><p>Comparte el codigo para invitar amigos:</p>' +
        '<div class="liga-share-code"><span>' + currentLiga.codigo + '</span>' +
        '<button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText(\'' + currentLiga.codigo + '\');showToast(\'Codigo copiado\')">Copiar</button></div></div>';
    html += '</div>';
    container.innerHTML = html;
}

function generarCodigo() {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let r = '';
    for (let i = 0; i < 6; i++) r += c.charAt(Math.floor(Math.random() * c.length));
    return r;
}

// ===== HINCHAS - REGISTRO DE ESTADIO =====
function initHinchas() {
    document.getElementById('btnRegistrarJornada')?.addEventListener('click', togglePastMatches);
    document.getElementById('btnRegistrarManual')?.addEventListener('click', toggleManualForm);
    document.getElementById('btnCerrarJornadas')?.addEventListener('click', () => {
        document.getElementById('pastMatchesPanel')?.classList.add('hidden');
    });
    document.getElementById('btnCerrarManual')?.addEventListener('click', () => {
        document.getElementById('manualFormPanel')?.classList.add('hidden');
    });
    document.getElementById('manualAsistenciaForm')?.addEventListener('submit', registrarManual);
}

function updateRivalSelect() {
    const select = document.getElementById('selectRival');
    if (!select || !currentUser) return;
    select.innerHTML = '';
    Object.entries(EQUIPOS).forEach(([id, eq]) => {
        if (id !== currentUser.equipo) {
            const opt = document.createElement('option');
            opt.value = id; opt.textContent = eq.nombre;
            select.appendChild(opt);
        }
    });
    // Add manual entry option for teams not in the list
    const optManual = document.createElement('option');
    optManual.value = '_manual'; optManual.textContent = '— Otro equipo (escribir) —';
    select.appendChild(optManual);
    // Toggle manual rival input visibility
    select.addEventListener('change', () => {
        const manualGroup = document.getElementById('rivalManualGroup');
        if (manualGroup) manualGroup.style.display = select.value === '_manual' ? '' : 'none';
    });
}

function togglePastMatches() {
    const panel = document.getElementById('pastMatchesPanel');
    const manual = document.getElementById('manualFormPanel');
    manual?.classList.add('hidden');
    panel?.classList.toggle('hidden');
    if (!panel?.classList.contains('hidden')) renderPastMatches();
}

function toggleManualForm() {
    const panel = document.getElementById('manualFormPanel');
    const past = document.getElementById('pastMatchesPanel');
    past?.classList.add('hidden');
    panel?.classList.toggle('hidden');
    // Set default date to today
    const dateInput = document.getElementById('inputFechaPartido');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
}

function renderPastMatches() {
    const list = document.getElementById('pastMatchesList');
    const nameSpan = document.getElementById('miEquipoNombre');
    if (!list || !currentUser) return;

    const miEquipo = currentUser.equipo || 'BSC';
    const eq = EQUIPOS[miEquipo];
    if (nameSpan) nameSpan.textContent = eq ? eq.nombre : miEquipo;

    // Filter matches involving my team
    const misPartidos = getAllResultados().filter(r => r.local === miEquipo || r.visitante === miEquipo);
    const registeredIds = new Set(userAsistencias.map(a => a.jornada + '-' + a.fecha));

    if (misPartidos.length === 0) {
        list.innerHTML = '<div class="empty-state-sm">No hay partidos registrados para tu equipo</div>';
        return;
    }

    list.innerHTML = misPartidos.reverse().map(r => {
        const esLocal = r.local === miEquipo;
        const rival = esLocal ? r.visitante : r.local;
        const rivalEq = EQUIPOS[rival] || { nombre: rival };
        const miGol = esLocal ? r.gl : r.gv;
        const rivalGol = esLocal ? r.gv : r.gl;
        const resultado = miGol > rivalGol ? 'W' : miGol < rivalGol ? 'L' : 'D';
        const resultLabel = resultado === 'W' ? 'Victoria' : resultado === 'L' ? 'Derrota' : 'Empate';
        const isRegistered = registeredIds.has(r.jornada + '-' + r.fecha);
        const regClass = isRegistered ? ' registered' : '';

        return '<div class="past-match-item' + regClass + '" data-jornada="' + r.jornada + '" data-fecha="' + r.fecha + '">' +
            '<div><div class="past-match-info">' + (esLocal ? 'Local' : 'Visitante') + ' vs ' + rivalEq.nombre + '</div>' +
            '<div class="past-match-date">J' + r.jornada + ' - ' + r.fecha + ' - ' + resultLabel + '</div></div>' +
            '<div class="past-match-score">' + miGol + ' - ' + rivalGol + '</div>' +
            (isRegistered ? '' : '<button class="past-match-btn" onclick="registrarDeJornada(' + r.jornada + ',\'' + r.fecha + '\',\'' + r.local + '\',\'' + r.visitante + '\',' + r.gl + ',' + r.gv + ')">Asisti</button>') +
            '</div>';
    }).join('');
}

async function registrarDeJornada(jornada, fecha, local, visitante, gl, gv) {
    if (!currentUser) return;
    const miEquipo = currentUser.equipo || 'BSC';
    const esLocal = local === miEquipo;
    const miGol = esLocal ? gl : gv;
    const rivalGol = esLocal ? gv : gl;
    const resultado = miGol > rivalGol ? 'W' : miGol < rivalGol ? 'L' : 'D';
    const rival = esLocal ? visitante : local;

    const asistencia = {
        user_id: currentUser.id, fecha, jornada,
        equipo_local: local, equipo_visitante: visitante,
        goles_local: gl, goles_visitante: gv,
        resultado
    };

    if (supabaseClient) {
        try {
            const { data: inserted, error } = await supabaseClient.from('asistencias_estadio').insert(asistencia).select();
            if (error) { showToast('Error al registrar: ' + error.message); console.error('Insert error:', error); return; }
            if (inserted && inserted[0]) asistencia.id = inserted[0].id;
        } catch (e) { console.error('Insert error:', e); showToast('Error al registrar asistencia'); return; }
    }

    userAsistencias.push(asistencia);
    updateEstadioStats();
    renderPastMatches();
    renderAttendanceHistory();
    showToast('Asistencia registrada. Resultado: ' + (resultado === 'W' ? 'Victoria' : resultado === 'D' ? 'Empate' : 'Derrota'));
}

async function registrarManual(e) {
    e.preventDefault();
    if (!currentUser) return;
    const miEquipo = currentUser.equipo || 'BSC';
    const fecha = document.getElementById('inputFechaPartido').value;
    const jornadaRaw = document.getElementById('inputJornadaPartido').value.trim();
    const jornada = jornadaRaw ? parseInt(jornadaRaw) : 0;
    const tipoTorneo = document.getElementById('selectTipoTorneo')?.value || 'LigaPro';
    const esLocal = document.getElementById('selectLocalVisitante').value === 'local';
    const rival = document.getElementById('selectRival').value;
    const rivalManual = document.getElementById('inputRivalManual')?.value.trim() || '';
    const rivalFinal = rival === '_manual' ? rivalManual : rival;
    const miGol = parseInt(document.getElementById('inputGolesMi').value);
    const rivalGol = parseInt(document.getElementById('inputGolesRival').value);

    if (!fecha || isNaN(miGol) || isNaN(rivalGol)) { showToast('Completa fecha y goles'); return; }
    if (rival === '_manual' && !rivalManual) { showToast('Escribe el nombre del rival'); return; }

    const resultado = miGol > rivalGol ? 'W' : miGol < rivalGol ? 'L' : 'D';
    const local = esLocal ? miEquipo : rivalFinal;
    const visitante = esLocal ? rivalFinal : miEquipo;
    const gl = esLocal ? miGol : rivalGol;
    const gv = esLocal ? rivalGol : miGol;

    const asistencia = {
        user_id: currentUser.id, fecha, jornada,
        equipo_local: local, equipo_visitante: visitante,
        goles_local: gl, goles_visitante: gv,
        resultado
    };

    if (supabaseClient) {
        try {
            const { data: inserted, error } = await supabaseClient.from('asistencias_estadio').insert(asistencia).select();
            if (error) { showToast('Error al registrar: ' + error.message); console.error('Insert error:', error); return; }
            if (inserted && inserted[0]) asistencia.id = inserted[0].id;
        } catch (e) { console.error('Insert error:', e); showToast('Error al registrar asistencia'); return; }
    }

    userAsistencias.push(asistencia);
    updateEstadioStats();
    renderAttendanceHistory();
    document.getElementById('manualFormPanel')?.classList.add('hidden');
    document.getElementById('manualAsistenciaForm')?.reset();
    showToast('Asistencia registrada. Resultado: ' + (resultado === 'W' ? 'Victoria' : resultado === 'D' ? 'Empate' : 'Derrota'));
}

async function loadAsistencias() {
    if (!currentUser) return;
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.from('asistencias_estadio')
                .select('*').eq('user_id', currentUser.id).order('fecha', { ascending: false });
            userAsistencias = data || [];
        } catch (e) { console.warn('Load asistencias error:', e); userAsistencias = []; }
    }
    updateEstadioStats();
    renderAttendanceHistory();
}

function updateEstadioStats() {
    const total = userAsistencias.length;
    const wins = userAsistencias.filter(a => a.resultado === 'W').length;
    const draws = userAsistencias.filter(a => a.resultado === 'D').length;
    const losses = userAsistencias.filter(a => a.resultado === 'L').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statWins').textContent = wins;
    document.getElementById('statDraws').textContent = draws;
    document.getElementById('statLosses').textContent = losses;
    document.getElementById('perfilPartidos').textContent = total;

    // Win rate bar
    if (total > 0) {
        const wp = Math.round(wins / total * 100);
        const dp = Math.round(draws / total * 100);
        const lp = 100 - wp - dp;
        document.getElementById('wrWins').style.width = wp + '%';
        document.getElementById('wrDraws').style.width = dp + '%';
        document.getElementById('wrLosses').style.width = lp + '%';
        document.getElementById('wrWinPct').textContent = wp + '% V';
        document.getElementById('wrDrawPct').textContent = dp + '% E';
        document.getElementById('wrLossPct').textContent = lp + '% D';
    }

    // Saladez meter
    updateLuckMeter(total, wins, draws, losses);
}

function updateLuckMeter(total, wins, draws, losses) {
    if (total === 0) return;
    const lossPct = Math.round(losses / total * 100);
    const luckScore = Math.min(100, Math.max(5, lossPct + Math.floor(draws / total * 30)));
    const fill = document.getElementById('luckFill');
    const label = document.getElementById('luckLabel');

    if (fill) fill.style.width = luckScore + '%';
    let texto = '';
    if (luckScore < 20) texto = 'Excelente: tu equipo tiene un rendimiento sobresaliente cuando asistes.';
    else if (luckScore < 40) texto = 'Bueno: resultados positivos en la mayoria de tus asistencias.';
    else if (luckScore < 60) texto = 'Regular: resultados mixtos. Tu presencia no inclina la balanza de forma clara.';
    else if (luckScore < 80) texto = 'Desfavorable: tu equipo tiende a obtener malos resultados cuando asistes.';
    else texto = 'Critico: la correlacion entre tu asistencia y las derrotas es notable.';
    if (label) label.textContent = luckScore + '% - ' + texto;

    const verdict = document.getElementById('verdictText');
    const perfilVerdict = document.getElementById('perfilVerdictBox');
    const verdicts = [
        'Los datos indican que tu equipo rinde de forma excepcional cuando asistes al estadio. Tu presencia parece ser un factor positivo. Continua asistiendo.',
        'Los resultados cuando asistes son variados, con una ligera tendencia positiva. No hay una correlacion clara entre tu presencia y el rendimiento del equipo.',
        'Se observa una tendencia negativa en los resultados cuando asistes. Esto podria ser coincidencia, pero los numeros son desfavorables.',
        'Existe una correlacion significativa entre tu asistencia y los resultados adversos de tu equipo. Estadisticamente, los datos sugieren considerar alternativas.'
    ];
    const idx = luckScore < 25 ? 0 : luckScore < 50 ? 1 : luckScore < 75 ? 2 : 3;
    if (verdict) verdict.textContent = verdicts[idx];
    if (perfilVerdict) perfilVerdict.innerHTML = '<p class="verdict-text">' + verdicts[idx] + '</p>';
}

function renderAttendanceHistory() {
    const list = document.getElementById('attendanceList');
    if (!list) return;
    if (userAsistencias.length === 0) {
        list.innerHTML = '<div class="empty-state-sm">Aun no has registrado asistencias</div>';
        return;
    }
    list.innerHTML = userAsistencias.slice(0, 20).map(a => {
        const eqL = EQUIPOS[a.equipo_local] || { nombre: a.equipo_local || '?', logo: '' };
        const eqV = EQUIPOS[a.equipo_visitante] || { nombre: a.equipo_visitante || '?', logo: '' };
        const resLabel = a.resultado === 'W' ? 'V' : a.resultado === 'D' ? 'E' : 'D';
        const gl = a.goles_local != null ? a.goles_local : '-';
        const gv = a.goles_visitante != null ? a.goles_visitante : '-';
        return '<div class="attendance-item">' +
            '<div class="attendance-result ' + a.resultado + '">' + resLabel + '</div>' +
            '<div class="attendance-detail"><div class="attendance-teams">' +
            eqL.nombre + ' vs ' + eqV.nombre + '</div>' +
            '<div class="attendance-meta">J' + (a.jornada || '-') + ' | ' + a.fecha + '</div></div>' +
            '<div class="attendance-score">' + gl + '-' + gv + '</div></div>';
    }).join('');
}

// ===== PERFIL =====
function initPerfil() {
    // Populate equipo select
    const eqSelect = document.getElementById('editPerfilEquipo');
    if (eqSelect) {
        Object.entries(EQUIPOS).forEach(([id, eq]) => {
            const opt = document.createElement('option');
            opt.value = id; opt.textContent = eq.nombre;
            eqSelect.appendChild(opt);
        });
        // Add "Otro" option
        const otroOpt = document.createElement('option');
        otroOpt.value = '_neutral'; otroOpt.textContent = 'Neutral / Otro';
        eqSelect.appendChild(otroOpt);
    }

    document.getElementById('btnGuardarPerfil')?.addEventListener('click', async () => {
        if (!currentUser || !supabaseClient) return;
        const nuevoNombre = document.getElementById('editPerfilNombre')?.value.trim();
        const nuevoEquipo = document.getElementById('editPerfilEquipo')?.value;
        if (!nuevoNombre) { showToast('Escribe un nombre.'); return; }

        try {
            const updates = { nombre: nuevoNombre };
            if (nuevoEquipo) updates.equipo = nuevoEquipo === '_neutral' ? 'NEUTRAL' : nuevoEquipo;
            const { error } = await supabaseClient.from('perfiles')
                .update(updates).eq('id', currentUser.id);
            if (error) throw error;
            currentUser.nombre = nuevoNombre;
            if (nuevoEquipo) currentUser.equipo = updates.equipo;
            // Update UI
            document.getElementById('perfilNombre').textContent = nuevoNombre;
            const eq = EQUIPOS[currentUser.equipo];
            document.getElementById('perfilEquipo').textContent = eq ? eq.nombre : (currentUser.equipo || '');
            document.getElementById('userName').textContent = nuevoNombre;
            // Hide setup banner if visible
            document.getElementById('profileSetupBanner')?.classList.add('hidden');
            showToast('Perfil actualizado.');
        } catch (e) { showToast('Error al guardar: ' + e.message); console.error(e); }
    });

    document.getElementById('btnPerfilLogin')?.addEventListener('click', () => openAuthModal('login'));
}

function fillPerfilForm() {
    if (!currentUser) return;
    const nameInput = document.getElementById('editPerfilNombre');
    const eqSelect = document.getElementById('editPerfilEquipo');
    if (nameInput) nameInput.value = currentUser.nombre || '';
    if (eqSelect) eqSelect.value = currentUser.equipo || '';
}

function showProfileSetupBanner() {
    const banner = document.getElementById('profileSetupBanner');
    if (banner) banner.classList.remove('hidden');
    // Focus the name input so user can start typing
    setTimeout(() => {
        const nameInput = document.getElementById('editPerfilNombre');
        if (nameInput) { nameInput.value = ''; nameInput.focus(); }
    }, 300);
}

// ===== SUB-TABS (Estadio & Comunidad) =====
function initSubTabs() {
    document.querySelectorAll('.sub-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.tab-content') || btn.parentElement.parentElement;
            parent.querySelectorAll('.sub-tab').forEach(b => b.classList.toggle('active', b === btn));
            parent.querySelectorAll('.sub-content').forEach(c => {
                c.classList.toggle('active', c.id === 'subtab-' + btn.dataset.subtab);
            });
        });
    });
}

// ===== COMUNIDAD / FORO =====
let foroComments = { general: [], equipo: {}, jornada: {} };

function initComunidad() {
    // General foro
    document.getElementById('btnForoGeneralPost')?.addEventListener('click', () => postComment('general'));
    // Equipo foro
    const eqSelect = document.getElementById('foroEquipoSelect');
    if (eqSelect) {
        Object.entries(EQUIPOS).forEach(([id, eq]) => {
            const opt = document.createElement('option');
            opt.value = id; opt.textContent = eq.nombre;
            eqSelect.appendChild(opt);
        });
        eqSelect.addEventListener('change', () => loadForoEquipo(eqSelect.value));
    }
    document.getElementById('btnForoEquipoPost')?.addEventListener('click', () => {
        const equipo = document.getElementById('foroEquipoSelect')?.value;
        if (equipo) postComment('equipo', equipo);
        else showToast('Selecciona un equipo primero.');
    });
    // Jornada foro
    const jSelect = document.getElementById('foroJornadaSelect');
    if (jSelect) {
        for (let i = 1; i <= 30; i++) {
            const opt = document.createElement('option');
            opt.value = i; opt.textContent = 'Jornada ' + i;
            jSelect.appendChild(opt);
        }
        jSelect.addEventListener('change', () => loadForoJornada(jSelect.value));
    }
    document.getElementById('btnForoJornadaPost')?.addEventListener('click', () => {
        const jornada = document.getElementById('foroJornadaSelect')?.value;
        if (jornada) postComment('jornada', jornada);
        else showToast('Selecciona una jornada primero.');
    });
    // Load initial data
    loadForoGeneral();
}

async function postComment(tipo, filtro) {
    if (!currentUser) { showToast('Inicia sesion para comentar.'); openAuthModal('login'); return; }
    let textEl, listId;
    if (tipo === 'general') { textEl = 'foroGeneralText'; listId = 'foroGeneralList'; }
    else if (tipo === 'equipo') { textEl = 'foroEquipoText'; listId = 'foroEquipoList'; }
    else { textEl = 'foroJornadaText'; listId = 'foroJornadaList'; }

    const text = document.getElementById(textEl)?.value.trim();
    if (!text) { showToast('Escribe un comentario.'); return; }

    const comment = {
        user_id: currentUser.id,
        nombre: currentUser.nombre,
        equipo: currentUser.equipo || '',
        tipo: tipo,
        filtro: filtro || 'general',
        texto: text,
        created_at: new Date().toISOString()
    };

    if (supabaseClient) {
        try {
            const { error } = await supabaseClient.from('foro_comentarios').insert(comment);
            if (error) throw error;
        } catch (e) { console.error('Foro insert error:', e); }
    }

    document.getElementById(textEl).value = '';
    // Reload
    if (tipo === 'general') loadForoGeneral();
    else if (tipo === 'equipo') loadForoEquipo(filtro);
    else loadForoJornada(filtro);
    showToast('Comentario publicado.');
}

async function loadForoGeneral() {
    const list = document.getElementById('foroGeneralList');
    if (!list) return;
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.from('foro_comentarios')
                .select('*').eq('tipo', 'general').order('created_at', { ascending: false }).limit(50);
            if (data && data.length > 0) {
                list.innerHTML = data.map(renderComment).join('');
                return;
            }
        } catch (e) { console.warn('Foro load error:', e); }
    }
    list.innerHTML = '<div class="empty-state-sm">No hay comentarios aun. Se el primero en participar.</div>';
}

async function loadForoEquipo(equipoId) {
    const list = document.getElementById('foroEquipoList');
    if (!list || !equipoId) return;
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.from('foro_comentarios')
                .select('*').eq('tipo', 'equipo').eq('filtro', equipoId)
                .order('created_at', { ascending: false }).limit(50);
            if (data && data.length > 0) {
                list.innerHTML = data.map(renderComment).join('');
                return;
            }
        } catch (e) { console.warn('Foro equipo load error:', e); }
    }
    const eq = EQUIPOS[equipoId];
    list.innerHTML = '<div class="empty-state-sm">No hay comentarios sobre ' + (eq ? eq.nombre : equipoId) + ' aun.</div>';
}

async function loadForoJornada(jornada) {
    const list = document.getElementById('foroJornadaList');
    if (!list || !jornada) return;
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.from('foro_comentarios')
                .select('*').eq('tipo', 'jornada').eq('filtro', String(jornada))
                .order('created_at', { ascending: false }).limit(50);
            if (data && data.length > 0) {
                list.innerHTML = data.map(renderComment).join('');
                return;
            }
        } catch (e) { console.warn('Foro jornada load error:', e); }
    }
    list.innerHTML = '<div class="empty-state-sm">No hay comentarios sobre la Jornada ' + jornada + ' aun.</div>';
}

function renderComment(c) {
    const eq = EQUIPOS[c.equipo];
    const eqName = eq ? eq.corto : (c.equipo || '');
    const initials = (c.nombre || '?').substring(0, 2).toUpperCase();
    const timeAgo = getTimeAgo(c.created_at);
    return '<div class="comment-item">' +
        '<div class="comment-header">' +
        '<div class="comment-avatar">' + initials + '</div>' +
        '<span class="comment-author">' + (c.nombre || 'Anonimo') + '</span>' +
        (eqName ? '<span class="comment-team-badge">' + eqName + '</span>' : '') +
        '<span class="comment-time">' + timeAgo + '</span>' +
        '</div>' +
        '<div class="comment-body">' + escapeHtml(c.texto) + '</div>' +
        '</div>';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getTimeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    return Math.floor(diff / 86400) + ' d';
}

// ===== HINCHA PROFILES (Public) =====
async function loadHinchaProfilesData() {
    if (!supabaseClient) return [];
    try {
        // Two queries instead of N+1: all profiles + all attendance results
        const [profilesRes, asistRes] = await Promise.all([
            supabaseClient.from('perfiles').select('id, nombre, equipo').limit(100),
            supabaseClient.from('asistencias_estadio').select('user_id, resultado')
        ]);
        const perfiles = profilesRes.data || [];
        const asistencias = asistRes.data || [];
        if (perfiles.length === 0) return [];

        // Build stats map: { user_id: { total, w, d, l } }
        const statsMap = {};
        for (const a of asistencias) {
            if (!statsMap[a.user_id]) statsMap[a.user_id] = { total: 0, w: 0, d: 0, l: 0 };
            statsMap[a.user_id].total++;
            if (a.resultado === 'W') statsMap[a.user_id].w++;
            else if (a.resultado === 'D') statsMap[a.user_id].d++;
            else if (a.resultado === 'L') statsMap[a.user_id].l++;
        }

        const profiles = perfiles.map(p => ({
            ...p,
            total: statsMap[p.id]?.total || 0,
            w: statsMap[p.id]?.w || 0,
            d: statsMap[p.id]?.d || 0,
            l: statsMap[p.id]?.l || 0
        }));
        profiles.sort((a, b) => b.total - a.total);
        return profiles;
    } catch (e) { console.warn('Load profiles error:', e); return []; }
}

// Load into Estadio > Registro de los Hinchas
async function loadHinchaProfilesEstadio() {
    const grid = document.getElementById('hinchaGridEstadio');
    if (!grid) return;
    const profiles = await loadHinchaProfilesData();
    if (profiles.length > 0) {
        grid.innerHTML = profiles.map(renderHinchaCard).join('');
        // Click handlers
        grid.addEventListener('click', async (e) => {
            const card = e.target.closest('.hincha-card');
            if (!card) return;
            showHinchaDetailEstadio(card.dataset.uid);
        });
    } else {
        grid.innerHTML = '<div class="empty-state-sm">No hay perfiles disponibles aun.</div>';
    }
    // Close button
    document.getElementById('btnCerrarDetalleEstadio')?.addEventListener('click', () => {
        document.getElementById('hinchaDetailPanelEstadio')?.classList.add('hidden');
        document.getElementById('hinchaGridEstadio')?.classList.remove('hidden');
    });
}

async function showHinchaDetailEstadio(uid) {
    const grid = document.getElementById('hinchaGridEstadio');
    const panel = document.getElementById('hinchaDetailPanelEstadio');
    if (!grid || !panel || !supabaseClient) return;
    grid.classList.add('hidden');
    panel.classList.remove('hidden');

    // Load profile
    try {
        const { data: perfil } = await supabaseClient.from('perfiles').select('nombre, equipo').eq('id', uid).single();
        if (perfil) {
            document.getElementById('detalleNombreEstadio').textContent = perfil.nombre || 'Anonimo';
            const eq = EQUIPOS[perfil.equipo];
            document.getElementById('detalleEquipoEstadio').textContent = eq ? eq.nombre : (perfil.equipo || '');
        }
    } catch(e) {}

    const historyDiv = document.getElementById('detalleHistoryEstadio');
    historyDiv.innerHTML = '<div class="empty-state-sm">Cargando...</div>';

    try {
        const { data: asistencias } = await supabaseClient.from('asistencias_estadio')
            .select('*').eq('user_id', uid).order('fecha', { ascending: false });

        if (!asistencias || asistencias.length === 0) {
            historyDiv.innerHTML = '<div class="empty-state-sm">Este hincha aun no ha registrado asistencias.</div>';
            document.getElementById('detalleStatsEstadio').innerHTML = '<span class="badge">0 partidos</span>';
            document.getElementById('detalleLuckCardEstadio')?.classList.add('hidden');
            return;
        }

        const total = asistencias.length;
        const w = asistencias.filter(a => a.resultado === 'W').length;
        const d = asistencias.filter(a => a.resultado === 'D').length;
        const l = asistencias.filter(a => a.resultado === 'L').length;
        document.getElementById('detalleStatsEstadio').innerHTML =
            '<span class="badge">' + total + ' partidos</span> ' +
            '<span class="badge badge-win">' + w + 'V</span> ' +
            '<span class="badge badge-draw">' + d + 'E</span> ' +
            '<span class="badge badge-loss">' + l + 'D</span>';

        // Luck indicator
        const luckCard = document.getElementById('detalleLuckCardEstadio');
        if (luckCard && total > 0) {
            luckCard.classList.remove('hidden');
            const lossPct = Math.round(l / total * 100);
            const luckScore = Math.min(100, Math.max(5, lossPct + Math.floor(d / total * 30)));
            const fill = document.getElementById('detalleLuckFillEstadio');
            if (fill) fill.style.width = luckScore + '%';
            let texto = '';
            if (luckScore < 20) texto = 'Excelente: su equipo rinde de forma sobresaliente cuando asiste.';
            else if (luckScore < 40) texto = 'Bueno: resultados positivos en la mayoria de sus asistencias.';
            else if (luckScore < 60) texto = 'Regular: resultados mixtos. Su presencia no inclina la balanza.';
            else if (luckScore < 80) texto = 'Desfavorable: su equipo tiende a obtener malos resultados cuando asiste.';
            else texto = 'Critico: la correlacion entre su asistencia y las derrotas es notable.';
            document.getElementById('detalleLuckLabelEstadio').textContent = luckScore + '% - ' + texto;
            const verdicts = [
                'Los datos indican que su equipo rinde de forma excepcional cuando asiste al estadio.',
                'Los resultados cuando asiste son variados, con una ligera tendencia positiva.',
                'Se observa una tendencia negativa en los resultados cuando asiste.',
                'Existe una correlacion significativa entre su asistencia y los resultados adversos.'
            ];
            document.getElementById('detalleVerdictTextEstadio').textContent = verdicts[luckScore < 25 ? 0 : luckScore < 50 ? 1 : luckScore < 75 ? 2 : 3];
        } else if (luckCard) { luckCard.classList.add('hidden'); }

        // Comment counts
        const asistIds = asistencias.map(a => a.id);
        let commentCounts = {};
        try {
            const { data: comments } = await supabaseClient.from('comentarios_asistencia')
                .select('asistencia_id').in('asistencia_id', asistIds);
            if (comments) comments.forEach(c => { commentCounts[c.asistencia_id] = (commentCounts[c.asistencia_id] || 0) + 1; });
        } catch(e) {}

        historyDiv.innerHTML = asistencias.map(a => {
            const eqL = EQUIPOS[a.equipo_local] || { nombre: a.equipo_local, logo: '' };
            const eqV = EQUIPOS[a.equipo_visitante] || { nombre: a.equipo_visitante, logo: '' };
            const resClass = a.resultado === 'W' ? 'win' : a.resultado === 'D' ? 'draw' : 'loss';
            const resLabel = a.resultado === 'W' ? 'Victoria' : a.resultado === 'D' ? 'Empate' : 'Derrota';
            const numComments = commentCounts[a.id] || 0;
            const gl = a.goles_local != null ? a.goles_local : '-';
            const gv = a.goles_visitante != null ? a.goles_visitante : '-';
            return '<div class="asistencia-card" data-asist-id="' + a.id + '">' +
                '<div class="asistencia-header">' +
                '<span class="asistencia-res ' + resClass + '">' + resLabel + '</span>' +
                '<span class="asistencia-fecha">' + (a.fecha || '') + ' · J' + (a.jornada || '-') + '</span></div>' +
                '<div class="asistencia-match">' +
                '<img src="' + eqL.logo + '" class="asistencia-logo"><span>' + eqL.nombre + '</span>' +
                '<span class="asistencia-score">' + gl + ' - ' + gv + '</span>' +
                '<span>' + eqV.nombre + '</span><img src="' + eqV.logo + '" class="asistencia-logo"></div>' +
                (a.nota ? '<p class="asistencia-nota">"' + a.nota + '"</p>' : '') +
                '<div class="asistencia-comments-toggle" data-asist-id="' + a.id + '">💬 ' + numComments + ' comentario' + (numComments !== 1 ? 's' : '') + '</div>' +
                '<div class="asistencia-comments hidden" id="comments-estadio-' + a.id + '"></div></div>';
        }).join('');

        // Comment toggle handlers
        historyDiv.querySelectorAll('.asistencia-comments-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const aid = toggle.dataset.asistId;
                const commentsDiv = document.getElementById('comments-estadio-' + aid);
                if (!commentsDiv) return;
                if (commentsDiv.classList.contains('hidden')) {
                    commentsDiv.classList.remove('hidden');
                    loadAsistenciaComments(aid, commentsDiv);
                } else { commentsDiv.classList.add('hidden'); }
            });
        });
    } catch (e) {
        console.warn('Error loading hincha detail estadio:', e);
        historyDiv.innerHTML = '<div class="empty-state-sm">Error al cargar historial.</div>';
    }
}

function renderHinchaCard(p) {
    const eq = EQUIPOS[p.equipo];
    const eqName = eq ? eq.nombre : (p.equipo || 'Sin equipo');
    const initials = (p.nombre || '?').substring(0, 2).toUpperCase();
    return '<div class="hincha-card" data-uid="' + p.id + '" style="cursor:pointer">' +
        '<div class="hincha-avatar">' + initials + '</div>' +
        '<div class="hincha-name">' + (p.nombre || 'Anonimo') + '</div>' +
        '<div class="hincha-team">' + eqName + '</div>' +
        '<div class="hincha-stats">' +
        '<div class="hincha-stat"><span class="hincha-stat-num">' + p.total + '</span><span class="hincha-stat-label">Partidos</span></div>' +
        '<div class="hincha-stat"><span class="hincha-stat-num w">' + p.w + '</span><span class="hincha-stat-label">V</span></div>' +
        '<div class="hincha-stat"><span class="hincha-stat-num d">' + p.d + '</span><span class="hincha-stat-label">E</span></div>' +
        '<div class="hincha-stat"><span class="hincha-stat-num l">' + p.l + '</span><span class="hincha-stat-label">D</span></div>' +
        '</div></div>';
}

async function loadAsistenciaComments(asistenciaId, container) {
    container.innerHTML = '<div class="empty-state-sm" style="padding:8px">Cargando comentarios...</div>';
    try {
        const { data: comments } = await supabaseClient.from('comentarios_asistencia')
            .select('id, user_id, comentario, created_at')
            .eq('asistencia_id', asistenciaId)
            .order('created_at', { ascending: true });

        let html = '';
        if (comments && comments.length > 0) {
            // Get user names
            const userIds = [...new Set(comments.map(c => c.user_id))];
            let userNames = {};
            try {
                const { data: perfiles } = await supabaseClient.from('perfiles')
                    .select('id, nombre').in('id', userIds);
                if (perfiles) perfiles.forEach(p => { userNames[p.id] = p.nombre; });
            } catch(e) { /* ignore */ }

            html = comments.map(c => {
                const name = userNames[c.user_id] || 'Hincha';
                const isMe = currentUser && c.user_id === currentUser.id;
                return '<div class="comment-item' + (isMe ? ' comment-me' : '') + '">' +
                    '<div class="comment-header">' +
                    '<span class="comment-author">' + name + '</span>' +
                    '<span class="comment-time">' + getTimeAgo(c.created_at) + '</span>' +
                    '</div>' +
                    '<p class="comment-text">' + c.comentario + '</p>' +
                    '</div>';
            }).join('');
        }

        // Add comment input if user is logged in
        if (currentUser) {
            html += '<div class="comment-new">' +
                '<input type="text" class="input-field comment-input" placeholder="Escribe un comentario..." maxlength="500" data-asist-id="' + asistenciaId + '">' +
                '<button class="btn btn-primary btn-sm comment-send" data-asist-id="' + asistenciaId + '">Enviar</button>' +
                '</div>';
        }

        container.innerHTML = html || '<div class="empty-state-sm" style="padding:8px">Sin comentarios. Se el primero!</div>' +
            (currentUser ? '<div class="comment-new"><input type="text" class="input-field comment-input" placeholder="Escribe un comentario..." maxlength="500" data-asist-id="' + asistenciaId + '"><button class="btn btn-primary btn-sm comment-send" data-asist-id="' + asistenciaId + '">Enviar</button></div>' : '');

        // Add send button handlers
        container.querySelectorAll('.comment-send').forEach(btn => {
            btn.addEventListener('click', async () => {
                const aid = btn.dataset.asistId;
                const input = container.querySelector('.comment-input[data-asist-id="' + aid + '"]');
                if (!input || !input.value.trim()) return;
                try {
                    const { error } = await supabaseClient.from('comentarios_asistencia')
                        .insert({ asistencia_id: aid, user_id: currentUser.id, comentario: input.value.trim() });
                    if (error) throw error;
                    loadAsistenciaComments(aid, container);
                } catch(e) { showToast('Error al comentar'); console.error(e); }
            });
        });

        // Also handle Enter key
        container.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const btn = container.querySelector('.comment-send[data-asist-id="' + input.dataset.asistId + '"]');
                    if (btn) btn.click();
                }
            });
        });

    } catch (e) {
        container.innerHTML = '<div class="empty-state-sm" style="padding:8px">Error al cargar comentarios.</div>';
        console.error(e);
    }
}

// ===== EDITORIAL =====
const ADMIN_USER_ID = '68c8b022-d4c1-4b88-aec1-d334eb4980f7'; // Pablo - editor

let editorialUploadedImage = null; // stores base64 data URL (fallback)
let editorialUploadedFile = null;  // stores resized Blob for Storage upload

async function ensureStorageBucket() {
    if (!supabaseClient) return;
    try {
        // Check if bucket exists by trying to list files
        const { error } = await supabaseClient.storage.from('editorial-images').list('', { limit: 1 });
        if (error && error.message.includes('not found')) {
            console.log('Storage bucket not found. Please create "editorial-images" bucket in Supabase dashboard.');
        }
    } catch (e) { console.warn('Storage check:', e); }
}

function initEditorial() {
    // Show editor only for admin
    const editor = document.getElementById('editorialEditor');
    if (editor && currentUser && currentUser.id === ADMIN_USER_ID) {
        editor.classList.remove('hidden');
        // Try to ensure storage bucket exists (silent, no error if already exists)
        ensureStorageBucket();
    }
    // Populate equipo tags
    const tagSelect = document.getElementById('editorialEquipoTag');
    if (tagSelect) {
        Object.entries(EQUIPOS).forEach(([id, eq]) => {
            const opt = document.createElement('option');
            opt.value = id; opt.textContent = eq.nombre;
            tagSelect.appendChild(opt);
        });
    }
    // File upload handler
    const fileInput = document.getElementById('editorialFotoFile');
    const preview = document.getElementById('editorialFotoPreview');
    const fileName = document.getElementById('editorialFotoFileName');
    const btnQuitar = document.getElementById('btnQuitarFoto');

    fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('Solo se permiten imagenes.'); return; }
        if (file.size > 5 * 1024 * 1024) { showToast('Imagen muy grande. Max 5MB.'); return; }
        fileName.textContent = file.name;
        btnQuitar.style.display = 'inline-block';
        // Resize and prepare for upload
        try {
            const resized = await resizeImageForUpload(file, 900, 0.8);
            editorialUploadedImage = resized.dataUrl;
            editorialUploadedFile = resized.blob;
            preview.src = editorialUploadedImage;
            preview.style.display = 'block';
            document.getElementById('editorialFotoUrl').value = '';
        } catch (err) {
            showToast('Error al procesar imagen.');
            console.error(err);
        }
    });

    btnQuitar?.addEventListener('click', () => {
        editorialUploadedImage = null;
        editorialUploadedFile = null;
        fileInput.value = '';
        preview.style.display = 'none';
        preview.src = '';
        fileName.textContent = 'Sin imagen';
        btnQuitar.style.display = 'none';
    });

    // Publish button
    document.getElementById('btnPublicarEditorial')?.addEventListener('click', publicarEditorial);
    // Load editoriales
    loadEditoriales();
}

function resizeImageForUpload(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                // Also get Blob for Storage upload
                canvas.toBlob((blob) => {
                    resolve({ dataUrl, blob });
                }, 'image/jpeg', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function publicarEditorial() {
    if (!currentUser || currentUser.id !== ADMIN_USER_ID) { showToast('No tienes permisos para publicar.'); return; }
    const titulo = document.getElementById('editorialTitulo')?.value.trim();
    const contenido = document.getElementById('editorialContenido')?.value.trim();
    const equipoTag = document.getElementById('editorialEquipoTag')?.value || '';
    const fotoUrl = document.getElementById('editorialFotoUrl')?.value.trim() || '';
    const fotoCredito = document.getElementById('editorialFotoCredito')?.value.trim() || '';
    if (!titulo) { showToast('Escribe un titulo para el editorial.'); return; }
    if (!contenido) { showToast('Escribe el contenido del editorial.'); return; }

    // Upload image to Supabase Storage if file was selected
    let fotoFinal = fotoUrl;
    if (editorialUploadedFile && supabaseClient) {
        showToast('Subiendo imagen...');
        try {
            const fileName = 'editorial_' + Date.now() + '.jpg';
            const { data: uploadData, error: uploadErr } = await supabaseClient.storage
                .from('editorial-images').upload(fileName, editorialUploadedFile, {
                    contentType: 'image/jpeg', upsert: false
                });
            if (uploadErr) throw uploadErr;
            const { data: urlData } = supabaseClient.storage
                .from('editorial-images').getPublicUrl(fileName);
            fotoFinal = urlData.publicUrl;
        } catch (upErr) {
            console.warn('Storage upload failed, using base64 fallback:', upErr);
            fotoFinal = editorialUploadedImage || fotoUrl;
        }
    } else if (!fotoFinal && editorialUploadedImage) {
        fotoFinal = editorialUploadedImage; // base64 fallback
    }

    // Encode foto info in texto as JSON prefix if present
    let textoFinal = contenido;
    if (fotoFinal) {
        textoFinal = JSON.stringify({ foto: fotoFinal, credito: fotoCredito }) + '\n---EDITORIAL---\n' + contenido;
    }

    const editorial = {
        user_id: currentUser.id,
        nombre: currentUser.nombre,
        equipo: equipoTag,
        tipo: 'editorial',
        filtro: titulo,
        texto: textoFinal,
        created_at: new Date().toISOString()
    };

    if (supabaseClient) {
        try {
            const { error } = await supabaseClient.from('foro_comentarios').insert(editorial);
            if (error) throw error;
        } catch (e) { showToast('Error al publicar: ' + e.message); console.error(e); return; }
    }

    document.getElementById('editorialTitulo').value = '';
    document.getElementById('editorialContenido').value = '';
    document.getElementById('editorialEquipoTag').value = '';
    document.getElementById('editorialFotoUrl').value = '';
    document.getElementById('editorialFotoCredito').value = '';
    // Reset uploaded image
    editorialUploadedImage = null;
    editorialUploadedFile = null;
    const fileInput = document.getElementById('editorialFotoFile');
    if (fileInput) fileInput.value = '';
    const preview = document.getElementById('editorialFotoPreview');
    if (preview) { preview.style.display = 'none'; preview.src = ''; }
    const fName = document.getElementById('editorialFotoFileName');
    if (fName) fName.textContent = 'Sin imagen';
    const btnQ = document.getElementById('btnQuitarFoto');
    if (btnQ) btnQ.style.display = 'none';
    showToast('Editorial publicado.');
    loadEditoriales();
}

async function loadEditoriales() {
    const list = document.getElementById('editorialList');
    if (!list) return;
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.from('foro_comentarios')
                .select('*').eq('tipo', 'editorial')
                .order('created_at', { ascending: false }).limit(30);
            if (data && data.length > 0) {
                list.innerHTML = data.map(renderEditorial).join('');
                initEditorialCommentListeners();
                return;
            }
        } catch (e) { console.warn('Editorial load error:', e); }
    }
    list.innerHTML = '<div class="empty-state-sm">No hay editoriales publicados aun.</div>';
}

function initEditorialCommentListeners() {
    // Toggle comments visibility
    document.querySelectorAll('.btn-toggle-comments').forEach(btn => {
        btn.addEventListener('click', async () => {
            const editorialId = btn.dataset.editorialId;
            const container = document.querySelector('.editorial-comments-container[data-editorial-id="' + CSS.escape(editorialId) + '"]');
            if (!container) return;
            const isHidden = container.classList.contains('hidden');
            container.classList.toggle('hidden');
            if (isHidden) {
                btn.textContent = '💬 Ocultar comentarios';
                await loadEditorialComments(editorialId);
            } else {
                btn.textContent = '💬 Ver comentarios';
            }
        });
    });
    // Send comment buttons
    document.querySelectorAll('.btn-editorial-comment').forEach(btn => {
        btn.addEventListener('click', async () => {
            const editorialId = btn.dataset.editorialId;
            const input = btn.parentElement.querySelector('.editorial-comment-text');
            if (!input || !input.value.trim()) { showToast('Escribe un comentario.'); return; }
            btn.disabled = true;
            await postEditorialComment(editorialId, input.value);
            input.value = '';
            btn.disabled = false;
        });
    });
    // Enter key to send
    document.querySelectorAll('.editorial-comment-text').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const btn = input.parentElement.querySelector('.btn-editorial-comment');
                if (btn) btn.click();
            }
        });
    });
}

function renderEditorial(e) {
    const eq = EQUIPOS[e.equipo];
    const eqTag = eq ? '<span class="editorial-equipo-tag" style="background:' + eq.color1 + '; color:' + eq.color2 + '">' + eq.corto + '</span>' : '';
    const fecha = new Date(e.created_at);
    const fechaStr = fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
    const editorialId = e.created_at; // unique ID for linking comments

    // Parse foto from texto
    let contenido = e.texto || '';
    let fotoHtml = '';
    if (contenido.includes('\n---EDITORIAL---\n')) {
        const parts = contenido.split('\n---EDITORIAL---\n');
        try {
            const meta = JSON.parse(parts[0]);
            if (meta.foto) {
                fotoHtml = '<div class="editorial-foto">' +
                    '<img src="' + escapeHtml(meta.foto) + '" alt="Foto editorial" loading="lazy">' +
                    (meta.credito ? '<span class="editorial-foto-credito">Fuente: ' + escapeHtml(meta.credito) + '</span>' : '') +
                    '</div>';
            }
        } catch(ex) {}
        contenido = parts.slice(1).join('\n---EDITORIAL---\n');
    }
    const contenidoHtml = escapeHtml(contenido).replace(/\n/g, '<br>');

    const commentInputHtml = currentUser ?
        '<div class="editorial-comment-input" style="display:flex; gap:8px; margin-top:8px;">' +
            '<input type="text" class="input-field editorial-comment-text" placeholder="Escribe un comentario..." maxlength="300" style="flex:1; font-size:0.85rem;">' +
            '<button class="btn btn-primary btn-sm btn-editorial-comment" data-editorial-id="' + escapeHtml(editorialId) + '">Enviar</button>' +
        '</div>' :
        '<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px;">Inicia sesion para comentar.</p>';

    return '<article class="editorial-card">' +
        '<div class="editorial-header">' +
        '<h3 class="editorial-titulo">' + escapeHtml(e.filtro) + '</h3>' +
        eqTag +
        '</div>' +
        '<div class="editorial-meta">' +
        '<span class="editorial-autor">Por ' + (e.nombre || 'Editor') + '</span>' +
        '<span class="editorial-fecha">' + fechaStr + '</span>' +
        '</div>' +
        fotoHtml +
        '<div class="editorial-body">' + contenidoHtml + '</div>' +
        '<div class="editorial-comments-section" style="margin-top:12px; border-top:1px solid var(--border-color); padding-top:12px;">' +
            '<button class="btn-toggle-comments" data-editorial-id="' + escapeHtml(editorialId) + '" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:0.85rem; font-weight:600; padding:0;">💬 Ver comentarios</button>' +
            '<div class="editorial-comments-container hidden" data-editorial-id="' + escapeHtml(editorialId) + '">' +
                '<div class="editorial-comments-list" data-editorial-id="' + escapeHtml(editorialId) + '" style="margin-top:8px;"></div>' +
                commentInputHtml +
            '</div>' +
        '</div>' +
        '</article>';
}

// Editorial comments
async function loadEditorialComments(editorialId) {
    const listDiv = document.querySelector('.editorial-comments-list[data-editorial-id="' + CSS.escape(editorialId) + '"]');
    if (!listDiv || !supabaseClient) return;
    listDiv.innerHTML = '<span style="font-size:0.8rem; color:var(--text-secondary);">Cargando...</span>';
    try {
        const { data } = await supabaseClient.from('foro_comentarios')
            .select('*').eq('tipo', 'editorial_comment').eq('filtro', editorialId)
            .order('created_at', { ascending: true }).limit(50);
        if (!data || data.length === 0) {
            listDiv.innerHTML = '<span style="font-size:0.8rem; color:var(--text-secondary);">Sin comentarios aun. Se el primero.</span>';
            return;
        }
        listDiv.innerHTML = data.map(c => {
            const eq = EQUIPOS[c.equipo];
            const colorDot = eq ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + eq.color1 + ';margin-right:4px;"></span>' : '';
            return '<div class="editorial-comment" style="padding:6px 0; border-bottom:1px solid rgba(0,0,0,0.05);">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                    '<span style="font-size:0.8rem; font-weight:600;">' + colorDot + escapeHtml(c.nombre || 'Anonimo') + '</span>' +
                    '<span style="font-size:0.7rem; color:var(--text-secondary);">' + getTimeAgo(c.created_at) + '</span>' +
                '</div>' +
                '<p style="font-size:0.85rem; margin:2px 0 0 0;">' + escapeHtml(c.texto) + '</p>' +
            '</div>';
        }).join('');
    } catch (e) {
        listDiv.innerHTML = '<span style="font-size:0.8rem; color:red;">Error al cargar comentarios.</span>';
        console.warn('Editorial comments error:', e);
    }
}

async function postEditorialComment(editorialId, texto) {
    if (!currentUser || !supabaseClient || !texto.trim()) return;
    try {
        const { error } = await supabaseClient.from('foro_comentarios').insert({
            user_id: currentUser.id,
            nombre: currentUser.nombre,
            equipo: currentUser.equipo || 'NEUTRAL',
            tipo: 'editorial_comment',
            filtro: editorialId,
            texto: texto.trim(),
            created_at: new Date().toISOString()
        });
        if (error) throw error;
        await loadEditorialComments(editorialId);
    } catch (e) { showToast('Error al comentar: ' + e.message); console.error(e); }
}

// ===== RANKING DE CLUBES POR HINCHAS =====
async function loadRankingHinchas() {
    const container = document.getElementById('rankingHinchasContainer');
    if (!container) return;

    if (!supabaseClient) {
        container.innerHTML = '<div class="empty-state-sm">No hay datos disponibles.</div>';
        return;
    }

    try {
        const { data: perfiles } = await supabaseClient.from('perfiles').select('equipo');
        if (!perfiles || perfiles.length === 0) {
            container.innerHTML = '<div class="empty-state-sm">Aun no hay hinchas registrados.</div>';
            return;
        }

        // Count fans per club
        const counts = {};
        for (const p of perfiles) {
            const eq = p.equipo || 'NEUTRAL';
            if (eq === 'NEUTRAL' || eq === '_neutral') continue;
            counts[eq] = (counts[eq] || 0) + 1;
        }

        // Sort descending
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) {
            container.innerHTML = '<div class="empty-state-sm">Aun no hay hinchas registrados.</div>';
            return;
        }

        const maxCount = sorted[0][1];
        let html = '<div class="ranking-hinchas-list">';
        sorted.forEach(([eqId, count], i) => {
            const eq = EQUIPOS[eqId];
            const nombre = eq ? eq.nombre : eqId;
            const color1 = eq ? eq.color1 : '#888';
            const color2 = eq ? eq.color2 : '#fff';
            const logo = eq ? eq.logo : '';
            const pct = Math.round((count / maxCount) * 100);

            html += '<div class="ranking-hincha-row">' +
                '<div class="ranking-hincha-pos" style="color:' + color1 + '; font-weight:800;">' + (i + 1) + '</div>' +
                (logo ? '<img src="' + logo + '" class="ranking-hincha-logo" alt="' + nombre + '">' : '') +
                '<div class="ranking-hincha-info">' +
                    '<div class="ranking-hincha-name">' + nombre + '</div>' +
                    '<div class="ranking-hincha-bar-bg">' +
                        '<div class="ranking-hincha-bar-fill" style="width:' + pct + '%; background:' + color1 + ';"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="ranking-hincha-count" style="background:' + color1 + '; color:' + color2 + ';">' + count + '</div>' +
            '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        console.warn('Ranking hinchas error:', e);
        container.innerHTML = '<div class="empty-state-sm">Error al cargar ranking.</div>';
    }
}

// ===== VISIT COUNTER =====
async function trackVisit() {
    if (!supabaseClient) return;
    try {
        // Register this visit (one per session, only for logged-in users due to RLS)
        const visited = sessionStorage.getItem('tt_visited');
        if (!visited && currentUser) {
            await supabaseClient.from('foro_comentarios').insert({
                user_id: currentUser.id,
                nombre: 'visit',
                equipo: '',
                tipo: 'visita',
                filtro: new Date().toISOString().split('T')[0],
                texto: '',
                created_at: new Date().toISOString()
            });
            sessionStorage.setItem('tt_visited', '1');
        }
        // Load total count (SELECT is public per RLS)
        const { count } = await supabaseClient.from('foro_comentarios')
            .select('*', { count: 'exact', head: true }).eq('tipo', 'visita');
        const el = document.getElementById('visitCount');
        if (el && count !== null) {
            el.textContent = count.toLocaleString();
            // Only show counter to admin
            if (currentUser && currentUser.id === ADMIN_USER_ID) {
                document.getElementById('visitCounter')?.classList.remove('hidden');
            }
        }
    } catch (e) { console.warn('Visit tracking error:', e); }
}

// ===== ADMIN PANEL =====
function initAdminPanel() {
    const select = document.getElementById('adminJornadaSelect');
    if (!select) return;

    // Populate jornada options - all 30 jornadas
    select.innerHTML = '<option value="">Selecciona jornada</option>';
    const allResults = getAllResultados();
    const completedJornadas = [...new Set(allResults.map(r => r.jornada))].sort((a, b) => a - b);

    // Future jornadas from CALENDARIO_FECHAS
    CALENDARIO_FECHAS.forEach(cf => {
        if (!completedJornadas.includes(cf.fecha)) {
            const opt = document.createElement('option');
            opt.value = cf.fecha;
            opt.textContent = 'Fecha ' + cf.fecha + ' (' + formatCalDate(cf.inicio) + ')';
            select.appendChild(opt);
        }
    });

    // Completed jornadas (most recent first)
    for (let j = completedJornadas.length - 1; j >= 0; j--) {
        const jNum = completedJornadas[j];
        const opt = document.createElement('option');
        opt.value = jNum;
        opt.textContent = 'Fecha ' + jNum + ' (completada - editar)';
        select.appendChild(opt);
    }

    select.addEventListener('change', () => {
        const j = parseInt(select.value);
        if (isNaN(j)) { document.getElementById('adminMatchesGrid').innerHTML = ''; return; }
        renderAdminMatches(j);
    });

    document.getElementById('btnGuardarResultados')?.addEventListener('click', guardarResultadosAdmin);
    document.getElementById('btnPreviewStandings')?.addEventListener('click', previewStandingsAdmin);

    // Jornada activa del Prode selector
    const prodeSelect = document.getElementById('adminProdeJornada');
    if (prodeSelect) {
        prodeSelect.innerHTML = '';
        for (let j = 1; j <= 30; j++) {
            const opt = document.createElement('option');
            opt.value = j;
            opt.textContent = 'Fecha ' + j;
            if (j === getActiveJornada()) opt.selected = true;
            prodeSelect.appendChild(opt);
        }
    }
    document.getElementById('btnCambiarJornada')?.addEventListener('click', cambiarJornadaActiva);

    // Show current info
    refreshAdminInfo();
}

async function cambiarJornadaActiva() {
    if (!currentUser || currentUser.id !== ADMIN_USER_ID || !supabaseClient) return;
    const newJ = parseInt(document.getElementById('adminProdeJornada').value);
    if (isNaN(newJ)) return;

    const statusEl = document.getElementById('adminJornadaStatus');
    try {
        const { error } = await supabaseClient.from('config')
            .upsert({ key: 'current_jornada', value: String(newJ), updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) throw error;

        dynamicJornada = newJ;
        renderAll();
        refreshAdminInfo();
        statusEl.innerHTML = '<span style="color:#27ae60;">✓ Jornada activa cambiada a Fecha ' + newJ + '</span>';
        showToast('Jornada del Prode actualizada a Fecha ' + newJ);
    } catch (e) {
        statusEl.innerHTML = '<span style="color:#e74c3c;">Error: ' + (e.message || 'No se pudo actualizar') + '</span>';
    }
}

function refreshAdminInfo() {
    const info = document.getElementById('adminCurrentInfo');
    if (!info) return;
    const allResults = getAllResultados();
    const totalResults = allResults.length;
    const jornadas = [...new Set(allResults.map(r => r.jornada))];
    const maxJ = jornadas.length > 0 ? Math.max(...jornadas) : 0;
    const activeJ = getActiveJornada();
    const source = dynamicResultados ? '🟢 Supabase (en vivo)' : '🟡 Datos locales (fallback)';
    info.innerHTML = 'Fuente de datos: <strong>' + source + '</strong><br>' +
        'Jornadas con resultados: <strong>1 a ' + maxJ + '</strong><br>' +
        'Total partidos registrados: <strong>' + totalResults + '</strong><br>' +
        'Jornada activa del Prode: <strong>Fecha ' + activeJ + '</strong>';
}

function renderAdminMatches(jornada) {
    const grid = document.getElementById('adminMatchesGrid');
    if (!grid) return;

    // Check if it's a future jornada (from CALENDARIO_FECHAS)
    const calFecha = CALENDARIO_FECHAS.find(cf => cf.fecha === jornada);
    // Check if it's a completed jornada
    const completedMatches = getAllResultados().filter(r => r.jornada === jornada);

    let matches = [];
    if (completedMatches.length > 0) {
        matches = completedMatches.map(m => ({
            local: m.local, visitante: m.visitante, gl: m.gl, gv: m.gv
        }));
    } else if (calFecha) {
        matches = calFecha.partidos.map(m => ({
            local: m.local, visitante: m.visitante, gl: '', gv: ''
        }));
    }

    if (matches.length === 0) {
        grid.innerHTML = '<p style="font-size:0.85rem; color:var(--text-secondary);">No hay partidos para esta jornada.</p>';
        document.getElementById('btnGuardarResultados').disabled = true;
        return;
    }

    let html = '';
    matches.forEach((m, i) => {
        const eqL = EQUIPOS[m.local] || { nombre: m.local, logo: '', corto: m.local };
        const eqV = EQUIPOS[m.visitante] || { nombre: m.visitante, logo: '', corto: m.visitante };
        html += '<div class="admin-match-row" data-idx="' + i + '" data-local="' + m.local + '" data-visitante="' + m.visitante + '">' +
            '<div class="admin-team-home">' +
            '<img src="' + eqL.logo + '" alt="" class="admin-team-logo">' +
            '<span>' + eqL.corto + '</span></div>' +
            '<input type="number" min="0" max="20" class="admin-score-input" data-side="local" value="' + (m.gl !== '' ? m.gl : '') + '" placeholder="-">' +
            '<span class="admin-vs">-</span>' +
            '<input type="number" min="0" max="20" class="admin-score-input" data-side="visitante" value="' + (m.gv !== '' ? m.gv : '') + '" placeholder="-">' +
            '<div class="admin-team-away">' +
            '<span>' + eqV.corto + '</span>' +
            '<img src="' + eqV.logo + '" alt="" class="admin-team-logo"></div></div>';
    });
    grid.innerHTML = html;
    document.getElementById('btnGuardarResultados').disabled = false;
}

async function guardarResultadosAdmin() {
    if (!currentUser || currentUser.id !== ADMIN_USER_ID) return;
    if (!supabaseClient) { showToast('Error: Supabase no disponible'); return; }

    const jornada = parseInt(document.getElementById('adminJornadaSelect').value);
    if (isNaN(jornada)) { showToast('Selecciona una jornada'); return; }

    const rows = document.querySelectorAll('.admin-match-row');
    const results = [];
    let allComplete = true;

    rows.forEach(row => {
        const local = row.dataset.local;
        const visitante = row.dataset.visitante;
        const glInput = row.querySelector('[data-side="local"]');
        const gvInput = row.querySelector('[data-side="visitante"]');
        const gl = glInput.value;
        const gv = gvInput.value;
        if (gl === '' || gv === '') allComplete = false;
        results.push({ jornada, local, visitante, gl: parseInt(gl), gv: parseInt(gv) });
    });

    if (!allComplete) { showToast('Completa todos los marcadores'); return; }

    const status = document.getElementById('adminStatus');
    status.innerHTML = '<p style="color:var(--accent);">Guardando en Supabase...</p>';

    try {
        // Get fecha from calendario
        const calFecha = CALENDARIO_FECHAS.find(cf => cf.fecha === jornada);

        // Upsert each result to Supabase
        const records = results.map((r, i) => ({
            jornada: r.jornada,
            fecha: calFecha ? (calFecha.partidos[i]?.dia || calFecha.inicio) : null,
            local: r.local,
            visitante: r.visitante,
            gl: r.gl,
            gv: r.gv
        }));

        const { error } = await supabaseClient.from('resultados')
            .upsert(records, { onConflict: 'jornada,local,visitante' });

        if (error) throw error;

        // Update dynamicResultados and rebuild standings
        const { data: freshResults } = await supabaseClient.from('resultados')
            .select('*').order('jornada').order('id');
        if (freshResults) {
            dynamicResultados = freshResults;
            standingsData = buildStandingsFromResults(dynamicResultados);
        }

        // Refresh the app
        renderAll();
        renderCalendario();
        refreshAdminInfo();

        const maxJ = Math.max(...dynamicResultados.map(r => r.jornada));
        showDataStatus('Datos en vivo - Fecha ' + maxJ, true);

        status.innerHTML = '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:8px; padding:12px; margin-top:8px;">' +
            '<p style="font-size:0.85rem; font-weight:600; color:#27ae60;">✓ Resultados guardados en Supabase</p>' +
            '<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">La tabla, calendario y prode se actualizaron automaticamente para todos los usuarios.</p></div>';

        showToast('Resultados guardados ✓ Tabla actualizada');
    } catch (e) {
        console.error('Error saving results:', e);
        status.innerHTML = '<p style="color:#e74c3c; font-size:0.85rem;">Error: ' + (e.message || 'No se pudo guardar') + '</p>';
        showToast('Error al guardar: ' + (e.message || 'intenta de nuevo'));
    }
}

function previewStandingsAdmin() {
    const previewCard = document.getElementById('adminPreviewCard');
    const previewTable = document.getElementById('adminPreviewTable');
    if (!previewCard || !previewTable) return;

    // Build from current results + what's in the form
    const allResults = getAllResultados();
    const jornada = parseInt(document.getElementById('adminJornadaSelect').value);
    let previewResults = [...allResults];

    // Add form data if it's a new jornada
    if (!isNaN(jornada)) {
        const existingJornadas = [...new Set(allResults.map(r => r.jornada))];
        if (!existingJornadas.includes(jornada)) {
            const rows = document.querySelectorAll('.admin-match-row');
            rows.forEach(row => {
                const gl = row.querySelector('[data-side="local"]').value;
                const gv = row.querySelector('[data-side="visitante"]').value;
                if (gl !== '' && gv !== '') {
                    previewResults.push({ jornada, local: row.dataset.local, visitante: row.dataset.visitante, gl: parseInt(gl), gv: parseInt(gv) });
                }
            });
        }
    }

    const standings = buildStandingsFromResults(previewResults);

    // Calculate points and sort
    const teams = standings.map(t => ({
        ...t,
        pts: t.g * 3 + t.e,
        dg: t.gf - t.gc
    }));
    teams.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

    let html = '<table style="width:100%; font-size:0.75rem; border-collapse:collapse;">';
    html += '<tr style="border-bottom:1px solid var(--border);"><th>#</th><th style="text-align:left;">Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr>';
    teams.forEach((t, i) => {
        const eq = EQUIPOS[t.id] || { corto: t.id };
        const dgStr = t.dg > 0 ? '+' + t.dg : t.dg;
        html += '<tr style="border-bottom:1px solid var(--border); padding:4px 0;">' +
            '<td style="text-align:center;">' + (i + 1) + '</td>' +
            '<td>' + eq.corto + '</td>' +
            '<td style="text-align:center;">' + t.pj + '</td>' +
            '<td style="text-align:center;">' + t.g + '</td>' +
            '<td style="text-align:center;">' + t.e + '</td>' +
            '<td style="text-align:center;">' + t.p + '</td>' +
            '<td style="text-align:center;">' + t.gf + '</td>' +
            '<td style="text-align:center;">' + t.gc + '</td>' +
            '<td style="text-align:center;">' + dgStr + '</td>' +
            '<td style="text-align:center; font-weight:700;">' + t.pts + '</td></tr>';
    });
    html += '</table>';

    previewTable.innerHTML = html;
    previewCard.classList.remove('hidden');
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== UTILITIES =====
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
