// ============================================================
//  TERCERTIEMPO — main.js (archivo único, sin conflictos)
//  Contiene: config + auth + api + app
// ============================================================

// ============================================================
//  CONFIG — pon tus credenciales aquí
// ============================================================
const CONFIG = {
  SUPABASE_URL: 'https://TU_PROYECTO.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
  JORNADA_ACTUAL: 9,
};

// ============================================================
//  ESTADO GLOBAL
// ============================================================
let _supabase = null;
let currentUser = null;
let supabaseActivo = false;
let stateProde = { picks:{}, marcadores:{}, resultados:null, jornada: CONFIG.JORNADA_ACTUAL };
let stateProdeParticipantes = [];
let ligaActiva = null;
let chatPolling = null;

// ============================================================
//  DATOS REALES LIGAPRO 2026 — Fecha 8 (13 Abr)
// ============================================================
const TABLA_FALLBACK = [
  {pos:1,  eq:"Independiente del Valle", pj:8,g:6,e:1,p:1,gf:16,gc:8,  pts:19,col:"#FF6B35"},
  {pos:2,  eq:"Universidad Católica",    pj:8,g:4,e:4,p:0,gf:13,gc:4,  pts:16,col:"#003DA5"},
  {pos:3,  eq:"Barcelona SC",            pj:8,g:4,e:3,p:1,gf:8, gc:4,  pts:15,col:"#FFD700"},
  {pos:4,  eq:"Aucas",                   pj:8,g:3,e:3,p:2,gf:10,gc:8,  pts:12,col:"#FFA500"},
  {pos:5,  eq:"Deportivo Cuenca",        pj:8,g:3,e:2,p:3,gf:9, gc:8,  pts:11,col:"#CC3300"},
  {pos:6,  eq:"Técnico Universitario",   pj:8,g:3,e:2,p:3,gf:8, gc:8,  pts:11,col:"#CC0000"},
  {pos:7,  eq:"Delfín SC",               pj:8,g:3,e:2,p:3,gf:4, gc:4,  pts:11,col:"#0099CC"},
  {pos:8,  eq:"Macará",                  pj:8,g:2,e:4,p:2,gf:6, gc:5,  pts:10,col:"#006600"},
  {pos:9,  eq:"Mushuc Runa",             pj:8,g:2,e:4,p:2,gf:9, gc:9,  pts:10,col:"#663399"},
  {pos:10, eq:"Libertad FC",             pj:8,g:2,e:4,p:2,gf:8, gc:8,  pts:10,col:"#336699"},
  {pos:11, eq:"Liga de Quito",           pj:8,g:3,e:1,p:4,gf:7, gc:9,  pts:10,col:"#CCCCCC"},
  {pos:12, eq:"Guayaquil City",          pj:8,g:2,e:3,p:3,gf:5, gc:9,  pts:9, col:"#FF0000"},
  {pos:13, eq:"Orense SC",               pj:8,g:2,e:2,p:4,gf:11,gc:14, pts:8, col:"#B8860B"},
  {pos:14, eq:"Leones FC",               pj:8,g:1,e:4,p:3,gf:4, gc:9,  pts:7, col:"#996633"},
  {pos:15, eq:"Emelec",                  pj:8,g:2,e:2,p:4,gf:6, gc:10, pts:5, col:"#0066CC",nota:"*"},
  {pos:16, eq:"Manta FC",                pj:8,g:1,e:1,p:6,gf:2, gc:9,  pts:4, col:"#009966"},
];

const STATS_FALLBACK = {
  goleadores:[
    {n:"Alexis Zapata",      eq:"U. Católica",            g:5},
    {n:"Ángelo Preciado",    eq:"Independiente del Valle",g:4},
    {n:"Jonatan Álvez",      eq:"Barcelona SC",           g:4},
    {n:"Washington Corozo",  eq:"Aucas",                  g:3},
    {n:"Danny Cabezas",      eq:"Dep. Cuenca",            g:3},
    {n:"Ariel Nahuelpan",    eq:"Delfín SC",              g:3},
    {n:"Jhon Sánchez",       eq:"Orense SC",              g:3},
    {n:"Bryan Angulo",       eq:"Técnico Univ.",          g:3},
  ],
  asistencias:[
    {n:"Erick Castillo",     eq:"U. Católica",            a:4},
    {n:"Cristian Pellerano", eq:"Independiente del Valle",a:3},
    {n:"Gonzalo Plata",      eq:"Barcelona SC",           a:3},
    {n:"Jhojan Julio",       eq:"Aucas",                  a:2},
    {n:"Adonis Preciado",    eq:"Libertad FC",            a:2},
    {n:"Matías Fernández",   eq:"Liga de Quito",          a:2},
  ],
  resumen:{goles:95,jornadas:8,promedio:2.97,locales:44}
};

const FIXTURE_ACTUAL = [
  {id:"f1",loc:"Leones FC",               vis:"Aucas",                  fecha:"Vie 18 Abr · 19:00"},
  {id:"f2",loc:"Emelec",                  vis:"Guayaquil City",         fecha:"Vie 18 Abr · 19:00"},
  {id:"f3",loc:"Mushuc Runa",             vis:"Técnico Universitario",  fecha:"Vie 18 Abr · 19:00"},
  {id:"f4",loc:"Universidad Católica",    vis:"Libertad FC",            fecha:"Vie 18 Abr · 19:00"},
  {id:"f5",loc:"Orense SC",               vis:"Delfín SC",              fecha:"Sáb 19 Abr · 15:00"},
  {id:"f6",loc:"Manta FC",                vis:"Deportivo Cuenca",       fecha:"Sáb 19 Abr · 15:00"},
  {id:"f7",loc:"Independiente del Valle", vis:"Liga de Quito",          fecha:"Sáb 19 Abr · 17:30"},
  {id:"f8",loc:"Macará",                  vis:"Barcelona SC",           fecha:"Dom 20 Abr · 16:00"},
];

const RESULTADOS_JORNADAS = {
  8:{res:{f1:"1",f2:"2",f3:"1",f4:"1",f5:"1",f6:"x",f7:"2",f8:"1"},marc:{f1:"2-1",f2:"0-1",f3:"1-0",f4:"2-0",f5:"1-0",f6:"0-0",f7:"2-3",f8:"2-0"}},
  7:{res:{f1:"1",f2:"2",f3:"1",f4:"x",f5:"1",f6:"1",f7:"2",f8:"x"}, marc:{f1:"1-0",f2:"0-1",f3:"2-0",f4:"1-1",f5:"2-1",f6:"3-1",f7:"0-2",f8:"0-0"}},
};

const TROFEOS_DEF = [
  {id:'goleador',icon:'⚽',lbl:'Goleador de la jornada',cond:r=>r.pts>=6},
  {id:'preciso', icon:'🎯',lbl:'Precisión de reloj',    cond:r=>r.exactos>=3},
  {id:'perfecto',icon:'🌟',lbl:'Jornada perfecta',      cond:r=>r.aciertos===8||r.exactos===8},
  {id:'saladoec',icon:'💀',lbl:'Salado EC',             cond:r=>r.pts===0},
];

// ============================================================
//  SUPABASE INIT
// ============================================================
function initSupabase() {
  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('TU_PROYECTO')) {
    supabaseActivo = false;
    return;
  }
  try {
    _supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    supabaseActivo = true;
  } catch(e) {
    console.warn('Supabase error:', e);
    supabaseActivo = false;
  }
}

