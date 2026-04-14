/* ============================================
   TERCERTIEMPO — main.js
   Single JS file: Config + Auth + Data + App
   ============================================ */

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://upuimmozwczajuxnsgoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdWltbW96d2N6YWp1eG5zZ29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzEzMTQsImV4cCI6MjA5MTcwNzMxNH0.QKDmbwXSB5djbavS5T-U3z6aIxcw8akNwi4771Z0dF8';

// Initialize Supabase client
let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected');
    }
} catch (e) {
    console.warn('⚠️ Supabase not loaded, running in demo mode');
}

// ===== TEAM DATA WITH SVG BADGES =====
const EQUIPOS = {
    'IDV': {
        nombre: 'Independiente del Valle',
        corto: 'IDV',
        color1: '#000000', color2: '#D4A843',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1a1a1a" stroke="#D4A843" stroke-width="2"/><text x="20" y="16" text-anchor="middle" fill="#D4A843" font-size="7" font-weight="bold">IDV</text><polygon points="12,22 20,18 28,22 20,30" fill="#D4A843"/></svg>`
    },
    'LDU': {
        nombre: 'Liga de Quito',
        corto: 'LDU',
        color1: '#FFFFFF', color2: '#002776',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="#002776" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#002776" font-size="7" font-weight="bold">LDU</text><text x="20" y="28" text-anchor="middle" fill="#C8102E" font-size="5">QUITO</text></svg>`
    },
    'BSC': {
        nombre: 'Barcelona SC',
        corto: 'BSC',
        color1: '#FFD700', color2: '#000000',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#000" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#000" font-size="8" font-weight="bold">BSC</text><text x="20" y="27" text-anchor="middle" fill="#C8102E" font-size="5">GYE</text></svg>`
    },
    'EME': {
        nombre: 'Emelec',
        corto: 'EME',
        color1: '#003DA5', color2: '#6CACE4',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003DA5" stroke="#6CACE4" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="7" font-weight="bold">CS</text><text x="20" y="27" text-anchor="middle" fill="#6CACE4" font-size="5">EMELEC</text></svg>`
    },
    'DLF': {
        nombre: 'Delfín SC',
        corto: 'DLF',
        color1: '#003366', color2: '#87CEEB',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003366" stroke="#87CEEB" stroke-width="2"/><path d="M14,22 Q20,14 26,22 Q20,18 14,22Z" fill="#87CEEB"/><text x="20" y="30" text-anchor="middle" fill="#FFF" font-size="5">DELFÍN</text></svg>`
    },
    'UCA': {
        nombre: 'U. Católica',
        corto: 'UCA',
        color1: '#003DA5', color2: '#FCD116',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003DA5" stroke="#FCD116" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">UC</text><text x="20" y="27" text-anchor="middle" fill="#FCD116" font-size="5">CATÓLICA</text></svg>`
    },
    'SDQ': {
        nombre: 'Dep. Quito',
        corto: 'SDQ',
        color1: '#C8102E', color2: '#003DA5',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#C8102E" stroke="#003DA5" stroke-width="2.5"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">DEP</text><text x="20" y="27" text-anchor="middle" fill="#003DA5" font-size="5">QUITO</text></svg>`
    },
    'AUC': {
        nombre: 'Aucas',
        corto: 'AUC',
        color1: '#FFD700', color2: '#C8102E',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#C8102E" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#C8102E" font-size="6" font-weight="bold">SD</text><text x="20" y="27" text-anchor="middle" fill="#C8102E" font-size="5">AUCAS</text></svg>`
    },
    'MAC': {
        nombre: 'Macará',
        corto: 'MAC',
        color1: '#003DA5', color2: '#FFFFFF',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#003DA5" stroke="#FFF" stroke-width="2"/><text x="20" y="22" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">MACARÁ</text></svg>`
    },
    'MUS': {
        nombre: 'Mushuc Runa',
        corto: 'MUS',
        color1: '#006400', color2: '#FFD700',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#006400" stroke="#FFD700" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFD700" font-size="5" font-weight="bold">MUSHUC</text><text x="20" y="27" text-anchor="middle" fill="#FFF" font-size="5">RUNA</text></svg>`
    },
    'TEC': {
        nombre: 'Técnico U.',
        corto: 'TEC',
        color1: '#800020', color2: '#FFFFFF',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#800020" stroke="#FFF" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="5" font-weight="bold">TÉCNICO</text><text x="20" y="27" text-anchor="middle" fill="#FFF" font-size="6">U.</text></svg>`
    },
    'CUE': {
        nombre: 'Dep. Cuenca',
        corto: 'CUE',
        color1: '#C8102E', color2: '#FFF',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#C8102E" stroke="#FFF" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="6" font-weight="bold">DEP</text><text x="20" y="27" text-anchor="middle" fill="#FFD700" font-size="5">CUENCA</text></svg>`
    },
    'OVA': {
        nombre: 'Orense SC',
        corto: 'OVA',
        color1: '#006400', color2: '#FFD700',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#006400" stroke="#FFD700" stroke-width="2"/><text x="20" y="22" text-anchor="middle" fill="#FFD700" font-size="6" font-weight="bold">ORENSE</text></svg>`
    },
    'LIB': {
        nombre: 'Libertad FC',
        corto: 'LIB',
        color1: '#1C1C1C', color2: '#C8102E',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1C1C1C" stroke="#C8102E" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="5" font-weight="bold">LIBERTAD</text><text x="20" y="27" text-anchor="middle" fill="#C8102E" font-size="5">FC</text></svg>`
    },
    'CUM': {
        nombre: 'Cumbayá FC',
        corto: 'CUM',
        color1: '#FF6B00', color2: '#1a1a1a',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FF6B00" stroke="#1a1a1a" stroke-width="2"/><text x="20" y="17" text-anchor="middle" fill="#FFF" font-size="5" font-weight="bold">CUMBAYÁ</text><text x="20" y="27" text-anchor="middle" fill="#1a1a1a" font-size="5">FC</text></svg>`
    },
    'IND': {
        nombre: 'El Nacional',
        corto: 'IND',
        color1: '#C8102E', color2: '#003DA5',
        svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#C8102E" stroke="#003DA5" stroke-width="2"/><text x="20" y="15" text-anchor="middle" fill="#FFF" font-size="5" font-weight="bold">EL</text><text x="20" y="25" text-anchor="middle" fill="#003DA5" font-size="5" font-weight="bold">NACIONAL</text></svg>`
    }
};

