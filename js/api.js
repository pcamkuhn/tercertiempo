// ============================================================
//  API.JS — Datos reales LigaPro 2026 · Fecha 8 · 13 Abril
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
  {pos:13, eq:"Orense SC",               pj:8,g:2,e:2,p:4,gf:11,gc:14, pts:8, col:"#FFD700"},
  {pos:14, eq:"Leones FC",               pj:8,g:1,e:4,p:3,gf:4, gc:9,  pts:7, col:"#996633"},
  {pos:15, eq:"Emelec",                  pj:8,g:2,e:2,p:4,gf:6, gc:10, pts:5, col:"#0066CC",nota:"*"},
  {pos:16, eq:"Manta FC",                pj:8,g:1,e:1,p:6,gf:2, gc:9,  pts:4, col:"#009966"},
];

const STATS_FALLBACK = {
  goleadores: [
    {n:"Alexis Zapata",      eq:"U. Católica",           g:5},
    {n:"Ángelo Preciado",    eq:"Independiente del Valle",g:4},
    {n:"Jonatan Álvez",      eq:"Barcelona SC",           g:4},
    {n:"Washington Corozo",  eq:"Aucas",                  g:3},
    {n:"Danny Cabezas",      eq:"Dep. Cuenca",            g:3},
    {n:"Ariel Nahuelpan",    eq:"Delfín SC",              g:3},
    {n:"Jhon Sánchez",       eq:"Orense SC",              g:3},
    {n:"Bryan Angulo",       eq:"Técnico Univ.",          g:3},
  ],
  asistencias: [
    {n:"Erick Castillo",     eq:"U. Católica",            a:4},
    {n:"Cristian Pellerano", eq:"Independiente del Valle",a:3},
    {n:"Gonzalo Plata",      eq:"Barcelona SC",           a:3},
    {n:"Jhojan Julio",       eq:"Aucas",                  a:2},
    {n:"Adonis Preciado",    eq:"Libertad FC",            a:2},
    {n:"Matías Fernández",   eq:"Liga de Quito",          a:2},
  ],
  resumen:{ goles:95, jornadas:8, promedio:2.97, locales:44 }
};

// Fixture Fecha 9 — semana 18-20 Abril 2026
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

async function fetchTablaLive(){ return null; }

async function fetchTabla(){
  const loading=document.getElementById('tabla-loading');
  if(loading)loading.classList.add('active');
  renderTabla(TABLA_FALLBACK);
  if(loading)loading.classList.remove('active');
  const chip=document.getElementById('tabla-update');
  if(chip)chip.textContent='Fecha 8 · 13 Abr 2026';
}

async function guardarPronostico(jornada,picks,marcadores){
  if(!currentUser||!supabase)return{error:'No autenticado'};
  const{error}=await supabase.from('pronosticos').upsert({
    user_id:currentUser.id,jornada,
    picks:JSON.stringify(picks),marcadores:JSON.stringify(marcadores),
    updated_at:new Date().toISOString()
  },{onConflict:'user_id,jornada'});
  return{error};
}

async function fetchPronosticosJornada(jornada){
  if(!supabase)return[];
  const{data}=await supabase.from('pronosticos')
    .select(`user_id,picks,marcadores,perfiles(nombre,username,equipo,avatar_color)`)
    .eq('jornada',jornada);
  return(data||[]).map(d=>({
    userId:d.user_id,nombre:d.perfiles?.nombre||'Anónimo',username:d.perfiles?.username||'',
    equipo:d.perfiles?.equipo||'',avatarColor:d.perfiles?.avatar_color||'#FFD100',
    picks:safeJSON(d.picks),marcadores:safeJSON(d.marcadores),
  }));
}

async function fetchMisPronosticos(jornada){
  if(!currentUser||!supabase)return{picks:{},marcadores:{}};
  const{data}=await supabase.from('pronosticos').select('picks,marcadores')
    .eq('user_id',currentUser.id).eq('jornada',jornada).single();
  return{picks:safeJSON(data?.picks),marcadores:safeJSON(data?.marcadores)};
}

async function fetchMisLigas(){
  if(!currentUser||!supabase)return[];
  const{data}=await supabase.from('liga_miembros')
    .select(`ligas(id,nombre,descripcion,privada,codigo,creador_id,perfiles!ligas_creador_id_fkey(nombre))`)
    .eq('user_id',currentUser.id);
  return(data||[]).map(d=>d.ligas).filter(Boolean);
}

async function fetchLigaDetalle(ligaId){
  if(!supabase)return null;
  const{data:liga}=await supabase.from('ligas').select(`*,perfiles!ligas_creador_id_fkey(nombre,username)`).eq('id',ligaId).single();
  const{data:miembros}=await supabase.from('liga_miembros').select(`perfiles(id,nombre,username,equipo,avatar_color)`).eq('liga_id',ligaId);
  const{data:chat}=await supabase.from('liga_chat').select(`mensaje,created_at,perfiles(nombre,username,avatar_color)`).eq('liga_id',ligaId).order('created_at',{ascending:true}).limit(50);
  return{
    ...liga,
    miembros:(miembros||[]).map(m=>m.perfiles),
    chat:(chat||[]).map(c=>({txt:c.mensaje,ts:new Date(c.created_at).toLocaleTimeString('es-EC',{hour:'2-digit',minute:'2-digit'}),nombre:c.perfiles?.nombre,username:c.perfiles?.username,avatarColor:c.perfiles?.avatar_color})),
  };
}

