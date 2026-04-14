// ============================================================
//  APP.JS — TercerTiempo v3
//  Fix: pestañas siempre abiertas · escudos · zonas correctas
// ============================================================

let stateProde = { picks:{}, marcadores:{}, resultados:null, jornada: CONFIG.JORNADA_ACTUAL };
let stateProdeParticipantes = [];
let ligaActiva = null;
let chatPolling = null;
let tablaInterval = null;

// Escudos SVG inline de los equipos (colores oficiales)
const ESCUDOS = {
  "Independiente del Valle": `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#FF6B35"/><text x="16" y="21" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="sans-serif">IDV</text></svg>`,
  "Universidad Católica":    `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#003DA5"/><text x="16" y="21" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="sans-serif">UC</text></svg>`,
  "Barcelona SC":            `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#FFD700"/><text x="16" y="21" text-anchor="middle" font-size="10" font-weight="bold" fill="#333" font-family="sans-serif">BSC</text></svg>`,
  "Aucas":                   `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#FFA500"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">AUC</text></svg>`,
  "Deportivo Cuenca":        `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#CC3300"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">DEP</text></svg>`,
  "Técnico Universitario":   `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#CC0000"/><text x="16" y="21" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="sans-serif">TU</text></svg>`,
  "Delfín SC":               `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#0099CC"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">DEL</text></svg>`,
  "Macará":                  `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#006600"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">MAC</text></svg>`,
  "Mushuc Runa":             `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#663399"/><text x="16" y="21" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="sans-serif">MR</text></svg>`,
  "Libertad FC":             `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#336699"/><text x="16" y="21" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="sans-serif">LIB</text></svg>`,
  "Liga de Quito":           `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#1a1a1a" stroke="#fff" stroke-width="2"/><text x="16" y="21" text-anchor="middle" font-size="10" font-weight="bold" fill="white" font-family="sans-serif">LDU</text></svg>`,
  "Guayaquil City":          `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#CC0000"/><text x="16" y="21" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="sans-serif">GC</text></svg>`,
  "Orense SC":               `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#B8860B"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">ORE</text></svg>`,
  "Leones FC":               `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#996633"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">LEO</text></svg>`,
  "Emelec":                  `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#0066CC"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">EME</text></svg>`,
  "Manta FC":                `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#009966"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">MAN</text></svg>`,
};

// ============================================================
//  INIT — nunca bloquea la app
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase(); // ya no retorna false bloqueante

  // Pestañas — siempre funcionales
  document.querySelectorAll('.ntab').forEach(btn => {
    btn.addEventListener('click', () => goTab(btn.dataset.tab));
  });

  // Tabla: cargar inmediatamente + auto-refresh cada 5 min
  renderTabla(TABLA_FALLBACK);
  document.getElementById('tabla-update').textContent = 'Fecha 8 · 13 Abr 2026';
  tablaInterval = setInterval(() => {
    fetchTabla();
  }, 5 * 60 * 1000);

  // Sesión
  if (supabaseActivo) {
    await checkSession();
  } else {
    onLogout();
    // Mostrar aviso de configuración pendiente SOLO en la barra, no reemplazar la app
    const banner = document.getElementById('auth-banner');
    banner.style.display = 'flex';
    banner.innerHTML = `<span>⚙️ Supabase no configurado — la tabla funciona, pero el registro/prode requiere configurar <code>js/config.js</code></span>`;
  }
});

// ============================================================
//  NAVEGACIÓN
// ============================================================
function goTab(name) {
  const soloAuth = ['ligas', 'perfil'];
  if (soloAuth.includes(name) && !currentUser) {
    openModal('modal-login');
    return;
  }
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.ntab').forEach(t => t.classList.remove('on'));
  document.getElementById('scr-' + name)?.classList.add('on');
  document.querySelector(`.ntab[data-tab="${name}"]`)?.classList.add('on');

  if (name !== 'ligas' && chatPolling) { clearInterval(chatPolling); chatPolling = null; }

  const renders = { stats:rStats, prode:rProde, ligas:rLigas, historial:rHinchas, perfil:rPerfil };
  renders[name]?.();
}

// ============================================================
//  TABLA — con escudos y zonas correctas
//  ZONAS (fase regular de 30 fechas):
//    pos 1-4   → Copa Libertadores
//    pos 5-8   → Copa Sudamericana
//    pos 15-16 → Descenso directo
//  FASE FINAL (info visual):
//    Top 6     → Hexagonal por el título
//    Pos 7-10  → Cuadrangular por Sudamericana
//    Pos 11-16 → Hexagonal por no descender
// ============================================================
function getZona(pos) {
  if (pos <= 4)  return 'zc';   // Libertadores
  if (pos <= 8)  return 'zs';   // Sudamericana
  if (pos >= 15) return 'zd';   // Descenso
  return '';
}