// ===== STANDINGS DATA — LigaPro 2026 Fecha 8 (13 Abril) =====
// Approximate data based on season progress
const STANDINGS_DATA = [
    { id: 'IDV', pj: 8, g: 6, e: 1, p: 1, gf: 16, gc: 6 },
    { id: 'LDU', pj: 8, g: 5, e: 2, p: 1, gf: 14, gc: 7 },
    { id: 'BSC', pj: 8, g: 5, e: 1, p: 2, gf: 13, gc: 8 },
    { id: 'EME', pj: 8, g: 4, e: 3, p: 1, gf: 12, gc: 7 },
    { id: 'DLF', pj: 8, g: 4, e: 2, p: 2, gf: 10, gc: 8 },
    { id: 'UCA', pj: 8, g: 4, e: 1, p: 3, gf: 11, gc: 9 },
    { id: 'SDQ', pj: 8, g: 3, e: 3, p: 2, gf: 10, gc: 8 },
    { id: 'AUC', pj: 8, g: 3, e: 2, p: 3, gf: 9, gc: 10 },
    { id: 'MAC', pj: 8, g: 3, e: 2, p: 3, gf: 8, gc: 9 },
    { id: 'MUS', pj: 8, g: 3, e: 1, p: 4, gf: 8, gc: 11 },
    { id: 'TEC', pj: 8, g: 2, e: 3, p: 3, gf: 9, gc: 10 },
    { id: 'CUE', pj: 8, g: 2, e: 2, p: 4, gf: 7, gc: 10 },
    { id: 'OVA', pj: 8, g: 2, e: 2, p: 4, gf: 6, gc: 11 },
    { id: 'LIB', pj: 8, g: 1, e: 3, p: 4, gf: 6, gc: 12 },
    { id: 'CUM', pj: 8, g: 1, e: 2, p: 5, gf: 5, gc: 13 },
    { id: 'IND', pj: 8, g: 0, e: 4, p: 4, gf: 5, gc: 14 }
];

