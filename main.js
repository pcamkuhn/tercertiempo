/* ============================================
   TERCERTIEMPO - main.js
   LigaPro 2026 con API-Football en tiempo real
   ============================================ */

// ===== CONFIG =====
const SUPABASE_URL = 'https://upuimmozwczajuxnsgoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdWltbW96d2N6YWp1eG5zZ29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzEzMTQsImV4cCI6MjA5MTcwNzMxNH0.QKDmbwXSB5djbavS5T-U3z6aIxcw8akNwi4771Z0dF8';

// API-Football: Registrate gratis en api-football.com y pega tu key aqui
const API_KEY = ''; // <-- TU API KEY AQUI
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

// ===== DATOS FALLBACK — LigaPro 2026 Fecha 8 (12 Abril) =====
const FALLBACK_STANDINGS = [
    { id: 'IDV', pj: 8, g: 6, e: 1, p: 1, gf: 16, gc: 8 },
    { id: 'UCA', pj: 8, g: 4, e: 4, p: 0, gf: 13, gc: 4 },
    { id: 'BSC', pj: 8, g: 4, e: 3, p: 1, gf: 8, gc: 4 },
    { id: 'AUC', pj: 8, g: 3, e: 3, p: 2, gf: 10, gc: 8 },
    { id: 'CUE', pj: 8, g: 3, e: 2, p: 3, gf: 9, gc: 8 },
    { id: 'TEC', pj: 8, g: 3, e: 2, p: 3, gf: 8, gc: 8 },
    { id: 'DLF', pj: 8, g: 3, e: 2, p: 3, gf: 4, gc: 4 },
    { id: 'MAC', pj: 8, g: 2, e: 4, p: 2, gf: 6, gc: 5 },
    { id: 'MUS', pj: 8, g: 2, e: 4, p: 2, gf: 9, gc: 9 },
    { id: 'LIB', pj: 8, g: 2, e: 4, p: 2, gf: 8, gc: 8 },
    { id: 'LDU', pj: 8, g: 3, e: 1, p: 4, gf: 7, gc: 9 },
    { id: 'GCY', pj: 8, g: 2, e: 3, p: 3, gf: 5, gc: 9 },
    { id: 'OVA', pj: 8, g: 2, e: 2, p: 4, gf: 11, gc: 14 },
    { id: 'LDN', pj: 8, g: 1, e: 4, p: 3, gf: 4, gc: 9 },
    { id: 'EME', pj: 8, g: 2, e: 2, p: 4, gf: 6, gc: 10 },
    { id: 'MAN', pj: 8, g: 1, e: 1, p: 6, gf: 2, gc: 9 }
];
// Nota: Emelec tiene -3 pts por sancion de la FEF (5 pts mostrados = 8 ganados - 3 penalizacion)
// Datos corregidos desde Flashscore - Liga Pro Ecuador 2026 - Fecha 8 (14 Abril 2026)

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
    { jornada: 8, fecha: '2026-04-12', local: 'AUC', visitante: 'EME', gl: 2, gv: 0 }
];

const JORNADA_PRODE = [
    { jornada: 9, local: 'LDN', visitante: 'AUC', fecha: '2026-04-17' },
    { jornada: 9, local: 'EME', visitante: 'GCY', fecha: '2026-04-17' },
    { jornada: 9, local: 'MUS', visitante: 'TEC', fecha: '2026-04-18' },
    { jornada: 9, local: 'UCA', visitante: 'LIB', fecha: '2026-04-18' },
    { jornada: 9, local: 'OVA', visitante: 'DLF', fecha: '2026-04-18' },
    { jornada: 9, local: 'MAN', visitante: 'CUE', fecha: '2026-04-19' },
    { jornada: 9, local: 'IDV', visitante: 'LDU', fecha: '2026-04-19' },
    { jornada: 9, local: 'MAC', visitante: 'BSC', fecha: '2026-04-19' }
];

