// ============================================================
//  AUTH.JS — TercerTiempo
// ============================================================

let supabase = null;
let currentUser = null;
let supabaseActivo = false;

function initSupabase() {
  // Si las credenciales son las de plantilla, la app funciona en modo demo
  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('TU_PROYECTO')) {
    console.warn('Supabase no configurado — modo demo activo');
    supabaseActivo = false;
    return true; // ← no bloquear la app
  }
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase SDK no cargado');
    supabaseActivo = false;
    return true;
  }
  try {
    supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    supabaseActivo = true;
    return true;
  } catch(e) {
    console.error('Error al conectar Supabase:', e);
    supabaseActivo = false;
    return true;
  }
}

async function doRegister() {
  if (!supabaseActivo) { showMsg(document.getElementById('rmsg'),'err','Configura las credenciales de Supabase primero'); return; }
  const nombre = document.getElementById('r-n').value.trim();
  const username = document.getElementById('r-u').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  const email = document.getElementById('r-e').value.trim().toLowerCase();
  const pass = document.getElementById('r-p').value;
  const equipo = document.getElementById('r-eq').value;
  const msgEl = document.getElementById('rmsg');
  if (!nombre||!username||!email||!pass||!equipo){showMsg(msgEl,'err','Completa todos los campos');return;}
  if (pass.length<6){showMsg(msgEl,'err','La contraseña debe tener al menos 6 caracteres');return;}
  if (username.length<3){showMsg(msgEl,'err','El usuario debe tener al menos 3 caracteres');return;}
  showMsg(msgEl,'load','Creando cuenta...');
  const{data:existing}=await supabase.from('perfiles').select('username').eq('username',username).single();
  if(existing){showMsg(msgEl,'err','Ese nombre de usuario ya está en uso');return;}
  const{data:authData,error:authError}=await supabase.auth.signUp({email,password:pass,options:{data:{nombre,username,equipo}}});
  if(authError){showMsg(msgEl,'err',tradError(authError.message));return;}
  if(authData.user){
    const color=strColor(authData.user.id);
    await supabase.from('perfiles').insert({id:authData.user.id,nombre,username,equipo,avatar_color:color});
    currentUser={id:authData.user.id,email,nombre,username,equipo,avatar_color:color};
    closeModal('modal-register');
    onLogin();
    showMsg(msgEl,'','');
  }
}

async function doLogin() {
  if (!supabaseActivo) { showMsg(document.getElementById('lmsg'),'err','Configura las credenciales de Supabase primero'); return; }
  const emailOrUser=document.getElementById('l-u').value.trim().toLowerCase();
  const pass=document.getElementById('l-p').value;
  const msgEl=document.getElementById('lmsg');
  if(!emailOrUser||!pass){showMsg(msgEl,'err','Completa todos los campos');return;}
  showMsg(msgEl,'load','Iniciando sesión...');
  let loginEmail=emailOrUser;
  if(!emailOrUser.includes('@')){
    const{data:perfil}=await supabase.from('perfiles').select('id').eq('username',emailOrUser).single();
    if(!perfil){showMsg(msgEl,'err','Usuario no encontrado');return;}
    const{data:emailData}=await supabase.rpc('get_email_by_id',{user_id:perfil.id});
    if(!emailData){showMsg(msgEl,'err','No se pudo resolver el usuario');return;}
    loginEmail=emailData;
  }
  const{data,error}=await supabase.auth.signInWithPassword({email:loginEmail,password:pass});
  if(error){showMsg(msgEl,'err',tradError(error.message));return;}
  await loadPerfil(data.user.id);
  closeModal('modal-login');
  onLogin();
  showMsg(msgEl,'','');
}

async function doLogout() {
  if(supabase) await supabase.auth.signOut();
  currentUser=null;
  onLogout();
}

async function loadPerfil(userId) {
  if(!supabase) return;
  const{data}=await supabase.from('perfiles').select('*').eq('id',userId).single();
  if(data) currentUser=data;
}

async function checkSession() {
  if(!supabase||!supabaseActivo) return;
  const{data:{session}}=await supabase.auth.getSession();
  if(session?.user){await loadPerfil(session.user.id);onLogin();}
  else{onLogout();}
}

function onLogin() {
  const ini=currentUser.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const col=currentUser.avatar_color||strColor(currentUser.id||currentUser.username);
  document.getElementById('user-btn-area').innerHTML=`
    <div class="user-chip">
      <div class="av" style="width:34px;height:34px;font-size:13px;font-weight:900;background:${col}">${ini}</div>
      <div><div class="chip-name">${currentUser.nombre}</div><div class="chip-team">${currentUser.equipo}</div></div>
      <button class="x-btn" onclick="doLogout()" title="Cerrar sesión">✕</button>
    </div>`;
  document.querySelectorAll('.ntab.auth-required').forEach(t=>t.classList.add('unlocked'));
  document.getElementById('auth-banner').style.display='none';
  const activeScr=document.querySelector('.scr.on')?.id?.replace('scr-','');
  if(['prode','ligas','historial','perfil'].includes(activeScr)){
    const renderers={prode:rProde,ligas:rLigas,historial:rHinchas,perfil:rPerfil};
    renderers[activeScr]?.();
  }
}

function onLogout() {
  document.getElementById('user-btn-area').innerHTML=`
    <button class="btn b-am" onclick="openModal('modal-login')">Iniciar sesión</button>
    <button class="btn b-outline" onclick="openModal('modal-register')">Registrarse</button>`;
  document.querySelectorAll('.ntab.auth-required').forEach(t=>t.classList.remove('unlocked'));
  document.getElementById('auth-banner').style.display='flex';
  const activeScr=document.querySelector('.scr.on')?.id?.replace('scr-','');
  if(['ligas','perfil'].includes(activeScr)) goTab('tabla');
}

function showMsg(el,type,msg){if(!el)return;if(!msg){el.innerHTML='';return;}const cls=type==='err'?'a-err':type==='load'?'a-load':'a-ok';el.innerHTML=`<div class="alert ${cls}">${msg}</div>`;}
function tradError(msg){if(msg.includes('Invalid login'))return 'Email o contraseña incorrectos';if(msg.includes('Email already'))return 'Ese email ya está registrado';if(msg.includes('Password should'))return 'La contraseña debe tener al menos 6 caracteres';return msg;}
function strColor(s){const cols=['#FFD100','#EF3340','#003DA5','#00C96E','#FF7B1C','#9B59B6','#1ABC9C','#E74C3C','#3498DB','#E67E22'];let hash=0;for(let i=0;i<(s||'').length;i++)hash=s.charCodeAt(i)+((hash<<5)-hash);return cols[Math.abs(hash)%cols.length];}
function openModal(id){const m=document.getElementById(id);if(m)m.style.display='flex';}
function closeModal(id){const m=document.getElementById(id);if(m)m.style.display='none';}
function overlayClose(e,id){if(e.target.classList.contains('modal-overlay'))closeModal(id);}