async function crearLigaDB(nombre,descripcion,privada){
  if(!currentUser||!supabase)return{error:'No autenticado'};
  const codigo=Math.random().toString(36).substr(2,6).toUpperCase();
  const{data:liga,error}=await supabase.from('ligas').insert({nombre,descripcion,privada,codigo,creador_id:currentUser.id}).select().single();
  if(error)return{error};
  await supabase.from('liga_miembros').insert({liga_id:liga.id,user_id:currentUser.id});
  return{liga};
}

async function unirseALigaDB(codigo){
  if(!currentUser||!supabase)return{error:'No autenticado'};
  const{data:liga}=await supabase.from('ligas').select('id,nombre').eq('codigo',codigo.toUpperCase()).single();
  if(!liga)return{error:'Código no válido'};
  const{data:ex}=await supabase.from('liga_miembros').select('id').eq('liga_id',liga.id).eq('user_id',currentUser.id).single();
  if(ex)return{error:'Ya eres miembro de esta liga'};
  const{error}=await supabase.from('liga_miembros').insert({liga_id:liga.id,user_id:currentUser.id});
  if(error)return{error:error.message};
  return{liga};
}

async function enviarMensajeChat(ligaId,mensaje){
  if(!currentUser||!supabase)return;
  await supabase.from('liga_chat').insert({liga_id:ligaId,user_id:currentUser.id,mensaje});
}

async function fetchMisPartidos(){
  if(!currentUser||!supabase)return[];
  const{data}=await supabase.from('partidos').select('*').eq('user_id',currentUser.id).order('fecha',{ascending:false});
  return data||[];
}

async function fetchTodosUsuarios(){
  if(!supabase)return[];
  const{data}=await supabase.from('perfiles').select('id,nombre,username,equipo,avatar_color').order('nombre');
  return data||[];
}

async function fetchEstadisticasUsuario(userId){
  if(!supabase)return[];
  const{data}=await supabase.from('partidos').select('*').eq('user_id',userId).order('fecha',{ascending:false});
  return data||[];
}

async function guardarPartidoDB(partido){
  if(!currentUser||!supabase)return{error:'No autenticado'};
  const{error}=await supabase.from('partidos').insert({user_id:currentUser.id,...partido});
  return{error};
}

async function fetchResultadosJornada(jornada){
  if(!supabase)return null;
  const{data}=await supabase.from('resultados_jornadas').select('*').eq('jornada',jornada).single();
  if(data)return{res:safeJSON(data.resultados),marc:safeJSON(data.marcadores),revelado:data.revelado};
  if(RESULTADOS_JORNADAS[jornada])return{...RESULTADOS_JORNADAS[jornada],revelado:true};
  return null;
}

function safeJSON(str){if(!str)return{};if(typeof str==='object')return str;try{return JSON.parse(str);}catch{return{};}}

function calcPuntosProde(picks,marcadores,resultados){
  if(!resultados?.res)return{pts:0,aciertos:0,exactos:0};
  let pts=0,aciertos=0,exactos=0;
  Object.keys(resultados.res).forEach(fid=>{
    const marc=marcadores?.[fid],marcReal=resultados.marc?.[fid];
    if(marc&&marc===marcReal){pts+=3;exactos++;}
    else if(picks?.[fid]&&picks[fid]===resultados.res[fid]){pts+=1;aciertos++;}
  });
  return{pts,aciertos,exactos};
}

function calcStats(partidos){
  const t=partidos.length,g=partidos.filter(p=>p.resultado==='ganó').length,e=partidos.filter(p=>p.resultado==='empató').length,pe=partidos.filter(p=>p.resultado==='perdió').length;
  return{t,g,e,pe,pts:g*3+e,pct:t>0?Math.round(g/t*100):0};
}

function getSalado(pct){
  if(pct>=70)return{e:'🍀',l:'¡ERES DE BUENA SUERTE!',c:'var(--ver)'};
  if(pct>=50)return{e:'😊',l:'BASTANTE SUERTUDO',c:'#85c720'};
  if(pct>=35)return{e:'😐',l:'SUERTE NORMAL',c:'#f0a500'};
  if(pct>=20)return{e:'😬',l:'ALGO SALADO...',c:'var(--na)'};
  return{e:'💀',l:'SALADÍSIMO — QUÉDATE EN CASA',c:'var(--ro)'};
}

const TROFEOS_DEF=[
  {id:'goleador',icon:'⚽',lbl:'Goleador de la jornada',cond:r=>r.pts>=6},
  {id:'preciso', icon:'🎯',lbl:'Precisión de reloj',    cond:r=>r.exactos>=3},
  {id:'perfecto',icon:'🌟',lbl:'Jornada perfecta',      cond:r=>r.aciertos===8||r.exactos===8},
  {id:'saladoec',icon:'💀',lbl:'Salado EC',             cond:r=>r.pts===0},
];
function calcTrofeos(pts){return TROFEOS_DEF.filter(t=>t.cond(pts)).map(t=>t.id);}
