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
const EQUIPOS = {
    'IDV': { nombre: 'Independiente del Valle', corto: 'IDV', color1: '#000', color2: '#D4A843',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1a1a1a" stroke="#D4A843" stroke-width="2"/><text x="20" y="16" text-anchor="middle" fill="#D4A843" font-size="7" font-weight="bold">IDV</text><polygon points="12,22 20,18 28,22 20,30" fill="#D4A843"/></svg>' },
    'UCA': { nombre: 'U. Catolica', corto: 'UCA', color1: '#003DA5', color2: '#FCD116',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003DA5" stroke="#FCD116" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">UC</text><text x="20" y="27" text-anchor="middle" fill="#FCD116" font-size="5">CATOLICA</text></svg>' },
    'BSC': { nombre: 'Barcelona SC', corto: 'BSC', color1: '#FFD700', color2: '#000',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#000" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#000" font-size="8" font-weight="bold">BSC</text><text x="20" y="27" text-anchor="middle" fill="#C8102E" font-size="5">GYE</text></svg>' },
    'AUC': { nombre: 'Aucas', corto: 'AUC', color1: '#FFD700', color2: '#C8102E',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#C8102E" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#C8102E" font-size="6" font-weight="bold">SD</text><text x="20" y="27" text-anchor="middle" fill="#C8102E" font-size="5">AUCAS</text></svg>' },
    'CUE': { nombre: 'Dep. Cuenca', corto: 'CUE', color1: '#C8102E', color2: '#FFF',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#C8102E" stroke="#FFF" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">DEP</text><text x="20" y="27" text-anchor="middle" fill="#FFD700" font-size="5">CUENCA</text></svg>' },
    'TEC': { nombre: 'Tecnico U.', corto: 'TEC', color1: '#800020', color2: '#FFF',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#800020" stroke="#FFF" stroke-width="2"/><text x="20" y="17" text-anchor="middle" filt="#FFF" font-size="5" font-weight="bold">TECNICO</text><text x="20" y="27" text-anchor="middle" fill="#FFF" font-size="6">U.</text></svg>' },
    'DLF': { nombre: 'Delfin SC', corto: 'DLF', color1: '#003366', color2: '#87CEEB',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003366" stroke="#87CEEB" stroke-width="2"/><path d="M14,22 Q20,14 26,22 Q20,18 14,22Z" fill="#87CEEB"/><text x="20" y="30" text-anchor="middle" fill="#FFF" font-size="5">DELFIN</text></svg>' },
    'MUS': { nombre: 'Mushuc Runa', corto: 'MUS', color1: '#006400', color2: '#FFD700',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#006400" stroke="#FFD700" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFD700" font-size="5" font-weight="bold">MUSHUC</text><text x="20" y="27" text-anchor="middle" fill="#FFF" font-size="5">RUNA</text></svg>' },
    'LDU': { nombre: 'Liga de Quito', corto: 'LDU', color1: '#FFF', color2: '#002776',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FFF" stroke="#002776" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#002776" font-size="7" font-weight="bold">LDU</text><text x="20" y="28" text-anchor="middle" fill="#C8102E" font-size="5">QUITO</text></svg>' },
    'LIB': { nombre: 'Libertad FC', corto: 'LIB', color1: '#1C1C1C', color2: '#C8102E',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1C1C1C" stroke="#C8102E" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="5" font-weight="bold">LIBERTAD</text><text x="20" y="27" text-anchor="middle" fill="#C8102E" font-size="5">FC</text></svg>' },
    'MAC': { nombre: 'Macara', corto: 'MAC', color1: '#003DA5', color2: '#FFF',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003DA5" stroke="#FFF" stroke-width="2"/><text x="20" y="22" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">MACARA</text></svg>' },
    'GCY': { nombre: 'Guayaquil City', corto: 'GCY', color1: '#4169E1', color2: '#FFD700',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#4169E1" stroke="#FFD700" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="5" font-weight="bold">GYE</text><text x="20" y="27" text-anchor="middle" fill="#FFD700" font-size="5">CITY</text></svg>' },
    'OVA': { nombre: 'Orense SC', corto: 'OVA', color1: '#006400', color2: '#FFD700',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#006400" stroke="#FFD700" stroke-width="2"/><text x="20" y="22" text-anchor="middle" fill="#FFD700" font-size="6" font-weight="bold">ORENSE</text></svg>' },
    'LDN': { nombre: 'Leones del Norte', corto: 'LDN', color1: '#8B0000', color2: '#FFD700',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#8B0000" stroke="#FFD700" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFD700" font-size="5" font-weight="bold">LEONES</text><text x="20" y="27" text-anchor="middle" fill="#FFF" font-size="4">DEL NORTE</text></svg>' },
    'EME': { nombre: 'Emelec', corto: 'EME', color1: '#003DA5', color2: '#6CACE4',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003DA5" stroke="#6CACE4" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="7" font-weight="bold">CS</text><text x="20" y="27" text-anchor="middle" fill="#6CACE4" font-size="5">EMELEC</text></svg>' },
    'MAN': { nombre: 'Manta FC', corto: 'MAN', color1: '#1B5E20', color2: '#FFF',
        svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1B5E20" stroke="#FFF" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">MANTA</text><text x="20" y="27" text-anchor="middle" fill="#FFD700" font-size="5">FC</text></svg>' }
};

// ===== DATOS FALLBACK — LigaPro 2026 Fecha 8 (12 Abril) =====
const FALLBACK_STANDINGS = [
    { id: 'IDV', pj: 8, g: 6, e: 1, p: 1, gf: 18, gc: 8 },
    { id: 'UCA', pj: 8, g: 5, e: 1, p: 2, gf: 14, gc: 7 },
    { id: 'BSC', pj: 8, g: 4, e: 3, p: 1, gf: 13, gc: 7 },
    { id: 'AUC', pj: 8, g: 4, e: 0, p: 4, gf: 11, gc: 12 },
    { id: 'CUE', pj: 8, g: 3, e: 2, p: 3, gf: 10, gc: 11 },
    { id: 'TEC', pj: 8, g: 3, e: 2, p: 3, gf: 9, gc: 9 },
    { id: 'DLF', pj: 8, g: 3, e: 2, p: 3, gf: 8, gc: 8 },
    { id: 'MUS', pj: 8, g: 3, e: 1, p: 4, gf: 7, gc: 10 },
    { id: 'LDU', pj: 8, g: 3, e: 1, p: 4, gf: 9, gc: 11 },
    { id: 'LIB', pj: 8, g: 3, e: 1, p: 4, gf: 8, gc: 10 },
    { id: 'MAC', pj: 8, g: 3, e: 1, p: 4, gf: 7, gc: 11 },
    { id: 'GCY', pj: 8, g: 2, e: 3, p: 3, gf: 9, gc: 10 },
    { id: 'OVA', pj: 8, g: 2, e: 2, p: 4, gf: 8, gc: 12 },
    { id: 'LDN', pj: 8, g: 2, e: 1, p: 5, gf: 6, gc: 13 },
    { id: 'EME', pj: 8, g: 2, e: 2, p: 4, gf: 7, gc: 11 },
    { id: 'MAN', pj: 8, g: 1, e: 1, p: 6, gf: 5, gc: 14 }
];
// Nota: Emelec tiene -3 pts por sancion de la FEF (5 pts mostrados = 8 ganados - 3 penalizacion)

const FALLBACK_GOLEADORES = [
    { nombre: 'Djorkaeff Reasco', equipo: 'IDV', goles: 6 },
    { nombre: 'Byron Palacios', equipo: 'UCA', goles: 5 },
    { nombre: 'Gonzalo Mastriani', equipo: 'BSC', goles: 5 },
    { nombre: 'Facundo Barcelo', equipo: 'AUC', goles: 4 },
    { nombre: 'Junior Sornoza', equipo: 'DLF', goles: 4 },
    { nombre: 'Michael Hoyos', equipo: 'GCY', goles: 3 },
    { nombre: 'Alex Arce', equipo: 'LDU', goles: 3 },
    { nombre: 'Janner Corozo', equipo: 'CUE', goles: 3 }
];

const FALLBACK_ASISTENCIAS = [
    { nombre: 'Lorenzo Faravelli', equipo: 'IDV', asistencias: 5 },
    { nombre: 'Joao Rojas', equipo: 'BSC', asistencias: 4 },
    { nombre: 'Nilson Angulo', equipo: 'LDU', asistencias: 4 },
    { nombre: 'Washington Corozo', equipo: 'UCA', asistencias: 3 },
    { nombre: 'Bryan Castillo', equipo: 'DLF', asistencias: 3 },
    { nombre: 'Romario Caicedo', equipo: 'EME', asistencias: 3 },
    { nombre: 'Fidel Martinez', equipo: 'AUC', asistencias: 2 },
    { nombre: 'Pedro Vite', equipo: 'MUS', asistencias: 2 }
];

// Resultados pasados para seccion Hinchas (BSC y todos los equipos)
const RESULTADOS_PASADOS = [
    { jornada: 1, fecha: '2026-02-20', local: 'BSC', visitante: 'MAN', gl: 2, gv: 0 },
    { jornada: 1, fecha: '2026-02-20', local: 'IDV', visitante: 'OVA', gl: 3, gv: 1 },
    { jornada: 1, fecha: '2026-02-20', local: 'LDU', visitante: 'LIB', gl: 1, gv: 1 },
    { jornada: 1, fecha: '2026-02-20', local: 'UCA', visitante: 'EME', gl: 2, gv: 0 },
    { jornada: 1, fecha: '2026-02-21', local: 'AUC', visitante: 'MAC', gl: 1, gv: 0 },
    { jornada: 1, fecha: '2026-02-21', local: 'CUE', visitante: 'GCY', gl: 0, gv: 0 },
    { jornada: 1, fecha: '2026-02-21', local: 'DLF', visitante: 'TEC', gl: 1, gv: 1 },
    { jornada: 1, fecha: '2026-02-21', local: 'MUS', visitante: 'LDN', gl: 2, gv: 1 },
    { jornada: 2, fecha: '2026-02-27', local: 'EME', visitante: 'BSC', gl: 0, gv: 1 },
    { jornada: 2, fecha: '2026-02-27', local: 'OVA', visitante: 'UCA', gl: 1, gv: 2 },
    { jornada: 2, fecha: '2026-02-27', local: 'LIB', visitante: 'IDV', gl: 0, gv: 2 },
    { jornada: 2, fecha: '2026-02-27', local: 'MAC', visitante: 'LDU', gl: 1, gv: 0 },
    { jornada: 3, fecha: '2026-03-06', local: 'BSC', visitante: 'DLF', gl: 2, gv: 1 },
    { jornada: 3, fecha: '2026-03-06', local: 'IDV', visitante: 'AUC', gl: 1, gv: 0 },
    { jornada: 3, fecha: '2026-03-06', local: 'UCA', visitante: 'MUS', gl: 3, gv: 1 },
    { jornada: 3, fecha: '2026-03-06', local: 'LDU', visitante: 'CUE', gl: 2, gv: 2 },
    { jornada: 4, fecha: '2026-03-13', local: 'GCY', visitante: 'BSC', gl: 1, gv: 1 },
    { jornada: 4, fecha: '2026-03-13', local: 'TEC', visitante: 'IDV', gl: 0, gv: 1 },
    { jornada: 4, fecha: '2026-03-13', local: 'AUC', visitante: 'UCA', gl: 2, gv: 1 },
    { jornada: 4, fecha: '2026-03-13', local: 'MAN', visitante: 'LDU', gl: 0, gv: 2 },
    { jornada: 5, fecha: '2026-03-20', local: 'BSC', visitante: 'UCA', gl: 1, gv: 0 },
    { jornada: 5, fecha: '2026-03-20', local: 'IDV', visitante: 'GCY', gl: 2, gv: 0 },
    { jornada: 5, fecha: '2026-03-20', local: 'LDU', visitante: 'AUC', gl: 0, gv: 1 },
    { jornada: 5, fecha: '2026-03-20', local: 'CUE', visitante: 'TEC', gl: 1, gv: 0 },
    { jornada: 6, fecha: '2026-03-27', local: 'LDN', visitante: 'BSC', gl: 0, gv: 2 },
    { jornada: 6, fecha: '2026-03-27', local: 'IDV', visitante: 'EME', gl: 3, gv: 0 },
    { jornada: 6, fecha: '2026-03-27', local: 'UCA', visitante: 'LDU', gl: 1, gv: 0 },
    { jornada: 6, fecha: '2026-03-27', local: 'DLF', visitante: 'AUC', gl: 2, gv: 2 },
    { jornada: 7, fecha: '2026-04-03', local: 'BSC', visitante: 'AUC', gl: 1, gv: 2 },
    { jornada: 7, fecha: '2026-04-03', local: 'IDV', visitante: 'LDU', gl: 2, gv: 1 },
    { jornada: 7, fecha: '2026-04-03', local: 'MAC', visitante: 'UCA', gl: 0, gv: 1 },
    { jornada: 7, fecha: '2026-04-03', local: 'EME', visitante: 'CUE', gl: 1, gv: 1 },
    { jornada: 8, fecha: '2026-04-12', local: 'BSC', visitante: 'LDN', gl: 2, gv: 1 },
    { jornada: 8, fecha: '2026-04-12', local: 'IDV', visitante: 'CUE', gl: 3, gv: 2 },
    { jornada: 8, fecha: '2026-04-12', local: 'UCA', visitante: 'TEC', gl: 2, gv: 0 },
    { jornada: 8, fecha: '2026-04-12', local: 'AUC', visitante: 'EME', gl: 2, gv: 0 },
    { jornada: 8, fecha: '2026-04-12', local: 'DLF', visitante: 'LDU', gl: 1, gv: 0 },
    { jornada: 8, fecha: '2026-04-12', local: 'MUS', visitante: 'MAN', gl: 1, gv: 0 },
    { jornada: 8, fecha: '2026-04-12', local: 'OVA', visitante: 'LIB', gl: 2, gv: 1 },
    { jornada: 8, fecha: '2026-04-12', local: 'GCY', visitante: 'MAC', gl: 2, gv: 1 }
];

const JORNADA_PRODE = [
    { jornada: 9, local: 'LDN', visitante: 'IDV' },
    { jornada: 9, local: 'EME', visitante: 'UCA' },
    { jornada: 9, local: 'TEC', visitante: 'BSC' },
    { jornada: 9, local: 'LDU', visitante: 'MUS' },
    { jornada: 9, local: 'CUE', visitante: 'DLF' },
    { jornada: 9, local: 'MAC', visitante: 'AUC' },
    { jornada: 9, local: 'MAN', visitante: 'OVA' },
    { jornada: 9, local: 'LIB', visitante: 'GCY' }
];

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
            '<td class="col-team"><div class="team-cell"><div class="team-badge">' + equipo.svg + '</div><span class="team-name">' + equipo.nombre + '</span></div></td>' +
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
            '<div class="prode-team home"><div class="team-badge">' + local.svg + '</div><span>' + local.corto + '</span></div>' +
            '<div class="prode-score">' +
            '<input type="number" min="0" max="20" class="prode-input" data-match="' + i + '" data-side="home" placeholder="-">' +
            '<span class="prode-vs">vs</span>' +
            '<input type="number" min="0" max="20" class="prode-input" data-match="' + i + '" data-side="away" placeholder="-">' +
            '</div>' +
            '<div class="prode-team away"><span>' + visitante.corto + '</span><div class="team-badge">' + visitante.svg + '</div></div></div>';
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

    const select = document.getElementById('selectEquipo');
    if (select) {
        Object.entries(EQUIPOS).forEach(([id, eq]) => {
            const opt = document.createElement('option');
            opt.value = id; opt.textContent = eq.nombre;
            select.appendChild(opt);
        });
    }
}

function openAuthModal(mode) {
    authMode = mode;
    const m = document.getElementById('authModal');
    document.getElementById('modalTitle').textContent = mode === 'login' ? 'Iniciar Sesion' : 'Crear Cuenta';
    document.getElementById('btnAuthSubmit').textContent = mode === 'login' ? 'Entrar' : 'Registrarme';
    document.getElementById('registerNameGroup').classList.toggle('hidden', mode === 'login');
    document.getElementById('registerTeamGroup').classList.toggle('hidden', mode === 'login');
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
        currentUser = { id: 'demo', email, nombre: email.split('@')[0], equipo: 'BSC' };
        onLogin(currentUser); closeAuthModal();
        showToast('Bienvenido, ' + currentUser.nombre + '! (modo demo)');
        return;
    }
    try {
        if (authMode === 'login') {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            currentUser = { id: data.user.id, email: data.user.email, nombre: data.user.email.split('@')[0] };
            await loadProfile(data.user.id);
            onLogin(currentUser); closeAuthModal();
            showToast('Bienvenido de vuelta, ' + currentUser.nombre + '!');
        } else {
            const nombre = document.getElementById('inputNombreHincha').value;
            const equipo = document.getElementById('selectEquipo').value;
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;
            if (data.user) {
                await supabaseClient.from('perfiles').insert({
                    id: data.user.id, nombre: nombre || email.split('@')[0],
                    equipo: equipo || 'BSC', partidos_estadio: 0
                });
                currentUser = { id: data.user.id, email, nombre: nombre || email.split('@')[0], equipo: equipo || 'BSC' };
                onLogin(currentUser); closeAuthModal();
                showToast('Cuenta creada! Bienvenido, ' + currentUser.nombre);
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
    showToast('Sesion cerrada');
}

// ===== LIGAS PRIVADAS =====
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
        document.getElementById('ligasList')?.classList.remove('hidden');
    });
    loadLigas();
}

async function crearLiga(e) {
    e.preventDefault();
    const nombre = document.getElementById('inputNombreLiga').value.trim();
    if (!nombre) return;
    const codigo = generarCodigo();
    if (supabaseClient && currentUser) {
        try {
            const { data, error } = await supabaseClient.from('ligas').insert({
                nombre, codigo, creador_id: currentUser.id, created_at: new Date().toISOString()
            }).select().single();
            if (error) throw error;
            await supabaseClient.from('liga_miembros').insert({ liga_id: data.id, user_id: currentUser.id });
            showToast('Liga creada! Codigo: ' + codigo);
            document.getElementById('crearLigaModal')?.classList.add('hidden');
            document.getElementById('inputNombreLiga').value = '';
            loadLigas();
        } catch (err) { showToast('Error al crear liga'); console.error(err); }
    } else {
        showToast('Liga "' + nombre + '" creada (demo). Codigo: ' + codigo);
        document.getElementById('crearLigaModal')?.classList.add('hidden');
    }
}

async function unirseLiga() {
    if (!currentUser) { showToast('Inicia sesion primero'); openAuthModal('login'); return; }
    const codigo = document.getElementById('inputCodigoLiga')?.value.trim();
    if (!codigo) { showToast('Ingresa un codigo de liga'); return; }
    if (supabaseClient) {
        try {
            const { data: liga, error } = await supabaseClient.from('ligas').select('id, nombre').eq('codigo', codigo.toUpperCase()).single();
            if (error || !liga) { showToast('Codigo no encontrado'); return; }
            await supabaseClient.from('liga_miembros').insert({ liga_id: liga.id, user_id: currentUser.id });
            showToast('Te uniste a "' + liga.nombre + '"!');
            document.getElementById('inputCodigoLiga').value = '';
            loadLigas();
        } catch (err) { showToast('Error al unirse'); console.error(err); }
    } else { showToast('Unido a liga (demo)'); }
}

async function loadLigas() {
    if (!supabaseClient || !currentUser) return;
    const container = document.getElementById('ligasList');
    if (!container) return;
    try {
        const { data: memberships } = await supabaseClient.from('liga_miembros')
            .select('liga_id, ligas(id, nombre, codigo)').eq('user_id', currentUser.id);
        if (memberships && memberships.length > 0) {
            container.innerHTML = memberships.map(m => {
                const l = m.ligas;
                return '<div class="liga-card"><div class="liga-card-info"><h4>' + l.nombre + '</h4><p>Codigo: ' + l.codigo + '</p></div><span class="liga-card-members">&#8594;</span></div>';
            }).join('');
        }
    } catch (e) { console.warn('Ligas load error:', e); }
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
    showToast('Asistencia registrada! ' + (resultado === 'W' ? 'Victoria!' : resultado === 'D' ? 'Empate' : 'Derrota'));
}

async function registrarManual(e) {
    e.preventDefault();
    if (!currentUser) return;
    const miEquipo = currentUser.equipo || 'BSC';
    const fecha = document.getElementById('inputFechaPartido').value;
    const jornada = parseInt(document.getElementById('inputJornadaPartido').value) || null;
    const esLocal = document.getElementById('selectLocalVisitante').value === 'local';
    const rival = document.getElementById('selectRival').value;
    const miGol = parseInt(document.getElementById('inputGolesMi').value);
    const rivalGol = parseInt(document.getElementById('inputGolesRival').value);

    if (!fecha || isNaN(miGol) || isNaN(rivalGol)) { showToast('Completa todos los campos'); return; }

    const resultado = miGol > rivalGol ? 'W' : miGol < rivalGol ? 'L' : 'D';
    const local = esLocal ? miEquipo : rival;
    const visitante = esLocal ? rival : miEquipo;
    const gl = esLocal ? miGol : rivalGol;
    const gv = esLocal ? rivalGol : miGol;

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
    renderAttendanceHistory();
    document.getElementById('manualFormPanel')?.classList.add('hidden');
    document.getElementById('manualAsistenciaForm')?.reset();
    showToast('Asistencia registrada! ' + (resultado === 'W' ? 'Victoria!' : resultado === 'D' ? 'Empate' : 'Derrota'));
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
    updateSaladez(total, wins, draws, losses);
}

function updateSaladez(total, wins, draws, losses) {
    if (total === 0) return;
    // Saladez = higher means more "salado" (team loses when you attend)
    const lossPct = Math.round(losses / total * 100);
    const saladez = Math.min(100, Math.max(5, lossPct + Math.floor(draws / total * 30)));
    const fill = document.getElementById('saladezFill');
    const label = document.getElementById('saladezLabel');

    if (fill) fill.style.width = saladez + '%';
    let texto = '';
    if (saladez < 20) texto = 'Amuleto bendito! Tu equipo vuela contigo';
    else if (saladez < 40) texto = 'Hincha de buena fe, normal nomas';
    else if (saladez < 60) texto = 'Medio salado... mejor no vayas tan seguido';
    else if (saladez < 80) texto = 'Salado confirmado. Tu equipo tiembla cuando llegas';
    else texto = 'MUFA TOTAL. Quedate en casa, por favor';
    if (label) label.textContent = saladez + '% - ' + texto;

    // Veredicto
    const veredicto = document.getElementById('veredictoText');
    const perfilVeredicto = document.getElementById('perfilVeredictoBox');
    const veredictos = [
        'Oe causa, tu equipo gana cuando tu vas al estadio. Eres el amuleto que todo DT quisiera. Sigue yendo que contigo en la tribuna ni Messi nos gana.',
        'Mira loco, ni sales ni paras. A veces tu equipo gana, a veces pierde. Eres como la lluvia en Guayaquil: impredecible pero parte del paisaje.',
        'Oye brother, cuando vas al estadio tu equipo juega como si tuvieran los guayos al reves. Mejor quedate en casa viendo por el celular.',
        'HERMANO. Cada vez que pisas el estadio es gol del rival. La tribuna te tiene fichado. Eres mas salado que el agua del estero. Quedate leyendo esto desde tu casa.'
    ];
    const idx = saladez < 25 ? 0 : saladez < 50 ? 1 : saladez < 75 ? 2 : 3;
    if (veredicto) veredicto.textContent = veredictos[idx];
    if (perfilVeredicto) perfilVeredicto.innerHTML = '<p class="veredicto-text">' + veredictos[idx] + '</p>';
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