// ============================================================
//  HELPERS
// ============================================================
function safeJSON(str){if(!str)return{};if(typeof str==='object')return str;try{return JSON.parse(str);}catch{return{};}}
function escHtml(str){if(!str)return'';return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function strColor(s){const c=['#FFD100','#EF3340','#003DA5','#00C96E','#FF7B1C','#9B59B6','#1ABC9C','#E74C3C','#3498DB','#E67E22'];let h=0;for(let i=0;i<(s||'').length;i++)h=s.charCodeAt(i)+((h<<5)-h);return c[Math.abs(h)%c.length];}
function openModal(id){const m=document.getElementById(id);if(m)m.style.display='flex';}
function closeModal(id){const m=document.getElementById(id);if(m)m.style.display='none';}
function overlayClose(e,id){if(e.target.classList.contains('modal-overlay'))closeModal(id);}
function showMsg(el,type,msg){if(!el)return;if(!msg){el.innerHTML='';return;}const cls=type==='err'?'a-err':type==='load'?'a-load':'a-ok';el.innerHTML=`<div class="alert ${cls}">${msg}</div>`;}
function tradError(msg){if(msg.includes('Invalid login'))return'Email o contraseña incorrectos';if(msg.includes('Email already'))return'Ese email ya está registrado';if(msg.includes('Password should'))return'La contraseña debe tener al menos 6 caracteres';return msg;}
function calcStats(partidos){const t=partidos.length,g=partidos.filter(p=>p.resultado==='ganó').length,e=partidos.filter(p=>p.resultado==='empató').length,pe=partidos.filter(p=>p.resultado==='perdió').length;return{t,g,e,pe,pct:t>0?Math.round(g/t*100):0};}
function getSalado(pct){if(pct>=70)return{e:'🍀',l:'¡ERES DE BUENA SUERTE!',c:'var(--ver)'};if(pct>=50)return{e:'😊',l:'BASTANTE SUERTUDO',c:'#85c720'};if(pct>=35)return{e:'😐',l:'SUERTE NORMAL',c:'#f0a500'};if(pct>=20)return{e:'😬',l:'ALGO SALADO...',c:'var(--na)'};return{e:'💀',l:'SALADÍSIMO — QUÉDATE EN CASA',c:'var(--ro)'};}
function calcPuntosProde(picks,marcadores,resultados){if(!resultados?.res)return{pts:0,aciertos:0,exactos:0};let pts=0,aciertos=0,exactos=0;Object.keys(resultados.res).forEach(fid=>{const marc=marcadores?.[fid],marcReal=resultados.marc?.[fid];if(marc&&marc===marcReal){pts+=3;exactos++;}else if(picks?.[fid]&&picks[fid]===resultados.res[fid]){pts+=1;aciertos++;}});return{pts,aciertos,exactos};}
function calcTrofeos(r){return TROFEOS_DEF.filter(t=>t.cond(r)).map(t=>t.id);}

// ============================================================
//  AUTH
// ============================================================
async function doRegister() {
  if(!supabaseActivo){showMsg(document.getElementById('rmsg'),'err','Configura Supabase primero');return;}
  const nombre=document.getElementById('r-n').value.trim();
  const username=document.getElementById('r-u').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  const email=document.getElementById('r-e').value.trim().toLowerCase();
  const pass=document.getElementById('r-p').value;
  const equipo=document.getElementById('r-eq').value;
  const msgEl=document.getElementById('rmsg');
  if(!nombre||!username||!email||!pass||!equipo){showMsg(msgEl,'err','Completa todos los campos');return;}
  if(pass.length<6){showMsg(msgEl,'err','Mínimo 6 caracteres');return;}
  showMsg(msgEl,'load','Creando cuenta...');
  const{data:ex}=await _supabase.from('perfiles').select('username').eq('username',username).single();
  if(ex){showMsg(msgEl,'err','Ese usuario ya existe');return;}
  const{data:authData,error:authError}=await _supabase.auth.signUp({email,password:pass,options:{data:{nombre,username,equipo}}});
  if(authError){showMsg(msgEl,'err',tradError(authError.message));return;}
  if(authData.user){
    const color=strColor(authData.user.id);
    await _supabase.from('perfiles').insert({id:authData.user.id,nombre,username,equipo,avatar_color:color});
    currentUser={id:authData.user.id,email,nombre,username,equipo,avatar_color:color};
    closeModal('modal-register');onLogin();showMsg(msgEl,'','');
  }
}

async function doLogin() {
  if(!supabaseActivo){showMsg(document.getElementById('lmsg'),'err','Configura Supabase primero');return;}
  const emailOrUser=document.getElementById('l-u').value.trim().toLowerCase();
  const pass=document.getElementById('l-p').value;
  const msgEl=document.getElementById('lmsg');
  if(!emailOrUser||!pass){showMsg(msgEl,'err','Completa todos los campos');return;}
  showMsg(msgEl,'load','Iniciando sesión...');
  let loginEmail=emailOrUser;
  if(!emailOrUser.includes('@')){
    const{data:perfil}=await _supabase.from('perfiles').select('id').eq('username',emailOrUser).single();
    if(!perfil){showMsg(msgEl,'err','Usuario no encontrado');return;}
    const{data:emailData}=await _supabase.rpc('get_email_by_id',{user_id:perfil.id});
    if(!emailData){showMsg(msgEl,'err','No se pudo resolver el usuario');return;}
    loginEmail=emailData;
  }
  const{data,error}=await _supabase.auth.signInWithPassword({email:loginEmail,password:pass});
  if(error){showMsg(msgEl,'err',tradError(error.message));return;}
  await loadPerfil(data.user.id);closeModal('modal-login');onLogin();showMsg(msgEl,'','');
}

async function doLogout(){if(_supabase)await _supabase.auth.signOut();currentUser=null;onLogout();}

async function loadPerfil(userId){
  if(!_supabase)return;
  const{data}=await _supabase.from('perfiles').select('*').eq('id',userId).single();
  if(data)currentUser=data;
}

async function checkSession(){
  if(!_supabase||!supabaseActivo)return;
  const{data:{session}}=await _supabase.auth.getSession();
  if(session?.user){await loadPerfil(session.user.id);onLogin();}else{onLogout();}
}

function onLogin(){
  const ini=currentUser.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const col=currentUser.avatar_color||strColor(currentUser.id);
  document.getElementById('user-btn-area').innerHTML=`<div class="user-chip"><div class="av" style="width:34px;height:34px;font-size:13px;font-weight:900;background:${col}">${ini}</div><div><div class="chip-name">${escHtml(currentUser.nombre)}</div><div class="chip-team">${escHtml(currentUser.equipo)}</div></div><button class="x-btn" onclick="doLogout()">✕</button></div>`;
  document.querySelectorAll('.ntab.auth-required').forEach(t=>t.classList.add('unlocked'));
  document.getElementById('auth-banner').style.display='none';
}

function onLogout(){
  document.getElementById('user-btn-area').innerHTML=`<button class="btn b-am" onclick="openModal('modal-login')">Iniciar sesión</button><button class="btn b-outline" onclick="openModal('modal-register')">Registrarse</button>`;
  document.querySelectorAll('.ntab.auth-required').forEach(t=>t.classList.remove('unlocked'));
  document.getElementById('auth-banner').style.display='flex';
  const activeScr=document.querySelector('.scr.on')?.id?.replace('scr-','');
  if(['ligas','perfil'].includes(activeScr))goTab('tabla');
}

// ============================================================
//  API SUPABASE
// ============================================================
async function guardarPronostico(jornada,picks,marcadores){
  if(!currentUser||!_supabase)return{error:'No autenticado'};
  const{error}=await _supabase.from('pronosticos').upsert({user_id:currentUser.id,jornada,picks:JSON.stringify(picks),marcadores:JSON.stringify(marcadores),updated_at:new Date().toISOString()},{onConflict:'user_id,jornada'});
  return{error};
}
async function fetchPronosticosJornada(jornada){
  if(!_supabase)return[];
  const{data}=await _supabase.from('pronosticos').select(`user_id,picks,marcadores,perfiles(nombre,username,equipo,avatar_color)`).eq('jornada',jornada);
  return(data||[]).map(d=>({userId:d.user_id,nombre:d.perfiles?.nombre||'Anónimo',username:d.perfiles?.username||'',equipo:d.perfiles?.equipo||'',avatarColor:d.perfiles?.avatar_color||'#FFD100',picks:safeJSON(d.picks),marcadores:safeJSON(d.marcadores)}));
}
async function fetchMisPronosticos(jornada){
  if(!currentUser||!_supabase)return{picks:{},marcadores:{}};
  const{data}=await _supabase.from('pronosticos').select('picks,marcadores').eq('user_id',currentUser.id).eq('jornada',jornada).single();
  return{picks:safeJSON(data?.picks),marcadores:safeJSON(data?.marcadores)};
}
async function fetchMisLigas(){
  if(!currentUser||!_supabase)return[];
  const{data}=await _supabase.from('liga_miembros').select(`ligas(id,nombre,descripcion,privada,codigo,creador_id,perfiles!ligas_creador_id_fkey(nombre))`).eq('user_id',currentUser.id);
  return(data||[]).map(d=>d.ligas).filter(Boolean);
}
async function fetchLigaDetalle(ligaId){
  if(!_supabase)return null;
  const{data:liga}=await _supabase.from('ligas').select(`*,perfiles!ligas_creador_id_fkey(nombre,username)`).eq('id',ligaId).single();
  const{data:miembros}=await _supabase.from('liga_miembros').select(`perfiles(id,nombre,username,equipo,avatar_color)`).eq('liga_id',ligaId);
  const{data:chat}=await _supabase.from('liga_chat').select(`mensaje,created_at,perfiles(nombre,username,avatar_color)`).eq('liga_id',ligaId).order('created_at',{ascending:true}).limit(50);
  return{...liga,miembros:(miembros||[]).map(m=>m.perfiles),chat:(chat||[]).map(c=>({txt:c.mensaje,ts:new Date(c.created_at).toLocaleTimeString('es-EC',{hour:'2-digit',minute:'2-digit'}),nombre:c.perfiles?.nombre,username:c.perfiles?.username,avatarColor:c.perfiles?.avatar_color}))};
}
async function crearLigaDB(nombre,descripcion,privada){
  if(!currentUser||!_supabase)return{error:'No autenticado'};
  const codigo=Math.random().toString(36).substr(2,6).toUpperCase();
  const{data:liga,error}=await _supabase.from('ligas').insert({nombre,descripcion,privada,codigo,creador_id:currentUser.id}).select().single();
  if(error)return{error};
  await _supabase.from('liga_miembros').insert({liga_id:liga.id,user_id:currentUser.id});
  return{liga};
}
async function unirseALigaDB(codigo){
  if(!currentUser||!_supabase)return{error:'No autenticado'};
  const{data:liga}=await _supabase.from('ligas').select('id,nombre').eq('codigo',codigo.toUpperCase()).single();
  if(!liga)return{error:'Código no válido'};
  const{data:ex}=await _supabase.from('liga_miembros').select('id').eq('liga_id',liga.id).eq('user_id',currentUser.id).single();
  if(ex)return{error:'Ya eres miembro'};
  const{error}=await _supabase.from('liga_miembros').insert({liga_id:liga.id,user_id:currentUser.id});
  if(error)return{error:error.message};
  return{liga};
}
async function enviarMensajeChat(ligaId,mensaje){if(!currentUser||!_supabase)return;await _supabase.from('liga_chat').insert({liga_id:ligaId,user_id:currentUser.id,mensaje});}
async function fetchMisPartidos(){if(!currentUser||!_supabase)return[];const{data}=await _supabase.from('partidos').select('*').eq('user_id',currentUser.id).order('fecha',{ascending:false});return data||[];}
async function fetchTodosUsuarios(){if(!_supabase)return[];const{data}=await _supabase.from('perfiles').select('id,nombre,username,equipo,avatar_color').order('nombre');return data||[];}
async function fetchEstadisticasUsuario(userId){if(!_supabase)return[];const{data}=await _supabase.from('partidos').select('*').eq('user_id',userId).order('fecha',{ascending:false});return data||[];}
async function guardarPartidoDB(partido){if(!currentUser||!_supabase)return{error:'No autenticado'};const{error}=await _supabase.from('partidos').insert({user_id:currentUser.id,...partido});return{error};}
async function fetchResultadosJornada(jornada){
  if(!_supabase)return null;
  const{data}=await _supabase.from('resultados_jornadas').select('*').eq('jornada',jornada).single();
  if(data)return{res:safeJSON(data.resultados),marc:safeJSON(data.marcadores),revelado:data.revelado};
  if(RESULTADOS_JORNADAS[jornada])return{...RESULTADOS_JORNADAS[jornada],revelado:true};
  return null;
}

// ============================================================
//  ESCUDOS
// ============================================================
function escudo(eq){
  const map={"Independiente del Valle":"IDV","Universidad Católica":"UC","Barcelona SC":"BSC","Aucas":"AUC","Deportivo Cuenca":"CUE","Técnico Universitario":"TU","Delfín SC":"DEL","Macará":"MAC","Mushuc Runa":"MR","Libertad FC":"LIB","Liga de Quito":"LDU","Guayaquil City":"GC","Orense SC":"ORE","Leones FC":"LEO","Emelec":"EME","Manta FC":"MAN"};
  const col=TABLA_FALLBACK.find(t=>t.eq===eq)?.col||'#555';
  const txt=map[eq]||eq.slice(0,3).toUpperCase();
  const textCol=['#FFD700','#FFA500','#CCCCCC','#B8860B'].includes(col)?'#333':'#fff';
  return`<svg viewBox="0 0 32 32" width="26" height="26" style="flex-shrink:0"><circle cx="16" cy="16" r="15" fill="${col}"/><text x="16" y="21" text-anchor="middle" font-size="${txt.length>3?8:txt.length===3?9:11}" font-weight="bold" fill="${textCol}" font-family="sans-serif">${txt}</text></svg>`;
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();

  // Pestañas — siempre funcionan
  document.querySelectorAll('.ntab').forEach(btn => {
    btn.addEventListener('click', () => goTab(btn.dataset.tab));
  });

  // Tabla inmediata, sin esperar nada
  renderTabla(TABLA_FALLBACK);
  document.getElementById('tabla-update').textContent = 'Fecha 8 · 13 Abr 2026';

  // Sesión
  if (supabaseActivo) {
    await checkSession();
  } else {
    onLogout();
    const b = document.getElementById('auth-banner');
    b.style.display = 'flex';
    b.innerHTML = `<span>⚙️ Falta configurar Supabase en <code>main.js</code> — la tabla ya funciona</span>`;
  }
});