function renderTabla(data) {
  const tbody = document.getElementById('tbody-tabla');
  if (!tbody) return;

  tbody.innerHTML = data.map(t => {
    const dg = t.gf - t.gc;
    const z = getZona(t.pos);
    const escudo = ESCUDOS[t.eq] || `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="15" fill="#555"/><text x="16" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">${t.eq.slice(0,3).toUpperCase()}</text></svg>`;
    const nota = t.nota ? `<span style="color:var(--ro);font-size:10px;margin-left:2px">*</span>` : '';
    return `<tr class="${z}">
      <td style="color:var(--muted);font-weight:800;font-size:12px;width:28px">${t.pos}</td>
      <td style="min-width:160px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex-shrink:0">${escudo}</div>
          <span style="font-size:13px">${t.eq}${nota}</span>
        </div>
      </td>
      <td>${t.pj}</td><td>${t.g}</td><td>${t.e}</td><td>${t.p}</td>
      <td>${t.gf}</td><td>${t.gc}</td>
      <td><span style="color:${dg>0?'var(--ver)':dg<0?'var(--ro)':'var(--muted)'}">${dg>0?'+':''}${dg}</span></td>
      <td><span class="pts-val">${t.pts}</span></td>
    </tr>`;
  }).join('');

  // Separadores de fase final
  tbody.innerHTML += `
    <tr><td colspan="10" style="padding:8px 9px;border-top:2px solid var(--border)">
      <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:11px;font-weight:700">
        <span style="color:var(--ver)">■ Top 4 — Copa Libertadores</span>
        <span style="color:var(--az)">■ Pos 5-8 — Copa Sudamericana</span>
        <span style="color:var(--ro)">■ Pos 15-16 — Descenso</span>
      </div>
    </td></tr>
    <tr><td colspan="10" style="padding:6px 9px;background:rgba(255,255,255,.02)">
      <div style="font-size:11px;font-weight:700;color:var(--muted)">Fase final (tras 30 fechas):</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:11px;margin-top:3px">
        <span style="color:var(--am)">🏆 Pos 1-6 → Hexagonal por el título</span>
        <span style="color:#85B7EB">🥈 Pos 7-10 → Cuadrangular Sudamericana</span>
        <span style="color:#f0a500">⚠️ Pos 11-16 → Hexagonal no descenso</span>
      </div>
    </td></tr>
    <tr><td colspan="10" style="font-size:10px;color:var(--muted);padding:6px 9px">* Emelec: -3 pts por sanción · Datos: Fecha 8 · 13 Abr 2026 · Fuente: ligapro.ec</td></tr>`;
}

// ============================================================
//  STATS
// ============================================================
function rStats() {
  const { goleadores, asistencias, resumen } = STATS_FALLBACK;
  document.getElementById('st-goles').textContent = resumen.goles;
  document.getElementById('st-jornadas').textContent = resumen.jornadas;
  document.getElementById('st-promedio').textContent = resumen.promedio;
  document.getElementById('st-locales').textContent = resumen.locales + '%';

  const mg = goleadores[0].g;
  document.getElementById('goleadores').innerHTML = goleadores.map((p,i) => `
    <div class="stat-row">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:${i<3?800:600};color:${i===0?'var(--am)':'var(--txt)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.n}</div>
        <div style="font-size:10px;font-weight:700;color:var(--muted)">${p.eq}</div>
        <div style="margin-top:4px"><div class="stat-bar" style="width:${Math.round(p.g/mg*120)}px;background:${i===0?'var(--am)':'rgba(255,255,255,.1)'}"></div></div>
      </div>
      <div class="stat-num" style="color:${i===0?'var(--am)':'var(--txt)'};margin-left:8px">${p.g}</div>
    </div>`).join('');

  const ma = asistencias[0].a;
  document.getElementById('asistencias').innerHTML = asistencias.map((p,i) => `
    <div class="stat-row">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:${i<3?800:600};color:${i===0?'var(--ver)':'var(--txt)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.n}</div>
        <div style="font-size:10px;font-weight:700;color:var(--muted)">${p.eq}</div>
        <div style="margin-top:4px"><div class="stat-bar" style="width:${Math.round(p.a/ma*120)}px;background:${i===0?'var(--ver)':'rgba(255,255,255,.1)'}"></div></div>
      </div>
      <div class="stat-num" style="color:${i===0?'var(--ver)':'var(--txt)'};margin-left:8px">${p.a}</div>
    </div>`).join('');

  const atk = [...TABLA_FALLBACK].sort((a,b) => b.gf-a.gf).slice(0,6);
  document.getElementById('ataque').innerHTML = atk.map((t,i) => `
    <div class="stat-row">
      <span style="font-size:13px;flex:1">${t.eq}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="stat-bar" style="width:${Math.round(t.gf/atk[0].gf*80)}px;background:${i===0?'var(--ver)':'rgba(255,255,255,.1)'}"></div>
        <span class="stat-num" style="color:${i===0?'var(--ver)':'var(--txt)'}">${t.gf}</span>
      </div>
    </div>`).join('');

  const def = [...TABLA_FALLBACK].sort((a,b) => a.gc-b.gc).slice(0,6);
  document.getElementById('defensa').innerHTML = def.map((t,i) => `
    <div class="stat-row">
      <span style="font-size:13px;flex:1">${t.eq}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="stat-bar" style="width:${Math.round((def[def.length-1].gc-t.gc+5)/20*80)}px;background:${i===0?'var(--az)':'rgba(255,255,255,.1)'}"></div>
        <span class="stat-num" style="color:${i===0?'#85B7EB':'var(--txt)'}">${t.gc}</span>
      </div>
    </div>`).join('');
}

// ============================================================
//  PRODE
// ============================================================
async function rProde() {
  document.getElementById('prode-jornada').textContent = stateProde.jornada;
  document.getElementById('rank-j').textContent = stateProde.jornada;
  document.getElementById('fixture-loading').classList.add('active');
  if (currentUser && supabaseActivo) {
    const { picks, marcadores } = await fetchMisPronosticos(stateProde.jornada);
    stateProde.picks = picks;
    stateProde.marcadores = marcadores;
  }
  if (supabaseActivo) {
    stateProde.resultados = await fetchResultadosJornada(stateProde.jornada);
    stateProdeParticipantes = await fetchPronosticosJornada(stateProde.jornada);
  }
  document.getElementById('fixture-loading').classList.remove('active');
  renderFixture();
  updHeroProde();
}