// ===== STATS DATA =====
const GOLEADORES = [
    { nombre: 'Jhon Cifuente', equipo: 'IDV', goles: 7 },
    { nombre: 'Paolo Guerrero', equipo: 'LDU', goles: 6 },
    { nombre: 'Gonzalo Mastriani', equipo: 'BSC', goles: 5 },
    { nombre: 'Facundo Barceló', equipo: 'EME', goles: 5 },
    { nombre: 'Michael Estrada', equipo: 'DLF', goles: 4 },
    { nombre: 'Cristian Martínez', equipo: 'UCA', goles: 4 },
    { nombre: 'Alexander Alvarado', equipo: 'SDQ', goles: 3 },
    { nombre: 'Bryan Caicedo', equipo: 'AUC', goles: 3 }
];

const ASISTENCIAS = [
    { nombre: 'Joao Rojas', equipo: 'EME', asistencias: 6 },
    { nombre: 'Lorenzo Faravelli', equipo: 'IDV', asistencias: 5 },
    { nombre: 'Nilson Angulo', equipo: 'LDU', asistencias: 5 },
    { nombre: 'Byron Castillo', equipo: 'BSC', asistencias: 4 },
    { nombre: 'Junior Sornoza', equipo: 'DLF', asistencias: 4 },
    { nombre: 'Washington Corozo', equipo: 'UCA', asistencias: 3 },
    { nombre: 'Ángel Mena', equipo: 'SDQ', asistencias: 3 },
    { nombre: 'Carlos Garcés', equipo: 'AUC', asistencias: 3 }
];

// ===== PRODE JORNADA 9 DATA =====
const JORNADA9 = [
    { local: 'IDV', visitante: 'CUM' },
    { local: 'BSC', visitante: 'EME' },
    { local: 'LDU', visitante: 'AUC' },
    { local: 'DLF', visitante: 'SDQ' },
    { local: 'UCA', visitante: 'MAC' },
    { local: 'MUS', visitante: 'TEC' },
    { local: 'CUE', visitante: 'OVA' },
    { local: 'LIB', visitante: 'IND' }
];


// ============================================
// APP STATE
// ============================================
let currentUser = null;
let currentTab = 'tabla';
let authMode = 'login'; // 'login' or 'register'

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderStandings();
    renderStats();
    renderProde();
    initAuth();
    initLigas();
    initPerfil();
    checkSession();
});


// ============================================
// TAB NAVIGATION
// ============================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    // Update content
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.toggle('active', section.id === `tab-${tabId}`);
    });
    currentTab = tabId;
}


// ============================================
// STANDINGS TABLE
// ============================================
function renderStandings() {
    const tbody = document.getElementById('standingsBody');
    if (!tbody) return;

    // Calculate points and DG
    const teams = STANDINGS_DATA.map(t => ({
        ...t,
        pts: t.g * 3 + t.e,
        dg: t.gf - t.gc
    }));

    // Sort by PTS desc, then DG desc, then GF desc
    teams.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

    tbody.innerHTML = teams.map((t, i) => {
        const pos = i + 1;
        const equipo = EQUIPOS[t.id];
        let zoneClass = '';
        if (pos <= 6) zoneClass = 'zone-libertadores';
        else if (pos <= 10) zoneClass = 'zone-sudamericana';
        else if (pos >= 15) zoneClass = 'zone-descenso';

        const dgStr = t.dg > 0 ? `+${t.dg}` : t.dg;

        return `
            <tr class="${zoneClass}">
                <td class="col-pos">${pos}</td>
                <td class="col-team">
                    <div class="team-cell">
                        <div class="team-badge">${equipo.svg}</div>
                        <span class="team-name">${equipo.nombre}</span>
                    </div>
                </td>
                <td class="col-stat">${t.pj}</td>
                <td class="col-stat">${t.g}</td>
                <td class="col-stat">${t.e}</td>
                <td class="col-stat">${t.p}</td>
                <td class="col-stat">${t.gf}</td>
                <td class="col-stat">${t.gc}</td>
                <td class="col-stat">${dgStr}</td>
                <td class="col-pts">${t.pts}</td>
            </tr>
        `;
    }).join('');
}