// ============================================================
//  NAVEGACIÓN
// ============================================================
function goTab(name) {
  if (['ligas','perfil'].includes(name) && !currentUser) { openModal('modal-login'); return; }
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.ntab').forEach(t=>t.classList.remove('on'));
  document.getElementById('scr-'+name)?.classList.add('on');
  document.querySelector(`.ntab[data-tab="${name}"]`)?.classList.add('on');
  if(name!=='ligas'&&chatPolling){clearInterval(chatPolling);chatPolling=null;}
  ({stats:rStats,prode:rProde,ligas:rLigas,historial:rHinchas,perfil:rPerfil})[name]?.();
}

// ============================================================
//  TABLA
// ============================================================
function renderTabla(data) {
  const tbody = document.getElementById('tbody-tabla');
  if (!tbody) return;
  tbody.innerHTML = data.map(t => {
    const dg=t.gf-t.gc;
    const z=t.pos<=4?'zc':t.pos<=8?'zs':t.pos>=15?'zd':'';
    const nota=t.nota?`<span style="color:var(--ro);font-size:10px">*</span>`:'';
    return `<tr class="${z}">
      <td style="color:var(--muted);font-weight:800;font-size:12px">${t.pos}</td>
      <td><div style="display:flex;align-items:center;gap:8px">${escudo(t.eq)}<span>${t.eq}${nota}</span></div></td>
      <td>${t.pj}</td><td>${t.g}</td><td>${t.e}</td><td>${t.p}</td>
      <td>${t.gf}</td><td>${t.gc}</td>
      <td style="color:${dg>0?'var(--ver)':dg<0?'var(--ro)':'var(--muted)'}">${dg>0?'+':''}${dg}</td>
      <td><span class="pts-val">${t.pts}</span></td>
    </tr>`;
  }).join('') +
  `<tr><td colspan="10" style="padding:8px 9px;border-top:2px solid var(--border)">
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:11px;font-weight:700">
      <span style="color:var(--ver)">▌ Pos 1-4 · Copa Libertadores</span>
      <span style="color:var(--az)">▌ Pos 5-8 · Copa Sudamericana</span>
      <span style="color:var(--ro)">▌ Pos 15-16 · Descenso</span>
    </div>
  </td></tr>
  <tr><td colspan="10" style="padding:6px 9px;background:rgba(255,255,255,.02)">
    <div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:3px">Fase final (tras 30 fechas):</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:11px">
      <span style="color:var(--am)">🏆 Top 6 → Hexagonal por el título</span>
      <span style="color:#85B7EB">🥈 Pos 7-10 → Cuadrangular Sudamericana</span>
      <span style="color:#f0a500">⚠️ Pos 11-16 → Hexagonal no descenso</span>
    </div>
  </td></tr>
  <tr><td colspan="10" style="font-size:10px;color:var(--muted);padding:5px 9px">* Emelec -3 pts por sanción · Fecha 8 · 13 Abr 2026 · ligapro.ec</td></tr>`;
}