function renderFixture() {
  const { picks, marcadores, resultados } = stateProde;
  const revelado = resultados?.revelado;
  document.getElementById('fixture').innerHTML = FIXTURE_ACTUAL.map(m => {
    const sel = picks[m.id]||'', marc = marcadores[m.id]||'';
    const res = revelado?resultados.res[m.id]:'', marcReal = revelado?resultados.marc?.[m.id]:'';
    const corr = res&&sel===res, exact = revelado&&marc===marcReal&&marc;
    let chip = '';
    if (revelado&&sel) { const pts=exact?3:corr?1:0; chip=`<span class="res-chip ${corr||exact?'rc-ok':'rc-bad'}">${pts}pts · ${marcReal}</span>`; }
    return `<div class="p-card">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="p-fecha">${m.fecha}</span>${chip}</div>
      <div class="p-teams"><span class="p-local">${m.loc}</span><span class="p-vs">VS</span><span class="p-visit">${m.vis}</span></div>
      <div class="pick-row">
        <button class="pk ${getPkCls(sel,'1',res,revelado)}" onclick="pickProde('${m.id}','1',this)" ${revelado?'disabled':''}>1 Local</button>
        <button class="pk ${getPkCls(sel,'x',res,revelado)}" onclick="pickProde('${m.id}','x',this)" ${revelado?'disabled':''}>X Empate</button>
        <button class="pk ${getPkCls(sel,'2',res,revelado)}" onclick="pickProde('${m.id}','2',this)" ${revelado?'disabled':''}>2 Visita</button>
      </div>
      ${!revelado?`<input class="marc-input" placeholder="Marcador exacto para +3 pts (ej: 2-1)" value="${marc}" oninput="saveMarc('${m.id}',this.value)"/>`:''}
    </div>`;
  }).join('');
  const msgArea = document.getElementById('prode-msg');
  if (!currentUser) msgArea.innerHTML = `<div class="alert a-info">Selecciona tus pronósticos — <a href="#" onclick="openModal('modal-login')">inicia sesión</a> para guardarlos y aparecer en el ranking</div>`;
}

function getPkCls(sel,pick,res,revelado){if(!sel&&!revelado)return'';if(!revelado)return sel===pick?`s${pick}`:'';if(sel===pick)return res===pick?'ok-s':'bad-s';return res===pick?'ok':'';}
function pickProde(mid,pick,btn){stateProde.picks[mid]=pick;btn.parentElement.querySelectorAll('.pk').forEach(b=>b.className='pk');btn.className=`pk s${pick}`;updHeroProde();if(!currentUser)document.getElementById('prode-msg').innerHTML=`<div class="alert a-info"><a href="#" onclick="openModal('modal-login')">Inicia sesión</a> o <a href="#" onclick="openModal('modal-register')">regístrate</a> para guardar tus pronósticos</div>`;}
function saveMarc(mid,val){stateProde.marcadores[mid]=val.trim();}

async function guardarProde() {
  if (!currentUser){openModal('modal-login');return;}
  const n=Object.keys(stateProde.picks).length;
  const msg=document.getElementById('prode-msg');
  if(n===0){msg.innerHTML='<div class="alert a-err">No tienes pronósticos seleccionados</div>';return;}
  msg.innerHTML='<div class="alert a-load">Guardando...</div>';
  const{error}=await guardarPronostico(stateProde.jornada,stateProde.picks,stateProde.marcadores);
  if(error){msg.innerHTML=`<div class="alert a-err">Error: ${error}</div>`;return;}
  msg.innerHTML=`<div class="alert a-ok">¡Guardado! ${n}/${FIXTURE_ACTUAL.length} pronósticos para la jornada ${stateProde.jornada}</div>`;
  stateProdeParticipantes=await fetchPronosticosJornada(stateProde.jornada);
  updHeroProde();setTimeout(()=>msg.innerHTML='',3000);
}

function updHeroProde(){
  document.getElementById('ph-jug').textContent=stateProdeParticipantes.length;
  if(!currentUser){document.getElementById('ph-pts').textContent='—';document.getElementById('ph-pos').textContent='—';return;}
  const r=calcPuntosProde(stateProde.picks,stateProde.marcadores,stateProde.resultados);
  const revelado=stateProde.resultados?.revelado;
  document.getElementById('ph-pts').textContent=revelado?r.pts:(Object.keys(stateProde.picks).length+' sel');
  if(revelado&&stateProdeParticipantes.length>0){const myPts=r.pts;const rank=stateProdeParticipantes.map(p=>calcPuntosProde(p.picks,p.marcadores,stateProde.resultados).pts).sort((a,b)=>b-a);document.getElementById('ph-pos').textContent='#'+(rank.findIndex(p=>p<=myPts)+1);}
}