// ============================================
// STATISTICS
// ============================================
function renderStats() {
    renderStatList('goleadoresList', GOLEADORES, 'goles');
    renderStatList('asistenciasList', ASISTENCIAS, 'asistencias');
    renderAtaqueDefensa();
}

function renderStatList(containerId, data, key) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map((item, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        const equipo = EQUIPOS[item.equipo];
        return `
            <div class="stat-row">
                <span class="stat-rank ${rankClass}">${i + 1}</span>
                <div class="stat-player">
                    <div class="stat-player-name">${item.nombre}</div>
                    <div class="stat-player-team">${equipo ? equipo.nombre : item.equipo}</div>
                </div>
                <span class="stat-value">${item[key]}</span>
            </div>
        `;
    }).join('');
}

function renderAtaqueDefensa() {
    // Best attack: sort by GF desc
    const teams = STANDINGS_DATA.map(t => ({ ...t }));

    const ataque = [...teams].sort((a, b) => b.gf - a.gf).slice(0, 6);
    const defensa = [...teams].sort((a, b) => a.gc - b.gc).slice(0, 6);

    const ataqueContainer = document.getElementById('ataqueList');
    if (ataqueContainer) {
        ataqueContainer.innerHTML = ataque.map((t, i) => {
            const equipo = EQUIPOS[t.id];
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return `
                <div class="stat-row">
                    <span class="stat-rank ${rankClass}">${i + 1}</span>
                    <div class="stat-player">
                        <div class="stat-player-name">${equipo.nombre}</div>
                        <div class="stat-player-team">${t.gf} goles en ${t.pj} partidos</div>
                    </div>
                    <span class="stat-value">${t.gf}</span>
                </div>
            `;
        }).join('');
    }

    const defensaContainer = document.getElementById('defensaList');
    if (defensaContainer) {
        defensaContainer.innerHTML = defensa.map((t, i) => {
            const equipo = EQUIPOS[t.id];
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return `
                <div class="stat-row">
                    <span class="stat-rank ${rankClass}">${i + 1}</span>
                    <div class="stat-player">
                        <div class="stat-player-name">${equipo.nombre}</div>
                        <div class="stat-player-team">${t.gc} goles recibidos</div>
                    </div>
                    <span class="stat-value">${t.gc}</span>
                </div>
            `;
        }).join('');
    }
}


// ============================================
// PRODE GLOBAL
// ============================================
function renderProde() {
    const grid = document.getElementById('prodeGrid');
    if (!grid) return;

    grid.innerHTML = JORNADA9.map((match, i) => {
        const local = EQUIPOS[match.local];
        const visitante = EQUIPOS[match.visitante];
        return `
            <div class="prode-match">
                <div class="prode-team home">
                    <div class="team-badge">${local.svg}</div>
                    <span>${local.corto}</span>
                </div>
                <div class="prode-score">
                    <input type="number" min="0" max="20" class="prode-input" data-match="${i}" data-side="home" placeholder="-">
                    <span class="prode-vs">vs</span>
                    <input type="number" min="0" max="20" class="prode-input" data-match="${i}" data-side="away" placeholder="-">
                </div>
                <div class="prode-team away">
                    <span>${visitante.corto}</span>
                    <div class="team-badge">${visitante.svg}</div>
                </div>
            </div>
        `;
    }).join('');

    // Save button
    const btnGuardar = document.getElementById('btnGuardarProde');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarPronosticos);
    }
}

function guardarPronosticos() {
    if (!currentUser) {
        showToast('Inicia sesión para guardar tus pronósticos');
        openAuthModal('login');
        return;
    }

    const inputs = document.querySelectorAll('.prode-input');
    const pronosticos = {};
    let completo = true;

    inputs.forEach(input => {
        const match = input.dataset.match;
        const side = input.dataset.side;
        if (!pronosticos[match]) pronosticos[match] = {};
        pronosticos[match][side] = input.value;
        if (input.value === '') completo = false;
    });

    if (!completo) {
        showToast('Completa todos los marcadores');
        return;
    }

    // Save to Supabase if available
    if (supabaseClient) {
        savePronosticosToSupabase(pronosticos);
    } else {
        showToast('✅ Pronósticos guardados (modo demo)');
    }
}