// ============================================================
//  STATS
// ============================================================
function rStats() {
  const{goleadores,asistencias,resumen}=STATS_FALLBACK;
  document.getElementById('st-goles').textContent=resumen.goles;
  document.getElementById('st-jornadas').textContent=resumen.jornadas;
  document.getElementById('st-promedio').textContent=resumen.promedio;
  document.getElementById('st-locales').textContent=resumen.locales+'%';
  const mg=goleadores[0].g;
  document.getElementById('goleadores').innerHTML=goleadores.map((p,i)=>`<div class="stat-row"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:${i<3?800:600};color:${i===0?'var(--am)':'var(--txt)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.n}</div><div style="font-size:10px;font-weight:700;color:var(--muted)">${p.eq}</div><div style="margin-top:4px"><div class="stat-bar" style="width:${Math.round(p.g/mg*120)}px;background:${i===0?'var(--am)':'rgba(255,255,255,.1)'}"></div></div></div><div class="stat-num" style="color:${i===0?'var(--am)':'var(--txt)'};margin-left:8px">${p.g}</div></div>`).join('');
  const ma=asistencias[0].a;
  document.getElementById('asistencias').innerHTML=asistencias.map((p,i)=>`<div class="stat-row"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:${i<3?800:600};color:${i===0?'var(--ver)':'var(--txt)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.n}</div><div style="font-size:10px;font-weight:700;color:var(--muted)">${p.eq}</div><div style="margin-top:4px"><div class="stat-bar" style="width:${Math.round(p.a/ma*120)}px;background:${i===0?'var(--ver)':'rgba(255,255,255,.1)'}"></div></div></div><div class="stat-num" style="color:${i===0?'var(--ver)':'var(--txt)'};margin-left:8px">${p.a}</div></div>`).join('');
  const atk=[...TABLA_FALLBACK].sort((a,b)=>b.gf-a.gf).slice(0,6);
  document.getElementById('ataque').innerHTML=atk.map((t,i)=>`<div class="stat-row"><span style="font-size:13px;flex:1">${t.eq}</span><div style="display:flex;align-items:center;gap:8px"><div class="stat-bar" style="width:${Math.round(t.gf/atk[0].gf*80)}px;background:${i===0?'var(--ver)':'rgba(255,255,255,.1)'}"></div><span class="stat-num" style="color:${i===0?'var(--ver)':'var(--txt)'}">${t.gf}</span></div></div>`).join('');
  const def=[...TABLA_FALLBACK].sort((a,b)=>a.gc-b.gc).slice(0,6);
  document.getElementById('defensa').innerHTML=def.map((t,i)=>`<div class="stat-row"><span style="font-size:13px;flex:1">${t.eq}</span><div style="display:flex;align-items:center;gap:8px"><div class="stat-bar" style="width:${Math.round((def[def.length-1].gc-t.gc+5)/20*80)}px;background:${i===0?'var(--az)':'rgba(255,255,255,.1)'}"></div><span class="stat-num" style="color:${i===0?'#85B7EB':'var(--txt)'}">${t.gc}</span></div></div>`).join('');
}