function pTab(t){
  document.querySelectorAll('#scr-prode .itab').forEach((b,i)=>b.classList.toggle('on',['picks','ranking','historial-p'].indexOf(t)===i));
  ['pt-picks','pt-ranking','pt-historial-p'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('pt-'+t).style.display='block';
  if(t==='ranking')rRankingGlobal();
  if(t==='historial-p')rHistProde();
}

function rRankingGlobal(){
  const revelado=stateProde.resultados?.revelado, data=stateProdeParticipantes;
  document.getElementById('rank-badge').textContent=data.length+' jugadores';
  if(!data.length){document.getElementById('ranking-list').innerHTML='<div class="empty"><span class="empty-icon">🏆</span>Sé el primero en jugar</div>';document.getElementById('ranking-acum').innerHTML='<div class="empty"><span class="empty-icon">📊</span>Sin datos</div>';return;}
  const cols=['var(--am)','#ccc','#cd7f32'];
  const ranking=data.map(p=>{const r=calcPuntosProde(p.picks,p.marcadores,stateProde.resultados);return{...p,r,trofs:revelado?calcTrofeos(r):[],sel:Object.keys(p.picks||{}).length};}).sort((a,b)=>b.r.pts-a.r.pts);
  document.getElementById('ranking-list').innerHTML=ranking.map((r,i)=>`
    <div class="rk-row"><span class="rk-num ${i<3?'rk'+(i+1):''}">${i+1}</span>
    <div class="rk-info"><div class="rk-name">${escHtml(r.nombre)} ${currentUser&&r.userId===currentUser.id?'<span class="you-badge">(tú)</span>':''}${r.trofs.map(id=>{const t=TROFEOS_DEF.find(x=>x.id===id);return t?`<span title="${t.lbl}">${t.icon}</span>`:''}).join('')}</div>
    <div class="rk-sub">${escHtml(r.equipo)} · ${r.sel}/8</div></div>
    <div style="text-align:right"><div class="rk-pts" style="color:${i<3?cols[i]:'var(--am)'}">${revelado?r.r.pts:'-'}</div>
    <div class="rk-det">${revelado?`${r.r.aciertos} ✓ · ${r.r.exactos} exactos`:r.sel+' selecc.'}</div></div></div>`).join('');
  document.getElementById('ranking-acum').innerHTML=ranking.map((r,i)=>`
    <div class="rk-row"><span class="rk-num ${i<3?'rk'+(i+1):''}">${i+1}</span>
    <div class="rk-info"><div class="rk-name">${escHtml(r.nombre)}</div><div class="rk-sub">${escHtml(r.equipo)}</div></div>
    <div style="text-align:right"><div class="rk-pts">${revelado?r.r.pts:'-'}</div><div class="rk-det">J${stateProde.jornada}</div></div></div>`).join('');
}

async function rHistProde(){
  const el=document.getElementById('hist-jornadas');
  if(!currentUser){el.innerHTML='<div class="empty"><span class="empty-icon">🔒</span><a href="#" onclick="openModal(\'modal-login\')">Inicia sesión</a> para ver tu historial</div>';return;}
  const jornadas=Object.keys(RESULTADOS_JORNADAS).map(Number).sort((a,b)=>b-a);
  if(!jornadas.length){el.innerHTML='<div style="color:var(--muted);font-size:13px;font-weight:600">Historial disponible desde la jornada 7</div>';return;}
  el.innerHTML='<div class="alert a-load">Cargando...</div>';
  const rows=await Promise.all(jornadas.map(async j=>{const{picks,marcadores}=await fetchMisPronosticos(j);const r=calcPuntosProde(picks,marcadores,{...RESULTADOS_JORNADAS[j],revelado:true});return{j,r,sel:Object.keys(picks).length};}));
  el.innerHTML=rows.map(({j,r,sel})=>`<div class="jornada-row"><div><div style="font-family:var(--font-h);font-size:16px">Jornada ${j}</div><div style="font-size:11px;font-weight:700;color:var(--muted)">${sel>0?`${r.aciertos} aciertos · ${r.exactos} exactos`:'No participaste'}</div></div><div style="font-family:var(--font-h);font-size:24px;color:${r.pts>0?'var(--am)':'var(--muted)'}">${sel>0?r.pts+' pts':'-'}</div></div>`).join('');
}

// ============================================================
//  HINCHAS — pestaña pública
// ============================================================
async function rHinchas(){ hTab('comunidad'); }

async function hTab(t){
  document.querySelectorAll('#scr-historial .itab').forEach((b,i)=>b.classList.toggle('on',['comunidad','mis-partidos'].indexOf(t)===i));
  document.getElementById('ht-comunidad').style.display=t==='comunidad'?'block':'none';
  document.getElementById('ht-mis-partidos').style.display=t==='mis-partidos'?'block':'none';
  document.getElementById('ht-perfil-usuario').style.display='none';
  if(t==='comunidad') await rComunidad();
  if(t==='mis-partidos') await rMisPartidosTab();
}

async function rComunidad(){
  const el=document.getElementById('comunidad-list');
  if(!supabaseActivo){el.innerHTML='<div class="empty"><span class="empty-icon">⚙️</span>Configura Supabase para ver la comunidad de hinchas</div>';return;}
  el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const usuarios=await fetchTodosUsuarios();
  if(!usuarios.length){el.innerHTML='<div class="empty"><span class="empty-icon">👥</span>Aún no hay hinchas registrados. ¡Sé el primero!</div>';return;}
  const todos=await Promise.all(usuarios.map(async u=>{const partidos=await fetchEstadisticasUsuario(u.id);const s=calcStats(partidos);return{...u,s};}));
  el.innerHTML=`<div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:12px;letter-spacing:.5px">${todos.length} HINCHAS REGISTRADOS</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">
    ${todos.map(u=>{const sl=getSalado(u.s.pct);const ini=u.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);const col=u.avatar_color||strColor(u.id);
    return`<div onclick="verPerfilUsuario('${u.id}')" style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:1rem;cursor:pointer;transition:border-color .2s" onmouseover="this.style.borderColor='var(--am)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div class="av" style="width:40px;height:40px;font-size:14px;font-weight:900;background:${col}">${ini}</div>
        <div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(u.nombre)}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600">${escHtml(u.equipo)}</div></div>
        <div style="font-size:28px">${sl.e}</div>
      </div>
      <div style="display:flex;gap:12px;font-size:12px;text-align:center">
        <div><div style="font-family:var(--font-h);font-size:20px">${u.s.t}</div><div style="color:var(--muted);font-weight:700">partidos</div></div>
        <div><div style="font-family:var(--font-h);font-size:20px;color:var(--ver)">${u.s.g}</div><div style="color:var(--muted);font-weight:700">victorias</div></div>
        <div><div style="font-family:var(--font-h);font-size:20px;color:${sl.c}">${u.s.pct}%</div><div style="color:var(--muted);font-weight:700">% vic.</div></div>
      </div>
      <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden;margin-top:8px"><div style="height:100%;border-radius:3px;width:${u.s.pct}%;background:${u.s.pct>=50?'var(--ver)':'var(--ro)'}"></div></div>
      <div style="font-size:11px;color:${sl.c};font-weight:800;margin-top:6px;font-family:var(--font-h);letter-spacing:.5px">${sl.l}</div>
    </div>`;}).join('')}
  </div>`;
}