async function savePronosticosToSupabase(pronosticos) {
    try {
        const records = Object.entries(pronosticos).map(([matchIdx, scores]) => ({
            user_id: currentUser.id,
            jornada: 9,
            partido_idx: parseInt(matchIdx),
            gol_local: parseInt(scores.home),
            gol_visitante: parseInt(scores.away),
            created_at: new Date().toISOString()
        }));

        const { error } = await supabaseClient
            .from('pronosticos')
            .upsert(records, { onConflict: 'user_id,jornada,partido_idx' });

        if (error) throw error;
        showToast('✅ Pronósticos guardados exitosamente');
    } catch (err) {
        console.error('Error saving pronosticos:', err);
        showToast('Error al guardar. Intenta de nuevo.');
    }
}


// ============================================
// AUTH SYSTEM
// ============================================
function initAuth() {
    // Login/Register buttons
    document.getElementById('btnLogin')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btnRegister')?.addEventListener('click', () => openAuthModal('register'));
    document.getElementById('btnPerfilLogin')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btnLogout')?.addEventListener('click', logout);

    // Modal controls
    document.getElementById('modalClose')?.addEventListener('click', closeAuthModal);
    document.getElementById('modalSwitchLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal(authMode === 'login' ? 'register' : 'login');
    });

    // Auth form submit
    document.getElementById('authForm')?.addEventListener('submit', handleAuth);

    // Close modal on overlay click
    document.getElementById('authModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'authModal') closeAuthModal();
    });

    // Populate team select
    const select = document.getElementById('selectEquipo');
    if (select) {
        Object.entries(EQUIPOS).forEach(([id, equipo]) => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = equipo.nombre;
            select.appendChild(opt);
        });
    }
}

function openAuthModal(mode) {
    authMode = mode;
    const modal = document.getElementById('authModal');
    const title = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('btnAuthSubmit');
    const nameGroup = document.getElementById('registerNameGroup');
    const teamGroup = document.getElementById('registerTeamGroup');
    const switchText = document.getElementById('modalSwitchText');
    const switchLink = document.getElementById('modalSwitchLink');

    if (mode === 'login') {
        title.textContent = 'Iniciar Sesión';
        submitBtn.textContent = 'Entrar';
        nameGroup.classList.add('hidden');
        teamGroup.classList.add('hidden');
        switchText.textContent = '¿No tienes cuenta?';
        switchLink.textContent = 'Regístrate';
    } else {
        title.textContent = 'Crear Cuenta';
        submitBtn.textContent = 'Registrarme';
        nameGroup.classList.remove('hidden');
        teamGroup.classList.remove('hidden');
        switchText.textContent = '¿Ya tienes cuenta?';
        switchLink.textContent = 'Inicia sesión';
    }

    modal.classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal')?.classList.add('hidden');
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;

    if (!email || !password) {
        showToast('Completa email y contraseña');
        return;
    }

    if (!supabaseClient) {
        // Demo mode
        currentUser = { id: 'demo', email, nombre: email.split('@')[0], equipo: 'BSC' };
        onLogin(currentUser);
        closeAuthModal();
        showToast(`Bienvenido, ${currentUser.nombre}! (modo demo)`);
        return;
    }

    try {
        if (authMode === 'login') {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            currentUser = { id: data.user.id, email: data.user.email, nombre: data.user.email.split('@')[0] };
            // Try to get profile
            await loadProfile(data.user.id);
            onLogin(currentUser);
            closeAuthModal();
            showToast(`¡Bienvenido de vuelta, ${currentUser.nombre}!`);
        } else {
            const nombre = document.getElementById('inputNombreHincha').value;
            const equipo = document.getElementById('selectEquipo').value;

            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;

            // Create profile
            if (data.user) {
                await supabaseClient.from('perfiles').insert({
                    id: data.user.id,
                    nombre: nombre || email.split('@')[0],
                    equipo: equipo || null,
                    partidos_estadio: 0
                });
                currentUser = { id: data.user.id, email, nombre: nombre || email.split('@')[0], equipo };
                onLogin(currentUser);
                closeAuthModal();
                showToast(`¡Cuenta creada! Bienvenido, ${currentUser.nombre}`);
            }
        }
    } catch (err) {
        console.error('Auth error:', err);
        showToast(err.message || 'Error de autenticación');
    }
}