// ============================================================
//  PRODE
// ============================================================
async function rProde(){
  document.getElementById('prode-jornada').textContent=stateProde.jornada;
  document.getElementById('rank-j').textContent=stateProde.jornada;
  document.getElementById('fixture-loading').classList.add('active');
  if(currentUser&&supabaseActivo){const{picks,marcadores}=await fetchMisPronosticos(stateProde.jornada);stateProde.picks=picks;stateProde.marcadores=marcadores;}
  if(supabaseActivo){stateProde.resultados=await fetchResultadosJornada(stateProde.jornada);stateProdeParticipantes=await fetchPronosticosJornada(stateProde.jornada);}
  document.getElementById('fixture-loading').classList.remove('active');
  renderFixture();updHeroProde();
}
function renderFixture(){
  const{picks,marcadores,resultados}=stateProde,revelado=resultados?.revelado;
  document.getElementById('fixture').innerHTML=FIXTURE_ACTUAL.map(m=>{
    const sel=picks[m.id]||'',marc=marcadores[m.id]||'',res=revelado?resultados.res[m.id]:'',marcReal=revelado?resultados.marc?.[m.id]:'';
    const corr=res&&sel===res,exact=revelado&&marc===marcReal&&marc;
    let chip='';if(revelado&&sel){const pts=exact?3:corr?1:0;chip=`<span class="res-chip ${corr||exact?'rc-ok':'rc-bad'}">${pts}pts · ${marcReal}</span>`;}
    return`<div class="p-card"><div style="display:flex;justify-content:space-between;align-items:center"><span class="p-fecha">${m.fecha}</span>${chip}</div><div class="p-teams"><span class="p-local">${m.loc}</span><span class="p-vs">VS</span><span class="p-visit">${m.vis}</span></div><div class="pick-row"><button class="pk ${getPkCls(sel,'1',res,revelado)}" onclick="pickProde('${m.id}','1',this)" ${revelado?'disabled':''}>1 Local</button><button class="pk ${getPkCls(sel,'x',res,revelado)}" onclick="pickProde('${m.id}','x',this)" ${revelado?'disabled':''}>X Empate</button><button class="pk ${getPkCls(sel,'2',res,revelado)}" onclick="pickProde('${m.id}','2',this)" ${revelado?'disabled':''}>2 Visita</button></div>${!revelado?`<input class="marc-input" placeholder="Marcador exacto +3 pts (ej: 2-1)" value="${marc}" oninput="saveMarc('${m.id}',this.value)"/>`:''}
    </div>`;
  }).join('');
  const msgArea=document.getElementById('prode-msg');
  if(!currentUser)msgArea.innerHTML=`<div class="alert a-info"><a href="#" onclick="openModal('modal-login')">Inicia sesión</a> o <a href="#" onclick="openModal('modal-register')">regístrate</a> para guardar y aparecer en el ranking</div>`;
}
function getPkCls(sel,pick,res,rev){if(!sel&&!rev)return'';if(!rev)return sel===pick?`s${pick}`:'';if(sel===pick)return res===pick?'ok-s':'bad-s';return res===pick?'ok':'';}
function pickProde(mid,pick,btn){stateProde.picks[mid]=pick;btn.parentElement.querySelectorAll('.pk').forEach(b=>b.className='pk');btn.className=`pk s${pick}`;updHeroProde();if(!currentUser)document.getElementById('prode-msg').innerHTML=`<div class="alert a-info"><a href="#" onclick="openModal('modal-login')">Inicia sesión</a> para guardar tus pronósticos</div>`;}
function saveMarc(mid,val){stateProde.marcadores[mid]=val.trim();}
async function guardarProde(){
  if(!currentUser){openModal('modal-login');return;}
  const n=Object.keys(stateProde.picks).length,msg=document.getElementById('prode-msg');
  if(n===0){msg.innerHTML='<div class="alert a-err">Sin pronósticos</div>';return;}
  msg.innerHTML='<div class="alert a-load">Guardando...</div>';
  const{error}=await guardarPronostico(stateProde.jornada,stateProde.picks,stateProde.marcadores);
  if(error){msg.innerHTML=`<div class="alert a-err">${error}</div>`;return;}
  msg.innerHTML=`<div class="alert a-ok">¡Guardado! ${n}/8 pronósticos</div>`;
  stateProdeParticipantes=await fetchPronosticosJornada(stateProde.jornada);updHeroProde();setTimeout(()=>msg.innerHTML='',3000);
}
function updHeroProde(){
  document.getElementById('ph-jug').textContent=stateProdeParticipantes.length;
  if(!currentUser){document.getElementById('ph-pts').textContent='—';document.getElementById('ph-pos').textContent='—';return;}
  const r=calcPuntosProde(stateProde.picks,stateProde.marcadores,stateProde.resultados),rev=stateProde.resultados?.revelado;
  document.getElementById('ph-pts').textContent=rev?r.pts:Object.keys(stateProde.picks).length+' sel';
  if(rev&&stateProdeParticipantes.length>0){const rank=stateProdeParticipantes.map(p=>calcPuntosProde(p.picks,p.marcadores,stateProde.resultados).pts).sort((a,b)=>b-a);document.getElementById('ph-pos').textContent='#'+(rank.findIndex(p=>p<=r.pts)+1);}
}
function pTab(t){document.querySelectorAll('#scr-prode .itab').forEach((b,i)=>b.classList.toggle('on',['picks','ranking','historial-p'].indexOf(t)===i));['pt-picks','pt-ranking','pt-historial-p'].forEach(id=>document.getElementById(id).style.display='none');document.getElementById('pt-'+t).style.display='block';if(t==='ranking')rRankingGlobal();if(t==='historial-p')rHistProde();}
function rRankingGlobal(){
  const rev=stateProde.resultados?.revelado,data=stateProdeParticipantes;
  document.getElementById('rank-badge').textContent=data.length+' jugadores';
  if(!data.length){document.getElementById('ranking-list').innerHTML='<div class="empty"><span class="empty-icon">🏆</span>Sé el primero</div>';document.getElementById('ranking-acum').innerHTML='<div class="empty"><span class="empty-icon">📊</span>Sin datos</div>';return;}
  const cols=['var(--am)','#ccc','#cd7f32'];
  const ranking=data.map(p=>{const r=calcPuntosProde(p.picks,p.marcadores,stateProde.resultados);return{...p,r,trofs:rev?calcTrofeos(r):[],sel:Object.keys(p.picks||{}).length};}).sort((a,b)=>b.r.pts-a.r.pts);
  document.getElementById('ranking-list').innerHTML=ranking.map((r,i)=>`<div class="rk-row"><span class="rk-num ${i<3?'rk'+(i+1):''}">${i+1}</span><div class="rk-info"><div class="rk-name">${escHtml(r.nombre)}${currentUser&&r.userId===currentUser.id?' <span class="you-badge">(tú)</span>':''}</div><div class="rk-sub">${escHtml(r.equipo)} · ${r.sel}/8</div></div><div style="text-align:right"><div class="rk-pts" style="color:${i<3?cols[i]:'var(--am)'}">${rev?r.r.pts:'-'}</div><div class="rk-det">${rev?`${r.r.aciertos} ✓ · ${r.r.exactos} exactos`:r.sel+' selecc.'}</div></div></div>`).join('');
  document.getElementById('ranking-acum').innerHTML=ranking.map((r,i)=>`<div class="rk-row"><span class="rk-num ${i<3?'rk'+(i+1):''}">${i+1}</span><div class="rk-info"><div class="rk-name">${escHtml(r.nombre)}</div><div class="rk-sub">${escHtml(r.equipo)}</div></div><div style="text-align:right"><div class="rk-pts">${rev?r.r.pts:'-'}</div></div></div>`).join('');
}
async function rHistProde(){
  const el=document.getElementById('hist-jornadas');
  if(!currentUser){el.innerHTML='<div class="empty"><span class="empty-icon">🔒</span><a href="#" onclick="openModal(\'modal-login\')">Inicia sesión</a></div>';return;}
  const jornadas=Object.keys(RESULTADOS_JORNADAS).map(Number).sort((a,b)=>b-a);
  if(!jornadas.length){el.innerHTML='<div style="color:var(--muted);font-size:13px">Sin historial aún</div>';return;}
  el.innerHTML='<div class="alert a-load">Cargando...</div>';
  const rows=await Promise.all(jornadas.map(async j=>{const{picks,marcadores}=await fetchMisPronosticos(j);const r=calcPuntosProde(picks,marcadores,{...RESULTADOS_JORNADAS[j],revelado:true});return{j,r,sel:Object.keys(picks).length};}));
  el.innerHTML=rows.map(({j,r,sel})=>`<div class="jornada-row"><div><div style="font-family:var(--font-h);font-size:16px">Jornada ${j}</div><div style="font-size:11px;font-weight:700;color:var(--muted)">${sel>0?`${r.aciertos} aciertos · ${r.exactos} exactos`:'No participaste'}</div></div><div style="font-family:var(--font-h);font-size:24px;color:${r.pts>0?'var(--am)':'var(--muted)'}">${sel>0?r.pts+' pts':'-'}</div></div>`).join('');
}