async function verPerfilUsuario(userId){
  document.getElementById('ht-comunidad').style.display='none';
  document.getElementById('ht-mis-partidos').style.display='none';
  const det=document.getElementById('ht-perfil-usuario');det.style.display='block';
  det.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const partidos=await fetchEstadisticasUsuario(userId);
  const usuarios=await fetchTodosUsuarios();
  const u=usuarios.find(x=>x.id===userId);
  if(!u){det.innerHTML='<div class="alert a-err">Usuario no encontrado</div>';return;}
  const s=calcStats(partidos);const sl=getSalado(s.pct);
  const ini=u.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);const col=u.avatar_color||strColor(u.id);
  det.innerHTML=`
    <button class="btn" onclick="hTab('comunidad')" style="margin-bottom:1rem">← Volver</button>
    <div class="card">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:1.5rem;flex-wrap:wrap">
        <div class="av" style="width:52px;height:52px;font-size:18px;font-weight:900;background:${col}">${ini}</div>
        <div><div style="font-family:var(--font-h);font-size:26px;letter-spacing:1px">${escHtml(u.nombre)}</div>
        <div style="font-size:12px;font-weight:700;color:var(--muted)">@${u.username} · ${escHtml(u.equipo)}</div></div>
      </div>
      <div style="background:var(--panel);border-radius:12px;padding:1rem;margin-bottom:1rem;border-left:4px solid ${sl.c}">
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:40px">${sl.e}</span>
        <div><div style="font-family:var(--font-h);font-size:18px;color:${sl.c}">${sl.l}</div>
        <div style="font-size:12px;font-weight:600;color:var(--muted)">${s.pct}% victorias cuando va al estadio</div></div></div>
        <div class="sal-bar"><div class="sal-fill" style="width:${s.pct}%;background:${s.pct>=50?'var(--ver)':'var(--ro)'}"></div></div>
      </div>
      <div class="g4 mb1">
        <div class="met"><div class="met-v">${s.t}</div><div class="met-l">Partidos</div></div>
        <div class="met"><div class="met-v" style="color:var(--ver)">${s.g}</div><div class="met-l">Victorias</div></div>
        <div class="met"><div class="met-v" style="color:#f0a500">${s.e}</div><div class="met-l">Empates</div></div>
        <div class="met"><div class="met-v" style="color:var(--ro)">${s.pe}</div><div class="met-l">Derrotas</div></div>
      </div>
      ${partidos.length>0?`<div class="sec-lbl">Racha reciente</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:1rem">${partidos.slice(0,10).map(pt=>{const c=pt.resultado==='ganó'?'var(--ver)':pt.resultado==='empató'?'#f0a500':'var(--ro)';return`<div class="racha-dot" style="background:${c};color:#000">${(pt.resultado||'?')[0].toUpperCase()}</div>`;}).join('')}</div>
      <div class="card-t mb1" style="font-size:15px">Historial de partidos</div>
      ${partidos.map(pt=>{const c=pt.resultado==='ganó'?'var(--ver)':pt.resultado==='empató'?'#f0a500':'var(--ro)';return`<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:13px;font-weight:700">vs ${escHtml(pt.rival)}</div><div style="font-size:11px;color:var(--muted)">${pt.fecha} · ${escHtml(pt.estadio)}</div></div><div style="text-align:right"><div style="font-family:var(--font-h);font-size:15px;color:${c}">${(pt.resultado||'').toUpperCase()}</div>${pt.goles?`<div style="font-size:11px;color:var(--muted)">${pt.goles}</div>`:''}</div></div>`;}).join('')}`
      :'<div style="color:var(--muted);font-size:13px;text-align:center;padding:1rem">Este hincha aún no ha registrado partidos</div>'}
    </div>`;
}

async function rMisPartidosTab(){
  const el=document.getElementById('mis-partidos-list');
  if(!currentUser){el.innerHTML=`<div class="empty"><span class="empty-icon">🔒</span><a href="#" onclick="openModal('modal-login')">Inicia sesión</a> para ver y registrar tus partidos</div>`;return;}
  el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const partidos=await fetchMisPartidos();
  if(!partidos.length){el.innerHTML=`<div class="empty"><span class="empty-icon">📋</span>No has registrado ningún partido aún<br><br><button class="btn b-am" onclick="goTab('perfil')">Registrar en Mi Perfil</button></div>`;return;}
  let html='<div class="card"><div class="card-t mb1">Mis partidos ('+partidos.length+')</div>';
  partidos.forEach(pt=>{const c=pt.resultado==='ganó'?'var(--ver)':pt.resultado==='empató'?'#f0a500':'var(--ro)';html+=`<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:14px;font-weight:700">vs ${escHtml(pt.rival)}</div><div style="font-size:11px;font-weight:600;color:var(--muted)">${pt.fecha} · ${escHtml(pt.estadio)}</div>${pt.nota?`<div style="font-size:11px;color:rgba(255,255,255,.3)">${escHtml(pt.nota)}</div>`:''}</div><div style="text-align:right"><div style="font-family:var(--font-h);font-size:16px;color:${c}">${(pt.resultado||'').toUpperCase()}</div>${pt.goles?`<div style="font-size:11px;color:var(--muted)">${pt.goles}</div>`:''}</div></div>`;});
  html+='</div>';el.innerHTML=html;
}

// ============================================================
//  LIGAS
// ============================================================
async function rLigas(){if(!currentUser){goTab('tabla');return;}lTab('mis');}
function lTab(t){document.querySelectorAll('#scr-ligas .itab').forEach((b,i)=>b.classList.toggle('on',['mis','crear','unirse'].indexOf(t)===i));['lt-mis','lt-crear','lt-unirse','lt-detalle'].forEach(id=>document.getElementById(id).style.display='none');if(t==='mis')rMisLigas();else document.getElementById('lt-'+t).style.display='block';}