async function loadProfile(userId) {
    if (!supabaseClient) return;
    try {
        const { data } = await supabaseClient.from('perfiles').select('*').eq('id', userId).single();
        if (data) {
            currentUser.nombre = data.nombre || currentUser.nombre;
            currentUser.equipo = data.equipo;
            currentUser.partidos_estadio = data.partidos_estadio || 0;
        }
    } catch (e) {
        console.warn('Could not load profile:', e);
    }
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
    } catch (e) {
        console.warn('Session check failed:', e);
    }
}

function onLogin(user) {
    document.getElementById('authArea')?.classList.add('hidden');
    document.getElementById('userArea')?.classList.remove('hidden');
    document.getElementById('userName').textContent = user.nombre;

    // Update perfil tab
    document.getElementById('perfilLoginPrompt')?.classList.add('hidden');
    document.getElementById('perfilContent')?.classList.remove('hidden');
    document.getElementById('perfilNombre').textContent = user.nombre;
    document.getElementById('perfilEquipo').textContent = user.equipo ? EQUIPOS[user.equipo]?.nombre || user.equipo : 'Sin equipo';
    document.getElementById('estadioCount').textContent = user.partidos_estadio || 0;
}

function onLogout() {
    document.getElementById('authArea')?.classList.remove('hidden');
    document.getElementById('userArea')?.classList.add('hidden');
    document.getElementById('perfilLoginPrompt')?.classList.remove('hidden');
    document.getElementById('perfilContent')?.classList.add('hidden');
}

async function logout() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    currentUser = null;
    onLogout();
    showToast('Sesión cerrada');
}


// ============================================
// LIGAS PRIVADAS
// ============================================
function initLigas() {
    document.getElementById('btnCrearLiga')?.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Inicia sesión para crear una liga');
            openAuthModal('login');
            return;
        }
        document.getElementById('crearLigaModal')?.classList.remove('hidden');
    });

    document.getElementById('ligaModalClose')?.addEventListener('click', () => {
        document.getElementById('crearLigaModal')?.classList.add('hidden');
    });

    document.getElementById('crearLigaModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'crearLigaModal') {
            document.getElementById('crearLigaModal')?.classList.add('hidden');
        }
    });

    document.getElementById('crearLigaForm')?.addEventListener('submit', crearLiga);

    document.getElementById('btnUnirseLiga')?.addEventListener('click', unirseLiga);

    document.getElementById('btnVolverLigas')?.addEventListener('click', () => {
        document.getElementById('ligaDetail')?.classList.add('hidden');
        document.getElementById('ligasList')?.classList.remove('hidden');
    });

    // Load user's ligas
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
                nombre,
                codigo,
                creador_id: currentUser.id,
                created_at: new Date().toISOString()
            }).select().single();

            if (error) throw error;

            // Join as member
            await supabaseClient.from('liga_miembros').insert({
                liga_id: data.id,
                user_id: currentUser.id
            });

            showToast(`Liga creada! Código: ${codigo}`);
            document.getElementById('crearLigaModal')?.classList.add('hidden');
            document.getElementById('inputNombreLiga').value = '';
            loadLigas();
        } catch (err) {
            console.error('Create liga error:', err);
            showToast('Error al crear liga');
        }
    } else {
        showToast(`Liga "${nombre}" creada (demo). Código: ${codigo}`);
        document.getElementById('crearLigaModal')?.classList.add('hidden');
    }
}

async function unirseLiga() {
    if (!currentUser) {
        showToast('Inicia sesión para unirte a una liga');
        openAuthModal('login');
        return;
    }

    const codigo = document.getElementById('inputCodigoLiga')?.value.trim();
    if (!codigo) {
        showToast('Ingresa un código de liga');
        return;
    }

    if (supabaseClient) {
        try {
            const { data: liga, error } = await supabaseClient
                .from('ligas')
                .select('id, nombre')
                .eq('codigo', codigo.toUpperCase())
                .single();

            if (error || !liga) {
                showToast('Código de liga no encontrado');
                return;
            }

            await supabaseClient.from('liga_miembros').insert({
                liga_id: liga.id,
                user_id: currentUser.id
            });

            showToast(`Te uniste a "${liga.nombre}"!`);
            document.getElementById('inputCodigoLiga').value = '';
            loadLigas();
        } catch (err) {
            console.error('Join liga error:', err);
            showToast('Error al unirse a la liga');
        }
    } else {
        showToast(`Unido a liga con código ${codigo} (demo)`);
    }
}