// ============================================================
//  HINCHAS
// ============================================================
async function rHinchas(){hTab('comunidad');}
async function hTab(t){
  document.querySelectorAll('#scr-historial .itab').forEach((b,i)=>b.classList.toggle('on',['comunidad','mis-partidos'].indexOf(t)===i));
  document.getElementById('ht-comunidad').style.display=t==='comunidad'?'block':'none';
  document.getElementById('ht-mis-partidos').style.display=t==='mis-partidos'?'block':'none';
  document.getElementById('ht-perfil-usuario').style.display='none';
  if(t==='comunidad')await rComunidad();
  if(t==='mis-partidos')await rMisPartidosTab();
}
async function rComunidad(){
  const el=document.getElementById('comunidad-list');
  if(!supabaseActivo){el.innerHTML='<div class="empty"><span class="empty-icon">⚙️</span>Configura Supabase para ver la comunidad</div>';return;}
  el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const usuarios=await fetchTodosUsuarios();
  if(!usuarios.length){el.innerHTML='<div class="empty"><span class="empty-icon">👥</span>¡Sé el primero en registrarte!</div>';return;}
  const todos=await Promise.all(usuarios.map(async u=>{const p=await fetchEstadisticasUsuario(u.id);return{...u,s:calcStats(p)};}));
  el.innerHTML=`<div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:12px">${todos.length} HINCHAS REGISTRADOS</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">
  ${todos.map(u=>{const sl=getSalado(u.s.pct),ini=u.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2),col=u.avatar_color||strColor(u.id);
  return`<div onclick="verPerfilUsuario('${u.id}')" style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:1rem;cursor:pointer;transition:border-color .2s" onmouseover="this.style.borderColor='var(--am)'" onmouseout="this.style.borderColor='var(--border)'">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div class="av" style="width:40px;height:40px;font-size:14px;font-weight:900;background:${col}">${ini}</div><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(u.nombre)}</div><div style="font-size:11px;color:var(--muted);font-weight:600">${escHtml(u.equipo)}</div></div><div style="font-size:28px">${sl.e}</div></div>
    <div style="display:flex;gap:12px;font-size:12px;text-align:center"><div><div style="font-family:var(--font-h);font-size:20px">${u.s.t}</div><div style="color:var(--muted);font-weight:700">partidos</div></div><div><div style="font-family:var(--font-h);font-size:20px;color:var(--ver)">${u.s.g}</div><div style="color:var(--muted);font-weight:700">victorias</div></div><div><div style="font-family:var(--font-h);font-size:20px;color:${sl.c}">${u.s.pct}%</div><div style="color:var(--muted);font-weight:700">% vic.</div></div></div>
    <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden;margin-top:8px"><div style="height:100%;border-radius:3px;width:${u.s.pct}%;background:${u.s.pct>=50?'var(--ver)':'var(--ro)'}"></div></div>
    <div style="font-size:11px;color:${sl.c};font-weight:800;margin-top:6px;font-family:var(--font-h)">${sl.l}</div>
  </div>`;}).join('')}</div>`;
}
async function verPerfilUsuario(userId){
  document.getElementById('ht-comunidad').style.display='none';document.getElementById('ht-mis-partidos').style.display='none';
  const det=document.getElementById('ht-perfil-usuario');det.style.display='block';det.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const partidos=await fetchEstadisticasUsuario(userId);const usuarios=await fetchTodosUsuarios();const u=usuarios.find(x=>x.id===userId);
  if(!u){det.innerHTML='<div class="alert a-err">No encontrado</div>';return;}
  const s=calcStats(partidos),sl=getSalado(s.pct),ini=u.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2),col=u.avatar_color||strColor(u.id);
  det.innerHTML=`<button class="btn" onclick="hTab('comunidad')" style="margin-bottom:1rem">← Volver</button><div class="card">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:1.5rem;flex-wrap:wrap"><div class="av" style="width:52px;height:52px;font-size:18px;font-weight:900;background:${col}">${ini}</div><div><div style="font-family:var(--font-h);font-size:26px">${escHtml(u.nombre)}</div><div style="font-size:12px;font-weight:700;color:var(--muted)">@${u.username} · ${escHtml(u.equipo)}</div></div></div>
    <div style="background:var(--panel);border-radius:12px;padding:1rem;margin-bottom:1rem;border-left:4px solid ${sl.c}"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:40px">${sl.e}</span><div><div style="font-family:var(--font-h);font-size:18px;color:${sl.c}">${sl.l}</div><div style="font-size:12px;color:var(--muted)">${s.pct}% victorias al estadio</div></div></div><div class="sal-bar"><div class="sal-fill" style="width:${s.pct}%;background:${s.pct>=50?'var(--ver)':'var(--ro)'}"></div></div></div>
    <div class="g4 mb1"><div class="met"><div class="met-v">${s.t}</div><div class="met-l">Partidos</div></div><div class="met"><div class="met-v" style="color:var(--ver)">${s.g}</div><div class="met-l">Victorias</div></div><div class="met"><div class="met-v" style="color:#f0a500">${s.e}</div><div class="met-l">Empates</div></div><div class="met"><div class="met-v" style="color:var(--ro)">${s.pe}</div><div class="met-l">Derrotas</div></div></div>
    ${partidos.length>0?partidos.map(pt=>{const c=pt.resultado==='ganó'?'var(--ver)':pt.resultado==='empató'?'#f0a500':'var(--ro)';return`<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:13px;font-weight:700">vs ${escHtml(pt.rival)}</div><div style="font-size:11px;color:var(--muted)">${pt.fecha} · ${escHtml(pt.estadio)}</div></div><div style="font-family:var(--font-h);font-size:15px;color:${c}">${(pt.resultado||'').toUpperCase()}</div></div>`;}).join(''):'<div style="color:var(--muted);font-size:13px;text-align:center;padding:1rem">Sin partidos registrados</div>'}
  </div>`;
}
async function rMisPartidosTab(){
  const el=document.getElementById('mis-partidos-list');
  if(!currentUser){el.innerHTML=`<div class="empty"><span class="empty-icon">🔒</span><a href="#" onclick="openModal('modal-login')">Inicia sesión</a></div>`;return;}
  el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const partidos=await fetchMisPartidos();
  if(!partidos.length){el.innerHTML=`<div class="empty"><span class="empty-icon">📋</span>Sin partidos aún<br><br><button class="btn b-am" onclick="goTab('perfil')">Registrar en Mi Perfil</button></div>`;return;}
  let h='<div class="card"><div class="card-t mb1">Mis partidos ('+partidos.length+')</div>';
  partidos.forEach(pt=>{const c=pt.resultado==='ganó'?'var(--ver)':pt.resultado==='empató'?'#f0a500':'var(--ro)';h+=`<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:14px;font-weight:700">vs ${escHtml(pt.rival)}</div><div style="font-size:11px;color:var(--muted)">${pt.fecha} · ${escHtml(pt.estadio)}</div></div><div style="font-family:var(--font-h);font-size:16px;color:${c}">${(pt.resultado||'').toUpperCase()}</div></div>`;});
  h+='</div>';el.innerHTML=h;
}