async function rMisLigas(){
  const el=document.getElementById('lt-mis');el.style.display='block';
  el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const ligas=await fetchMisLigas();
  if(!ligas.length){el.innerHTML=`<div class="empty"><span class="empty-icon">👥</span>No perteneces a ninguna liga aún<br><br><button class="btn b-am" onclick="lTab('crear')" style="margin-right:8px">Crear liga</button><button class="btn b-ver" onclick="lTab('unirse')">Unirme con código</button></div>`;return;}
  el.innerHTML=ligas.map(l=>`<div class="liga-card" onclick="verLiga('${l.id}')"><div style="display:flex;justify-content:space-between;align-items:start;gap:12px"><div><div class="liga-n">${escHtml(l.nombre)}</div><div class="liga-m">Admin: ${escHtml(l.perfiles?.nombre||'?')}</div>${l.descripcion?`<div class="liga-m" style="margin-top:2px">${escHtml(l.descripcion)}</div>`:''}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><span class="badge ${l.privada?'b-am-bg':'b-ver-bg'}">${l.privada?'Privada':'Pública'}</span>${l.creador_id===currentUser?.id?'<span class="badge b-ver-bg">Admin</span>':''}</div></div><div style="text-align:center;flex-shrink:0"><div style="font-size:9px;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:4px">CÓDIGO</div><div class="cod">${l.codigo}</div></div></div></div>`).join('');
}

async function crearLiga(){
  if(!currentUser){openModal('modal-login');return;}
  const nombre=document.getElementById('l-nom').value.trim(),desc=document.getElementById('l-desc').value.trim(),privada=document.getElementById('l-priv').value==='1',msg=document.getElementById('crear-msg');
  if(!nombre){msg.innerHTML='<div class="alert a-err">Escribe un nombre para la liga</div>';return;}
  msg.innerHTML='<div class="alert a-load">Creando...</div>';
  const{liga,error}=await crearLigaDB(nombre,desc,privada);
  if(error){msg.innerHTML=`<div class="alert a-err">${error}</div>`;return;}
  msg.innerHTML=`<div class="alert a-ok">¡Liga creada! Código: <strong style="letter-spacing:3px;font-size:15px">${liga.codigo}</strong></div>`;
  document.getElementById('l-nom').value='';document.getElementById('l-desc').value='';
  setTimeout(()=>lTab('mis'),1800);
}

async function unirse(){
  if(!currentUser){openModal('modal-login');return;}
  const cod=document.getElementById('l-cod-inp').value.trim().toUpperCase(),msg=document.getElementById('unirse-msg');
  if(!cod){msg.innerHTML='<div class="alert a-err">Escribe el código</div>';return;}
  msg.innerHTML='<div class="alert a-load">Buscando...</div>';
  const{liga,error}=await unirseALigaDB(cod);
  if(error){msg.innerHTML=`<div class="alert a-err">${error}</div>`;return;}
  msg.innerHTML=`<div class="alert a-ok">¡Te uniste a "${escHtml(liga.nombre)}"!</div>`;
  document.getElementById('l-cod-inp').value='';setTimeout(()=>lTab('mis'),1200);
}