// ===== CALENDARIO COMPLETO LIGAPRO 2026 =====
const CALENDARIO_FECHAS = [
    // Fecha 9 (17-19 Abril)
    { fecha: 9, inicio: '2026-04-17', partidos: [
        { local: 'LDN', visitante: 'AUC', dia: '2026-04-17' },
        { local: 'EME', visitante: 'GCY', dia: '2026-04-17' },
        { local: 'MUS', visitante: 'TEC', dia: '2026-04-18' },
        { local: 'UCA', visitante: 'LIB', dia: '2026-04-18' },
        { local: 'OVA', visitante: 'DLF', dia: '2026-04-18' },
        { local: 'MAN', visitante: 'CUE', dia: '2026-04-19' },
        { local: 'IDV', visitante: 'LDU', dia: '2026-04-19' },
        { local: 'MAC', visitante: 'BSC', dia: '2026-04-19' }
    ]},
    // Fecha 10 (21-23 Abril)
    { fecha: 10, inicio: '2026-04-21', partidos: [
        { local: 'LIB', visitante: 'GCY', dia: '2026-04-21' },
        { local: 'TEC', visitante: 'EME', dia: '2026-04-21' },
        { local: 'LDN', visitante: 'MAN', dia: '2026-04-22' },
        { local: 'DLF', visitante: 'IDV', dia: '2026-04-22' },
        { local: 'CUE', visitante: 'OVA', dia: '2026-04-22' },
        { local: 'BSC', visitante: 'MUS', dia: '2026-04-22' },
        { local: 'LDU', visitante: 'AUC', dia: '2026-04-22' },
        { local: 'UCA', visitante: 'MAC', dia: '2026-04-23' }
    ]},
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
    // Fecha 13 (8-10 Mayo)
    { fecha: 13, inicio: '2026-05-08', partidos: [
        { local: 'OVA', visitante: 'LDN', dia: '2026-05-08' },
        { local: 'IDV', visitante: 'BSC', dia: '2026-05-09' },
        { local: 'TEC', visitante: 'DLF', dia: '2026-05-09' },
        { local: 'EME', visitante: 'MAC', dia: '2026-05-09' },
        { local: 'GCY', visitante: 'CUE', dia: '2026-05-10' },
        { local: 'AUC', visitante: 'UCA', dia: '2026-05-10' },
        { local: 'MUS', visitante: 'LIB', dia: '2026-05-10' },
        { local: 'MAN', visitante: 'LDU', dia: '2026-05-10' }
    ]},
    // Fecha 14 (15-17 Mayo)
    { fecha: 14, inicio: '2026-05-15', partidos: [
        { local: 'BSC', visitante: 'AUC', dia: '2026-05-15' },
        { local: 'LDU', visitante: 'TEC', dia: '2026-05-16' },
        { local: 'UCA', visitante: 'MUS', dia: '2026-05-16' },
        { local: 'LIB', visitante: 'EME', dia: '2026-05-16' },
        { local: 'CUE', visitante: 'LDN', dia: '2026-05-17' },
        { local: 'DLF', visitante: 'OVA', dia: '2026-05-17' },
        { local: 'MAC', visitante: 'GCY', dia: '2026-05-17' },
        { local: 'IDV', visitante: 'MAN', dia: '2026-05-17' }
    ]},
    // Fecha 15 (22-24 Mayo)
    { fecha: 15, inicio: '2026-05-22', partidos: [
        { local: 'TEC', visitante: 'CUE', dia: '2026-05-22' },
        { local: 'GCY', visitante: 'DLF', dia: '2026-05-23' },
        { local: 'LDN', visitante: 'BSC', dia: '2026-05-23' },
        { local: 'MAN', visitante: 'LIB', dia: '2026-05-23' },
        { local: 'OVA', visitante: 'UCA', dia: '2026-05-24' },
        { local: 'AUC', visitante: 'IDV', dia: '2026-05-24' },
        { local: 'MUS', visitante: 'LDU', dia: '2026-05-24' },
        { local: 'EME', visitante: 'MAC', dia: '2026-05-24' }
    ]}
];
// Fechas 16-30 = vuelta (se generan invirtiendo local/visitante de fechas 1-15)

// ===== APP STATE =====
let currentUser = null;
let currentTab = 'tabla';
let authMode = 'login';
let standingsData = null;
let goleadoresData = null;
let asistenciasData = null;
let userAsistencias = [];

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAuth();
    initLigas();
    initHinchas();
    initPerfil();
    initSubTabs();
    initComunidad();
    checkSession();
    loadData();
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

    // Try cache first
    let standings = getCached('standings');
    let scorers = getCached('scorers');
    let assists = getCached('assists');

    if (standings) {
        standingsData = standings;
        goleadoresData = scorers || FALLBACK_GOLEADORES;
        asistenciasData = assists || FALLBACK_ASISTENCIAS;
        renderAll();
        showDataStatus('Datos en cache', true);
    }

    // Try API
    if (API_KEY) {
        try {
            const [apiStandings, apiScorers, apiAssists] = await Promise.all([
                apiCall('/standings?league=' + LEAGUE_ID + '&season=' + SEASON),
                apiCall('/players/topscorers?league=' + LEAGUE_ID + '&season=' + SEASON),
                apiCall('/players/topassists?league=' + LEAGUE_ID + '&season=' + SEASON)
            ]);

            if (apiStandings && apiStandings[0]) {
                standingsData = parseAPIStandings(apiStandings[0].league.standings[0]);
                setCache('standings', standingsData);
            }
            if (apiScorers) {
                goleadoresData = parseAPIScorers(apiScorers);
                setCache('scorers', goleadoresData);
            }
            if (apiAssists) {
                asistenciasData = parseAPIAssists(apiAssists);
                setCache('assists', asistenciasData);
            }
            renderAll();
            showDataStatus('Datos en vivo de API-Football', true);
        } catch (e) {
            console.warn('API fetch failed, using fallback');
            if (!standingsData) useFallback();
        }
    } else {
        if (!standingsData) useFallback();
    }
}