// ============================================================
//  LIGAS
// ============================================================
async function rLigas(){if(!currentUser){goTab('tabla');return;}lTab('mis');}
function lTab(t){document.querySelectorAll('#scr-ligas .itab').forEach((b,i)=>b.classList.toggle('on',['mis','crear','unirse'].indexOf(t)===i));['lt-mis','lt-crear','lt-unirse','lt-detalle'].forEach(id=>document.getElementById(id).style.display='none');if(t==='mis')rMisLigas();else document.getElementById('lt-'+t).style.display='block';}
async function rMisLigas(){
  const el=document.getElementById('lt-mis');el.style.display='block';el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const ligas=await fetchMisLigas();
  if(!ligas.length){el.innerHTML=`<div class="empty"><span class="empty-icon">👥</span>Sin ligas aún<br><br><button class="btn b-am" onclick="lTab('crear')" style="margin-right:8px">Crear</button><button class="btn b-ver" onclick="lTab('unirse')">Unirme</button></div>`;return;}
  el.innerHTML=ligas.map(l=>`<div class="liga-card" onclick="verLiga('${l.id}')"><div style="display:flex;justify-content:space-between;align-items:start;gap:12px"><div><div class="liga-n">${escHtml(l.nombre)}</div><div class="liga-m">Admin: ${escHtml(l.perfiles?.nombre||'?')}</div>${l.descripcion?`<div class="liga-m">${escHtml(l.descripcion)}</div>`:''}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><span class="badge ${l.privada?'b-am-bg':'b-ver-bg'}">${l.privada?'Privada':'Pública'}</span>${l.creador_id===currentUser?.id?'<span class="badge b-ver-bg">Admin</span>':''}</div></div><div style="text-align:center;flex-shrink:0"><div style="font-size:9px;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:4px">CÓDIGO</div><div class="cod">${l.codigo}</div></div></div></div>`).join('');
}
async function crearLiga(){
  if(!currentUser){openModal('modal-login');return;}
  const nombre=document.getElementById('l-nom').value.trim(),desc=document.getElementById('l-desc').value.trim(),privada=document.getElementById('l-priv').value==='1',msg=document.getElementById('crear-msg');
  if(!nombre){msg.innerHTML='<div class="alert a-err">Escribe un nombre</div>';return;}
  msg.innerHTML='<div class="alert a-load">Creando...</div>';
  const{liga,error}=await crearLigaDB(nombre,desc,privada);
  if(error){msg.innerHTML=`<div class="alert a-err">${error}</div>`;return;}
  msg.innerHTML=`<div class="alert a-ok">¡Liga creada! Código: <strong style="letter-spacing:3px;font-size:15px">${liga.codigo}</strong></div>`;
  document.getElementById('l-nom').value='';document.getElementById('l-desc').value='';setTimeout(()=>lTab('mis'),1800);
}
async function unirse(){
  if(!currentUser){openModal('modal-login');return;}
  const cod=document.getElementById('l-cod-inp').value.trim().toUpperCase(),msg=document.getElementById('unirse-msg');
  if(!cod){msg.innerHTML='<div class="alert a-err">Escribe el código</div>';return;}
  msg.innerHTML='<div class="alert a-load">Buscando...</div>';
  const{liga,error}=await unirseALigaDB(cod);
  if(error){msg.innerHTML=`<div class="alert a-err">${error}</div>`;return;}
  msg.innerHTML=`<div class="alert a-ok">¡Te uniste!</div>`;document.getElementById('l-cod-inp').value='';setTimeout(()=>lTab('mis'),1200);
}
async function verLiga(id){
  ['lt-mis','lt-crear','lt-unirse'].forEach(x=>document.getElementById(x).style.display='none');
  const det=document.getElementById('lt-detalle');det.style.display='block';det.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  ligaActiva=id;const liga=await fetchLigaDetalle(id);if(!liga){det.innerHTML='<div class="alert a-err">No encontrada</div>';return;}
  const cols=['var(--am)','#ccc','#cd7f32'],rev=stateProde.resultados?.revelado;
  const rankLiga=liga.miembros.map(m=>{const prode=stateProdeParticipantes.find(p=>p.userId===m.id);const r=calcPuntosProde(prode?.picks,prode?.marcadores,stateProde.resultados);return{...m,r,trofs:rev?calcTrofeos(r):[],sel:Object.keys(prode?.picks||{}).length};}).sort((a,b)=>b.r.pts-a.r.pts);
  det.innerHTML=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:1.25rem;flex-wrap:wrap"><button class="btn" onclick="lTab('mis')">← Volver</button><div><div style="font-family:var(--font-h);font-size:24px">${escHtml(liga.nombre)}</div><div style="font-size:11px;font-weight:700;color:var(--muted)">Código: <span class="cod" style="font-size:12px;padding:3px 10px">${liga.codigo}</span></div></div></div>
  <div class="card"><div class="card-hdr"><span class="card-t">Ranking J${stateProde.jornada}</span></div>${rankLiga.map((r,i)=>`<div class="rk-row"><span class="rk-num ${i<3?'rk'+(i+1):''}">${i+1}</span><div class="rk-info"><div class="rk-name">${escHtml(r.nombre)}${currentUser&&r.id===currentUser.id?' <span class="you-badge">(tú)</span>':''}</div><div class="rk-sub">${escHtml(r.equipo)} · ${r.sel}/8</div></div><div style="text-align:right"><div class="rk-pts" style="color:${i<3?cols[i]:'var(--am)'}">${rev?r.r.pts:'-'}</div></div></div>`).join('')}</div>
  <div class="card"><div class="card-t mb1">💬 Chat</div><div class="chat-box"><div class="chat-msgs" id="chat-msgs-${id}">${liga.chat.length===0?`<div style="text-align:center;padding:2rem;color:var(--muted);font-size:13px">¡Sé el primero!</div>`:''}${liga.chat.map(m=>{const esMio=currentUser&&m.username===currentUser.username,ini=(m.nombre||'?').slice(0,2).toUpperCase();return`<div class="msg-b ${esMio?'mio':''}"><div class="msg-av" style="width:28px;height:28px;font-size:10px;background:${m.avatarColor||'#FFD100'}">${ini}</div><div class="msg-c"><div class="msg-meta">${escHtml(m.nombre)} · ${m.ts}</div><div class="msg-txt">${escHtml(m.txt)}</div></div></div>`;}).join('')}</div><div class="chat-inp-row"><input class="chat-inp" id="chat-inp-${id}" placeholder="${currentUser?'Escribe...':'Inicia sesión para chatear'}" ${currentUser?'':'disabled'} onkeydown="if(event.key==='Enter')enviarChat('${id}')"/><button class="btn b-am" onclick="enviarChat('${id}')" ${currentUser?'':'disabled'}>Enviar</button></div></div></div>
  <div class="card"><div class="card-t mb1">👥 Miembros</div><div style="display:flex;flex-wrap:wrap;gap:8px">${liga.miembros.map(m=>`<div class="member-chip"><div class="av" style="width:26px;height:26px;font-size:10px;background:${m.avatar_color||strColor(m.id)}">${(m.nombre||'?').slice(0,2).toUpperCase()}</div><span style="font-size:13px;font-weight:700">${escHtml(m.nombre)}</span>${liga.creador_id===m.id?'<span style="color:var(--am)">★</span>':''}</div>`).join('')}</div></div>`;
  setTimeout(()=>{const cm=document.getElementById('chat-msgs-'+id);if(cm)cm.scrollTop=cm.scrollHeight;},100);
  if(chatPolling)clearInterval(chatPolling);chatPolling=setInterval(()=>refreshChat(id),10000);
}
async function refreshChat(ligaId){
  if(ligaActiva!==ligaId){clearInterval(chatPolling);return;}
  const liga=await fetchLigaDetalle(ligaId);if(!liga)return;
  const el=document.getElementById('chat-msgs-'+ligaId);if(!el){clearInterval(chatPolling);return;}
  const atBot=el.scrollTop+el.clientHeight>=el.scrollHeight-10;
  el.innerHTML=liga.chat.length===0?`<div style="text-align:center;padding:2rem;color:var(--muted);font-size:13px">¡Sé el primero!</div>`:liga.chat.map(m=>{const esMio=currentUser&&m.username===currentUser.username,ini=(m.nombre||'?').slice(0,2).toUpperCase();return`<div class="msg-b ${esMio?'mio':''}"><div class="msg-av" style="width:28px;height:28px;font-size:10px;background:${m.avatarColor||'#FFD100'}">${ini}</div><div class="msg-c"><div class="msg-meta">${escHtml(m.nombre)} · ${m.ts}</div><div class="msg-txt">${escHtml(m.txt)}</div></div></div>`;}).join('');
  if(atBot)el.scrollTop=el.scrollHeight;
}
async function enviarChat(ligaId){if(!currentUser)return;const inp=document.getElementById('chat-inp-'+ligaId);const txt=inp.value.trim();if(!txt)return;inp.value='';inp.disabled=true;await enviarMensajeChat(ligaId,txt);inp.disabled=false;inp.focus();await refreshChat(ligaId);}

// ============================================================
//  PERFIL
// ============================================================
async function rPerfil(){
  if(!currentUser){goTab('tabla');return;}
  const el=document.getElementById('perfil-content');el.innerHTML='<div class="empty"><span class="empty-icon" style="font-size:20px">⏳</span>Cargando...</div>';
  const partidos=await fetchMisPartidos(),s=calcStats(partidos),sl=getSalado(s.pct);
  const ini=currentUser.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2),col=currentUser.avatar_color||strColor(currentUser.id);
  const pr=calcPuntosProde(stateProde.picks,stateProde.marcadores,stateProde.resultados);
  el.innerHTML=`<div class="card">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:1.5rem;flex-wrap:wrap"><div class="av" style="width:56px;height:56px;font-size:20px;font-weight:900;background:${col}">${ini}</div><div><div style="font-family:var(--font-h);font-size:28px">${escHtml(currentUser.nombre)}</div><div style="font-size:12px;font-weight:700;color:var(--muted)">@${currentUser.username} · ${escHtml(currentUser.equipo)}</div></div></div>
    <div style="background:var(--panel);border-radius:12px;padding:1rem;margin-bottom:1rem;border-left:4px solid ${sl.c}"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:40px">${sl.e}</span><div><div style="font-family:var(--font-h);font-size:20px;color:${sl.c}">${sl.l}</div><div style="font-size:12px;color:var(--muted)">${s.pct}% victorias al estadio</div></div></div><div class="sal-bar"><div class="sal-fill" style="width:${s.pct}%;background:${s.pct>=50?'var(--ver)':'var(--ro)'}"></div></div></div>
    <div class="g4 mb1"><div class="met"><div class="met-v">${s.t}</div><div class="met-l">Partidos</div></div><div class="met"><div class="met-v" style="color:var(--ver)">${s.g}</div><div class="met-l">Victorias</div></div><div class="met"><div class="met-v" style="color:#f0a500">${s.e}</div><div class="met-l">Empates</div></div><div class="met"><div class="met-v" style="color:var(--ro)">${s.pe}</div><div class="met-l">Derrotas</div></div></div>
    ${partidos.length>0?`<div style="margin-bottom:1rem"><div class="sec-lbl">Última racha</div><div style="display:flex;gap:5px;flex-wrap:wrap">${partidos.slice(0,12).map(pt=>{const c=pt.resultado==='ganó'?'var(--ver)':pt.resultado==='empató'?'#f0a500':'var(--ro)';return`<div class="racha-dot" style="background:${c};color:#000">${(pt.resultado||'?')[0].toUpperCase()}</div>`;}).join('')}</div></div>`:''}
    <div style="background:var(--panel);border-radius:12px;padding:1rem;margin-bottom:1rem"><div class="sec-lbl mb1">Prode J${stateProde.jornada}</div><div class="g3"><div style="text-align:center"><div style="font-family:var(--font-h);font-size:26px">${Object.keys(stateProde.picks).length}/8</div><div style="font-size:10px;font-weight:800;color:var(--muted)">Pronósticos</div></div><div style="text-align:center"><div style="font-family:var(--font-h);font-size:26px;color:var(--am)">${stateProde.resultados?.revelado?pr.pts:'-'}</div><div style="font-size:10px;font-weight:800;color:var(--muted)">Puntos</div></div><div style="text-align:center"><div style="font-family:var(--font-h);font-size:26px;color:var(--na)">${stateProde.resultados?.revelado?pr.exactos:'-'}</div><div style="font-size:10px;font-weight:800;color:var(--muted)">Exactos</div></div></div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem"><button class="btn b-am" onclick="toggleForm()">Registrar partido</button><button class="btn b-outline" onclick="pedirVeredicto()">Veredicto IA ↗</button></div>
    <div id="veredicto-box"></div>
  </div>
  <div class="card" id="form-reg" style="display:none">
    <div class="card-t mb1">Registrar partido</div><div id="rp-msg"></div>
    <div class="g2"><div class="field"><label>Fecha</label><input type="date" id="p-f"/></div><div class="field"><label>Rival</label><input id="p-r" placeholder="Ej: Barcelona SC"/></div></div>
    <div class="g2">
      <div class="field"><label>Estadio</label><select id="p-e"><option value="">Seleccionar...</option><option>Monumental de Barcelona</option><option>Capwell (Emelec)</option><option>Casa Blanca (LDU)</option><option>Rodrigo Paz Delgado</option><option>Olímpico Atahualpa</option><option>Jocay (Manta)</option><option>Bellavista (Ambato)</option><option>Ciudad de Loja</option><option>Reales Tamarindos</option><option>Banco Pichincha</option><option>Modelo (Guayaquil)</option><option>Otro estadio</option></select></div>
      <div class="field"><label>Resultado</label><select id="p-res"><option value="">¿Qué pasó?</option><option value="ganó">Mi equipo ganó 🎉</option><option value="empató">Empató 😐</option><option value="perdió">Perdió 😭</option></select></div>
    </div>
    <div class="g2"><div class="field"><label>Marcador</label><input id="p-g" placeholder="2-1"/></div><div class="field"><label>Nota</label><input id="p-n" placeholder="Fui con mi papá..."/></div></div>
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
  if(error){msg.innerHTML=`<div class="alert a-err">${error}</div>`;return;}
  msg.innerHTML='<div class="alert a-ok">¡Partido registrado!</div>';setTimeout(()=>{toggleForm();rPerfil();},1000);
}
async function pedirVeredicto(){
  const partidos=await fetchMisPartidos(),s=calcStats(partidos),box=document.getElementById('veredicto-box');if(!box)return;
  box.innerHTML='<div class="alert a-load">Analizando tu karma...</div>';
  const hist=partidos.slice(0,10).map(p=>`vs ${p.rival} → ${p.resultado}`).join(', ')||'Sin partidos';
  try{const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,messages:[{role:'user',content:`Eres un comentarista deportivo ecuatoriano muy gracioso. ${currentUser.nombre}, hincha de ${currentUser.equipo}, fue a ${s.t} partidos: ganó ${s.g}, empató ${s.e}, perdió ${s.pe} (${s.pct}% victorias). Historial: ${hist}. Veredicto dramático en jerga ecuatoriana. Máximo 90 palabras.`}]})});const d=await resp.json();box.innerHTML=`<div style="background:var(--panel);border:1px solid var(--border);border-left:4px solid var(--am);border-radius:12px;padding:1rem"><div style="font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--am);margin-bottom:8px">Veredicto IA</div><div style="font-size:13px;line-height:1.6">${d.content?.[0]?.text||'Sin respuesta'}</div></div>`;}
  catch(e){box.innerHTML='<div class="alert a-err">No se pudo conectar</div>';}
}