async function loadLigas() {
    if (!supabaseClient || !currentUser) return;
    const container = document.getElementById('ligasList');
    if (!container) return;

    try {
        const { data: memberships } = await supabaseClient
            .from('liga_miembros')
            .select('liga_id, ligas(id, nombre, codigo)')
            .eq('user_id', currentUser.id);

        if (memberships && memberships.length > 0) {
            container.innerHTML = memberships.map(m => {
                const liga = m.ligas;
                return `
                    <div class="liga-card" onclick="openLigaDetail('${liga.id}')">
                        <div class="liga-card-info">
                            <h4>${liga.nombre}</h4>
                            <p>Código: ${liga.codigo}</p>
                        </div>
                        <span class="liga-card-members">→</span>
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.warn('Could not load ligas:', e);
    }
}

function openLigaDetail(ligaId) {
    // Placeholder for liga detail view
    showToast('Detalle de liga próximamente');
}

function generarCodigo() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}


// ============================================
// PERFIL
// ============================================
function initPerfil() {
    document.getElementById('btnRegistrarPartido')?.addEventListener('click', registrarPartido);
}

async function registrarPartido() {
    if (!currentUser) return;

    const count = parseInt(document.getElementById('estadioCount').textContent) + 1;
    document.getElementById('estadioCount').textContent = count;

    if (supabaseClient) {
        try {
            await supabaseClient
                .from('perfiles')
                .update({ partidos_estadio: count })
                .eq('id', currentUser.id);
        } catch (e) {
            console.warn('Could not update partidos:', e);
        }
    }

    // Update saladez meter (fun random for demo)
    updateSaladez();
    showToast('🏟️ Partido registrado!');
}

function updateSaladez() {
    const count = parseInt(document.getElementById('estadioCount').textContent);
    // Fun calculation
    const saladez = Math.min(100, Math.max(10, Math.floor(Math.random() * 40 + count * 5)));
    const fill = document.getElementById('saladezFill');
    const label = document.getElementById('saladezLabel');

    if (fill) fill.style.width = saladez + '%';

    let texto = '';
    if (saladez < 25) texto = 'Amuleto bendito 🍀';
    else if (saladez < 50) texto = 'Normal nomás 😐';
    else if (saladez < 75) texto = 'Medio salado 🧂';
    else texto = 'MUFA TOTAL ☠️';

    if (label) label.textContent = `${saladez}% — ${texto}`;

    // Update veredicto
    updateVeredicto(saladez);
}

function updateVeredicto(saladez) {
    const box = document.getElementById('veredictoBox');
    if (!box) return;

    const veredictos = [
        'Ñaño, tu equipo gana cuando tú vas al estadio. Eres el amuleto que todo DT quisiera. Sigue yendo, que contigo en la tribuna ni Messi nos gana. 🏟️🔥',
        'Mira causa, ni sales ni paras. A veces tu equipo gana, a veces pierde. Eres como la lluvia en Guayaquil: impredecible pero parte del paisaje. ⛅',
        'Oye loco, cuando vas al estadio tu equipo juega como si tuvieran los guayos al revés. Mejor quédate en casa viendo por el celular, hazle un favor a la hinchada. 📱😅',
        'HERMANO. Cada vez que pisas el estadio es gol del rival. La tribuna te tiene fichado. Eres más salado que el agua del estero. Quédate leyendo esto desde tu casa, por el bien de todos. 🧂☠️💀'
    ];

    const idx = saladez < 25 ? 0 : saladez < 50 ? 1 : saladez < 75 ? 2 : 3;
    box.querySelector('.veredicto-text').textContent = veredictos[idx];
}


// ============================================
// UTILITIES
// ============================================
function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