async function verLiga(id){
  ['lt-mis','lt-crear','lt-unirse'].forEach(x=>document.getElementById(x).style.display='none');
  const det=document.getElementById('lt-detalle');det.style.display='block';
  det.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  ligaActiva=id;const liga=await fetchLigaDetalle(id);
  if(!liga){det.innerHTML='<div class="alert a-err">Liga no encontrada</div>';return;}
  const cols=['var(--am)','#ccc','#cd7f32'],revelado=stateProde.resultados?.revelado;
  const rankLiga=liga.miembros.map(m=>{const prode=stateProdeParticipantes.find(p=>p.userId===m.id);const r=calcPuntosProde(prode?.picks,prode?.marcadores,stateProde.resultados);const trofs=revelado?calcTrofeos(r):[];return{...m,r,trofs,sel:Object.keys(prode?.picks||{}).length};}).sort((a,b)=>b.r.pts-a.r.pts);
  const ganador=revelado&&rankLiga.length>0?rankLiga[0]:null;
  det.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:1.25rem;flex-wrap:wrap">
      <button class="btn" onclick="lTab('mis')">← Volver</button>
      <div><div style="font-family:var(--font-h);font-size:24px">${escHtml(liga.nombre)}</div>
      <div style="font-size:11px;font-weight:700;color:var(--muted)">Código: <span class="cod" style="font-size:12px;padding:3px 10px">${liga.codigo}</span></div></div>
    </div>
    ${ganador&&revelado?`<div class="champion-banner"><div style="font-size:40px" class="bounce">🏆</div><div style="font-family:var(--font-h);font-size:26px;color:var(--am)">¡Campeón!</div><div style="font-size:15px;font-weight:700">${escHtml(ganador.nombre)}</div><div style="font-size:12px;color:var(--muted)">${ganador.r.pts} pts</div></div>`:''}
    <div class="card"><div class="card-hdr"><span class="card-t">Ranking J${stateProde.jornada}</span></div>
    ${rankLiga.map((r,i)=>`<div class="rk-row"><span class="rk-num ${i<3?'rk'+(i+1):''}">${i+1}</span><div class="rk-info"><div class="rk-name">${escHtml(r.nombre)}${currentUser&&r.id===currentUser.id?' <span class="you-badge">(tú)</span>':''}${r.trofs.map(tid=>{const t=TROFEOS_DEF.find(x=>x.id===tid);return t?`<span>${t.icon}</span>`:''}).join('')}</div><div class="rk-sub">${escHtml(r.equipo)} · ${r.sel}/8</div></div><div style="text-align:right"><div class="rk-pts" style="color:${i<3?cols[i]:'var(--am)'}">${revelado?r.r.pts:'-'}</div></div></div>`).join('')}</div>
    <div class="card"><div class="card-t mb1">💬 Chat</div>
    <div class="chat-box"><div class="chat-msgs" id="chat-msgs-${id}">
      ${liga.chat.length===0?`<div style="text-align:center;padding:2rem;color:var(--muted);font-size:13px">¡Sé el primero en comentar!</div>`:''}
      ${liga.chat.map(m=>{const esMio=currentUser&&m.username===currentUser.username;const ini=(m.nombre||'?').slice(0,2).toUpperCase();return`<div class="msg-b ${esMio?'mio':''}"><div class="msg-av" style="width:28px;height:28px;font-size:10px;background:${m.avatarColor||'#FFD100'}">${ini}</div><div class="msg-c"><div class="msg-meta">${escHtml(m.nombre)} · ${m.ts}</div><div class="msg-txt">${escHtml(m.txt)}</div></div></div>`;}).join('')}
    </div><div class="chat-inp-row"><input class="chat-inp" id="chat-inp-${id}" placeholder="${currentUser?'Escribe...':'Inicia sesión para chatear'}" ${currentUser?'':'disabled'} onkeydown="if(event.key==='Enter')enviarChat('${id}')"/><button class="btn b-am" onclick="enviarChat('${id}')" ${currentUser?'':'disabled'}>Enviar</button></div></div></div>
    <div class="card"><div class="card-t mb1">👥 Miembros</div><div style="display:flex;flex-wrap:wrap;gap:8px">${liga.miembros.map(m=>`<div class="member-chip"><div class="av" style="width:26px;height:26px;font-size:10px;background:${m.avatar_color||strColor(m.id)}">${(m.nombre||'?').slice(0,2).toUpperCase()}</div><span style="font-size:13px;font-weight:700">${escHtml(m.nombre)}</span>${liga.creador_id===m.id?'<span style="color:var(--am)">★</span>':''}</div>`).join('')}</div></div>`;
  setTimeout(()=>{const cm=document.getElementById('chat-msgs-'+id);if(cm)cm.scrollTop=cm.scrollHeight;},100);
  if(chatPolling)clearInterval(chatPolling);chatPolling=setInterval(()=>refreshChat(id),10000);
}

async function refreshChat(ligaId){
  if(ligaActiva!==ligaId){clearInterval(chatPolling);return;}
  const liga=await fetchLigaDetalle(ligaId);if(!liga)return;
  const el=document.getElementById('chat-msgs-'+ligaId);if(!el){clearInterval(chatPolling);return;}
  const atBottom=el.scrollTop+el.clientHeight>=el.scrollHeight-10;
  el.innerHTML=liga.chat.length===0?`<div style="text-align:center;padding:2rem;color:var(--muted);font-size:13px">¡Sé el primero!</div>`:liga.chat.map(m=>{const esMio=currentUser&&m.username===currentUser.username;const ini=(m.nombre||'?').slice(0,2).toUpperCase();return`<div class="msg-b ${esMio?'mio':''}"><div class="msg-av" style="width:28px;height:28px;font-size:10px;background:${m.avatarColor||'#FFD100'}">${ini}</div><div class="msg-c"><div class="msg-meta">${escHtml(m.nombre)} · ${m.ts}</div><div class="msg-txt">${escHtml(m.txt)}</div></div></div>`;}).join('');
  if(atBottom)el.scrollTop=el.scrollHeight;
}
async function enviarChat(ligaId){if(!currentUser)return;const inp=document.getElementById('chat-inp-'+ligaId);const txt=inp.value.trim();if(!txt)return;inp.value='';inp.disabled=true;await enviarMensajeChat(ligaId,txt);inp.disabled=false;inp.focus();await refreshChat(ligaId);}

// ============================================================
//  PERFIL
// ============================================================
async function rPerfil(){
  if(!currentUser){goTab('tabla');return;}
  const el=document.getElementById('perfil-content');
  el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const partidos=await fetchMisPartidos();const s=calcStats(partidos);const sl=getSalado(s.pct);
  const ini=currentUser.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const col=currentUser.avatar_color||strColor(currentUser.id);
  const pr=calcPuntosProde(stateProde.picks,stateProde.marcadores,stateProde.resultados);
  el.innerHTML=`
  <div class="card">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:1.5rem;flex-wrap:wrap">
      <div class="av" style="width:56px;height:56px;font-size:20px;font-weight:900;background:${col}">${ini}</div>
      <div><div style="font-family:var(--font-h);font-size:28px;letter-spacing:1px">${escHtml(currentUser.nombre)}</div>
      <div style="font-size:12px;font-weight:700;color:var(--muted)">@${currentUser.username} · Hincha de ${escHtml(currentUser.equipo)}</div></div>
    </div>
    <div style="background:var(--panel);border-radius:12px;padding:1rem;margin-bottom:1rem;border-left:4px solid ${sl.c}">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:40px">${sl.e}</span>
      <div><div style="font-family:var(--font-h);font-size:20px;color:${sl.c}">${sl.l}</div>
      <div style="font-size:12px;font-weight:600;color:var(--muted)">${s.pct}% victorias cuando vas al estadio</div></div></div>
      <div class="sal-bar"><div class="sal-fill" style="width:${s.pct}%;background:${s.pct>=50?'var(--ver)':'var(--ro)'}"></div></div>
    </div>
    <div class="g4 mb1">
      <div class="met"><div class="met-v">${s.t}</div><div class="met-l">Partidos</div></div>
      <div class="met"><div class="met-v" style="color:var(--ver)">${s.g}</div><div class="met-l">Victorias</div></div>
      <div class="met"><div class="met-v" style="color:#f0a500">${s.e}</div><div class="met-l">Empates</div></div>
      <div class="met"><div class="met-v" style="color:var(--ro)">${s.pe}</div><div class="met-l">Derrotas</div></div>
    </div>
    ${partidos.length>0?`<div style="margin-bottom:1rem"><div class="sec-lbl">Última racha</div><div style="display:flex;gap:5px;flex-wrap:wrap">${partidos.slice(0,12).map(pt=>{const c=pt.resultado==='ganó'?'var(--ver)':pt.resultado==='empató'?'#f0a500':'var(--ro)';return`<div class="racha-dot" style="background:${c};color:#000">${(pt.resultado||'?')[0].toUpperCase()}</div>`;}).join('')}</div></div>`:''}
    <div style="background:var(--panel);border-radius:12px;padding:1rem;margin-bottom:1rem">
      <div class="sec-lbl mb1">Prode — Jornada ${stateProde.jornada}</div>
      <div class="g3">
        <div style="text-align:center"><div style="font-family:var(--font-h);font-size:26px">${Object.keys(stateProde.picks).length}/8</div><div style="font-size:10px;font-weight:800;color:var(--muted)">Pronósticos</div></div>
        <div style="text-align:center"><div style="font-family:var(--font-h);font-size:26px;color:var(--am)">${stateProde.resultados?.revelado?pr.pts:'-'}</div><div style="font-size:10px;font-weight:800;color:var(--muted)">Puntos</div></div>
        <div style="text-align:center"><div style="font-family:var(--font-h);font-size:26px;color:var(--na)">${stateProde.resultados?.revelado?pr.exactos:'-'}</div><div style="font-size:10px;font-weight:800;color:var(--muted)">Exactos</div></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="btn b-am" onclick="toggleForm()">Registrar partido</button>
      <button class="btn b-outline" onclick="pedirVeredicto()">Veredicto IA ↗</button>
    </div>
    <div id="veredicto-box"></div>
  </div>
  <div class="card" id="form-reg" style="display:none">
    <div class="card-t mb1">Registrar partido al que fui</div><div id="rp-msg"></div>
    <div class="g2">
      <div class="field"><label>Fecha</label><input type="date" id="p-f"/></div>
      <div class="field"><label>Rival</label><input id="p-r" placeholder="Ej: Barcelona SC"/></div>
    </div>
    <div class="g2">
      <div class="field"><label>Estadio</label><select id="p-e"><option value="">Seleccionar...</option>
        <option>Monumental de Barcelona</option><option>Capwell (Emelec)</option><option>Casa Blanca (LDU)</option>
        <option>Rodrigo Paz Delgado</option><option>Olímpico Atahualpa</option><option>Jocay (Manta)</option>
        <option>Bellavista (Ambato)</option><option>Ciudad de Loja</option><option>Reales Tamarindos</option>
        <option>Banco Pichincha</option><option>Modelo (Guayaquil)</option><option>Otro estadio</option>
      </select></div>
      <div class="field"><label>Resultado</label><select id="p-res"><option value="">¿Qué pasó?</option>
        <option value="ganó">Mi equipo ganó 🎉</option><option value="empató">Empató 😐</option><option value="perdió">Perdió 😭</option>
      </select></div>
    </div>
    <div class="g2">
      <div class="field"><label>Marcador</label><input id="p-g" placeholder="2-1"/></div>
      <div class="field"><label>Nota personal</label><input id="p-n" placeholder="Fui con mi papá..."/></div>
    </div>
    <div style="display:flex;gap:8px"><button class="btn b-am" onclick="guardarPartido()">Guardar</button><button class="btn" onclick="toggleForm()">Cancelar</button></div>
  </div>`;
  document.getElementById('p-f').value=new Date().toISOString().split('T')[0];
}

function toggleForm(){const f=document.getElementById('form-reg');if(!f)return;const o=f.style.display!=='none';f.style.display=o?'none':'block';if(!o)f.scrollIntoView({behavior:'smooth'});}
async function guardarPartido(){
  const fecha=document.getElementById('p-f').value,rival=document.getElementById('p-r').value.trim(),estadio=document.getElementById('p-e').value,resultado=document.getElementById('p-res').value,goles=document.getElementById('p-g').value.trim(),nota=document.getElementById('p-n').value.trim(),msg=document.getElementById('rp-msg');
  if(!fecha||!rival||!estadio||!resultado){msg.innerHTML='<div class="alert a-err">Completa los campos requeridos</div>';return;}
  msg.innerHTML='<div class="alert a-load">Guardando...</div>';
  const{error}=await guardarPartidoDB({fecha,rival,estadio,resultado,goles,nota});
  if(error){msg.innerHTML=`<div class="alert a-err">Error: ${error}</div>`;return;}
  msg.innerHTML='<div class="alert a-ok">¡Partido registrado!</div>';
  setTimeout(()=>{toggleForm();rPerfil();},1000);
}

async function pedirVeredicto(){
  const partidos=await fetchMisPartidos();const s=calcStats(partidos);const box=document.getElementById('veredicto-box');if(!box)return;
  box.innerHTML='<div class="alert a-load">Analizando tu karma futbolero...</div>';
  const hist=partidos.slice(0,10).map(p=>`${p.fecha}: vs ${p.rival} → ${p.resultado}`).join(', ')||'Sin partidos';
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,messages:[{role:'user',content:`Eres un comentarista deportivo ecuatoriano muy gracioso. ${currentUser.nombre}, hincha de ${currentUser.equipo}, fue a ${s.t} partidos: ganó ${s.g}, empató ${s.e}, perdió ${s.pe} (${s.pct}% victorias). Historial: ${hist}. Veredicto dramático en jerga ecuatoriana. Máximo 90 palabras.`}]})});
    const d=await resp.json();
    box.innerHTML=`<div style="background:var(--panel);border:1px solid var(--border);border-left:4px solid var(--am);border-radius:12px;padding:1rem"><div style="font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--am);margin-bottom:8px">Veredicto IA</div><div style="font-size:13px;line-height:1.6">${d.content?.[0]?.text||'Sin respuesta'}</div></div>`;
  }catch(e){box.innerHTML='<div class="alert a-err">No se pudo conectar</div>';}
}

function escHtml(str){if(!str)return'';return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