function useFallback() {
    standingsData = FALLBACK_STANDINGS;
    goleadoresData = FALLBACK_GOLEADORES;
    asistenciasData = FALLBACK_ASISTENCIAS;
    renderAll();
    showDataStatus('Datos estaticos (Fecha 8 - 12 Abril)', false);
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
        pts: t.id === 'EME' ? (t.g * 3 + t.e - 3) : (t.g * 3 + t.e),
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

    grid.innerHTML = JORNADA_PRODE.map((match, i) => {
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

    document.getElementById('btnGuardarProde')?.addEventListener('click', guardarPronosticos);
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
    if (!currentUser) { showToast('Inicia sesion para guardar'); return; }
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
        const records = Object.entries(pronosticos).map(([idx, scores]) => ({
            user_id: currentUser.id, jornada: 9, partido_idx: parseInt(idx),
            gol_local: parseInt(scores.home), gol_visitante: parseInt(scores.away),
            created_at: new Date().toISOString()
        }));
        const { error } = await supabaseClient.from('pronosticos')
            .upsert(records, { onConflict: 'user_id,jornada,partido_idx' });
        if (error) throw error;
        showToast('Pronosticos guardados');
    } catch (e) { showToast('Error al guardar'); console.error(e); }
}

// ===== CALENDARIO =====
function initCalendario() {
    renderCalendario();
}

function renderCalendario() {
    const container = document.getElementById('calendarioContainer');
    if (!container) return;

    const pastJornadas = {};
    RESULTADOS_PASADOS.forEach(r => {
        if (!pastJornadas[r.jornada]) pastJornadas[r.jornada] = [];
        pastJornadas[r.jornada].push(r);
    });

    let html = '';

    for (let j = 1; j <= 8; j++) {
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
    }

    CALENDARIO_FECHAS.forEach(cf => {
        const isActive = cf.fecha === 9;
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

    for (let j = 16; j <= 30; j++) {
        const srcJ = j - 15;
        const srcMatches = srcJ <= 8 ? (pastJornadas[srcJ] || []) :
            (CALENDARIO_FECHAS.find(c => c.fecha === srcJ)?.partidos || []);
        html += '<div class="calendario-jornada">';
        html += '<div class="calendario-header" data-jornada="' + j + '">';
        html += '<span class="calendario-fecha-num">Fecha ' + j + '</span>';
        html += '<span class="calendario-fecha-date">Por definir</span>';
        html += '<span class="calendario-status proxima">Vuelta</span>';
        html += '<span class="calendario-toggle">&#9660;</span>';
        html += '</div>';
        html += '<div class="calendario-body" id="calBody' + j + '" style="display:none">';
        srcMatches.forEach(m => {
            const localKey = m.visitante || m.local;
            const visitKey = m.local || m.visitante;
            const eqL = EQUIPOS[localKey] || { nombre: localKey, logo: '' };
            const eqV = EQUIPOS[visitKey] || { nombre: visitKey, logo: '' };
            html += '<div class="calendario-match proxima">';
            html += '<div class="cal-team cal-home">';
            html += '<img src="' + eqL.logo + '" alt="" class="cal-logo">';
            html += '<span>' + eqL.nombre + '</span></div>';
            html += '<div class="cal-score cal-vs">vs</div>';
            html += '<div class="cal-team cal-away">';
            html += '<span>' + eqV.nombre + '</span>';
            html += '<img src="' + eqV.logo + '" alt="" class="cal-logo"></div>';
            html += '</div>';
        });
        html += '</div></div>';
    }

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
            if (error) throw error;
            currentUser = { id: data.user.id, email: data.user.email, nombre: data.user.email.split('@')[0] };
            await loadProfile(data.user.id);
            onLogin(currentUser); closeAuthModal();
            showToast('Bienvenido, ' + currentUser.nombre + '.');
        } else {
            const nombre = document.getElementById('inputNombreHincha').value;
            let equipo = document.getElementById('selectEquipo').value;
            const equipoManual = document.getElementById('inputEquipoManual')?.value.trim();
            if (equipo === '_otro' && equipoManual) equipo = equipoManual;
            if (!equipo) equipo = 'NEUTRAL';
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;
            if (data.user) {
                await supabaseClient.from('perfiles').insert({
                    id: data.user.id, nombre: nombre || email.split('@')[0],
                    equipo: equipo, partidos_estadio: 0
                });
                currentUser = { id: data.user.id, email, nombre: nombre || email.split('@')[0], equipo: equipo };
                onLogin(currentUser); closeAuthModal();
                showToast('Cuenta creada. Bienvenido, ' + currentUser.nombre + '.');
            }
        }
    } catch (err) { showToast(err.message || 'Error de autenticacion'); console.error(err); }
}

async function loadProfile(userId) {
    if (!supabaseClient) return;
    try {
        const { data } = await supabaseClient.from('perfiles').select('*').eq('id', userId).single();
        if (data) {
            currentUser.nombre = data.nombre || currentUser.nombre;
            currentUser.equipo = data.equipo || 'BSC';
            currentUser.partidos_estadio = data.partidos_estadio || 0;
        }
    } catch (e) { console.warn('Profile load error:', e); }
}

async function checkSession() {
    if (!supabaseClient) return;
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
            currentUser = { id: session.user.id, email: session.user.email, nombre: session.user.email.split('@')[0] };
            await loadProfile(session.user.id);
            onLogin(currentUser);
        }
    } catch (e) { console.warn('Session check:', e); }
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
        header.innerHTML = '<h2>' + liga.nombre + '</h2>' +
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

    // Get all completed jornadas (1-8)
    const completedJornadas = [];
    for (let j = 1; j <= 8; j++) {
        const matches = RESULTADOS_PASADOS.filter(r => r.jornada === j);
        if (matches.length > 0) completedJornadas.push({ jornada: j, matches });
    }

    // Get pronosticos for all members of this liga
    if (supabaseClient && !String(liga.id).startsWith('local_')) {
        const userIds = liga._members.map(m => m.user_id);
        try {
            const { data: pronosticos } = await supabaseClient.from('pronosticos')
                .select('user_id, jornada, partido_idx, gol_local, gol_visitante')
                .in('user_id', userIds)
                .in('jornada', completedJornadas.map(j => j.jornada));

            if (pronosticos) {
                liga._members.forEach(member => {
                    let totalPts = 0;
                    member.jornada_pts = {};
                    completedJornadas.forEach(cj => {
                        let jornadaPts = 0;
                        const myPreds = pronosticos.filter(p => p.user_id === member.user_id && p.jornada === cj.jornada);
                        myPreds.forEach(pred => {
                            const match = cj.matches[pred.partido_idx];
                            if (match) {
                                jornadaPts += calcMatchPoints(pred.gol_local, pred.gol_visitante, match.gl, match.gv);
                            }
                        });
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
    // Get all jornadas (1-8 completed + 9 active)
    const maxJornada = 9;
    let html = '<div class="liga-jornadas">';

    for (let j = maxJornada; j >= 1; j--) {
        const matches = RESULTADOS_PASADOS.filter(r => r.jornada === j);
        const isActive = j === 9;
        const isFuture = matches.length === 0 && isActive;

        html += '<div class="jornada-block' + (isActive ? ' jornada-active' : '') + '">';
        html += '<div class="jornada-header" data-jornada="' + j + '">' +
            '<h4>Jornada ' + j + (isActive ? ' <span class="jornada-live">EN CURSO</span>' : '') + '</h4>' +
            '<span class="jornada-toggle">&#9660;</span></div>';
        html += '<div class="jornada-body hidden" id="jornadaBody' + j + '">';

        if (isActive) {
            // Jornada 9 - show prode matches
            html += '<div class="jornada-matches">';
            JORNADA_PRODE.forEach(m => {
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
    const activeBody = document.getElementById('jornadaBody9');
    if (activeBody) {
        activeBody.classList.remove('hidden');
        const hdr = container.querySelector('[data-jornada="9"] .jornada-toggle');
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
    const misPartidos = RESULTADOS_PASADOS.filter(r => r.local === miEquipo || r.visitante === miEquipo);
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
        gol_local: gl, gol_visitante: gv,
        mi_equipo: miEquipo, es_local: esLocal,
        resultado, rival,
        created_at: new Date().toISOString()
    };

    if (supabaseClient) {
        try {
            const { error } = await supabaseClient.from('asistencias_estadio').insert(asistencia);
            if (error) throw error;
        } catch (e) { console.error('Insert error:', e); }
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
    const jornada = parseInt(document.getElementById('inputJornadaPartido').value) || null;
    const tipoTorneo = document.getElementById('selectTipoTorneo')?.value || 'LigaPro';
    const esLocal = document.getElementById('selectLocalVisitante').value === 'local';
    const rival = document.getElementById('selectRival').value;
    const rivalManual = document.getElementById('inputRivalManual')?.value.trim() || '';
    const rivalFinal = rival === '_manual' ? rivalManual : rival;
    const miGol = parseInt(document.getElementById('inputGolesMi').value);
    const rivalGol = parseInt(document.getElementById('inputGolesRival').value);

    if (!fecha || isNaN(miGol) || isNaN(rivalGol)) { showToast('Completa todos los campos'); return; }
    if (rival === '_manual' && !rivalManual) { showToast('Escribe el nombre del rival'); return; }

    const resultado = miGol > rivalGol ? 'W' : miGol < rivalGol ? 'L' : 'D';
    const local = esLocal ? miEquipo : rivalFinal;
    const visitante = esLocal ? rivalFinal : miEquipo;
    const gl = esLocal ? miGol : rivalGol;
    const gv = esLocal ? rivalGol : miGol;

    const asistencia = {
        user_id: currentUser.id, fecha, jornada,
        equipo_local: local, equipo_visitante: visitante,
        gol_local: gl, gol_visitante: gv,
        mi_equipo: miEquipo, es_local: esLocal,
        resultado, rival: rivalFinal,
        tipo_torneo: tipoTorneo,
        created_at: new Date().toISOString()
    };

    if (supabaseClient) {
        try {
            const { error } = await supabaseClient.from('asistencias_estadio').insert(asistencia);
            if (error) throw error;
        } catch (e) { console.error('Insert error:', e); }
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
        const rivalEq = EQUIPOS[a.rival] || { nombre: a.rival };
        const resLabel = a.resultado === 'W' ? 'V' : a.resultado === 'D' ? 'E' : 'D';
        const miGol = a.es_local ? a.gol_local : a.gol_visitante;
        const rivalGol = a.es_local ? a.gol_visitante : a.gol_local;
        return '<div class="attendance-item">' +
            '<div class="attendance-result ' + a.resultado + '">' + resLabel + '</div>' +
            '<div class="attendance-detail"><div class="attendance-teams">' +
            (a.es_local ? 'Local' : 'Visitante') + ' vs ' + rivalEq.nombre + '</div>' +
            '<div class="attendance-meta">J' + (a.jornada || '-') + ' | ' + a.fecha + '</div></div>' +
            '<div class="attendance-score">' + miGol + '-' + rivalGol + '</div></div>';
    }).join('');
}

// ===== PERFIL =====
function initPerfil() {
    // Perfil is updated via onLogin
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
    loadHinchaProfiles();
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
async function loadHinchaProfiles() {
    const grid = document.getElementById('hinchaGrid');
    if (!grid) return;
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.from('perfiles').select('id, nombre, equipo').limit(50);
            if (data && data.length > 0) {
                // For each profile, load their attendance stats
                const profiles = [];
                for (const p of data) {
                    const { data: asist } = await supabaseClient.from('asistencias_estadio')
                        .select('resultado').eq('user_id', p.id);
                    const total = asist ? asist.length : 0;
                    const w = asist ? asist.filter(a => a.resultado === 'W').length : 0;
                    const d = asist ? asist.filter(a => a.resultado === 'D').length : 0;
                    const l = asist ? asist.filter(a => a.resultado === 'L').length : 0;
                    profiles.push({ ...p, total, w, d, l });
                }
                profiles.sort((a, b) => b.total - a.total);
                grid.innerHTML = profiles.map(renderHinchaCard).join('');
                return;
            }
        } catch (e) { console.warn('Hincha profiles load error:', e); }
    }
    grid.innerHTML = '<div class="empty-state-sm">No hay perfiles disponibles aun.</div>';
}

function renderHinchaCard(p) {
    const eq = EQUIPOS[p.equipo];
    const eqName = eq ? eq.nombre : (p.equipo || 'Sin equipo');
    const initials = (p.nombre || '?').substring(0, 2).toUpperCase();
    return '<div class="hincha-card">' +
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
