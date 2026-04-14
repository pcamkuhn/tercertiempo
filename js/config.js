// ============================================================
//  CONFIGURACIÓN — Llena estos valores con los tuyos
//  Guía paso a paso al final del archivo
// ============================================================

const CONFIG = {

  // --- SUPABASE ---
  // Obtén estos en: supabase.com → tu proyecto → Settings → API
  SUPABASE_URL: 'https://upuimmozwczajuxnsgoi.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdWltbW96d2N6YWp1eG5zZ29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzEzMTQsImV4cCI6MjA5MTcwNzMxNH0.QKDmbwXSB5djbavS5T-U3z6aIxcw8akNwi4771Z0dF8',  // tu anon/public key

  // --- FLASHSCORE / RESULTADOS ---
  // Usamos un proxy CORS para obtener datos de Flashscore
  // Opción A (gratis): allorigins.win actúa de proxy
  // Opción B (recomendada): despliega tu propio worker en Cloudflare (ver DEPLOY.md)
  USE_LIVE_DATA: false,          // Cambia a true cuando tengas el proxy listo
  FLASHSCORE_PROXY: 'https://api.allorigins.win/get?url=',
  FLASHSCORE_LEAGUE_URL: 'https://www.flashscore.com/football/ecuador/ligapro/',

  // --- JORNADA ACTUAL ---
  // Actualiza este número cada semana
  JORNADA_ACTUAL: 9,

  // URL final de la app
  APP_URL: 'https://tercertiempo.vercel.app',

  // --- APP ---
  APP_NAME: 'TercerTiempo',
};

// ============================================================
//  GUÍA RÁPIDA DE INSTALACIÓN
// ============================================================
//
//  1. SUPABASE (gratis, 500MB):
//     a. Ve a supabase.com → "Start your project" → crea cuenta
//     b. Crea nuevo proyecto (anota la contraseña)
//     c. Ve a Settings → API → copia URL y anon key
//     d. Ve a SQL Editor y ejecuta el contenido de: database/schema.sql
//     e. Pega URL y key arriba ↑
//
//  2. DESPLIEGUE EN VERCEL (gratis):
//     a. Sube esta carpeta a GitHub
//     b. Ve a vercel.com → "Import Project" → selecciona el repo
//     c. Click Deploy → listo, tienes tu URL .vercel.app
//
//  3. DOMINIO PROPIO (opcional):
//     - En Vercel: Settings → Domains → agrega tu dominio
//
//  4. DATOS EN VIVO (opcional, más avanzado):
//     - Ver DEPLOY.md para configurar el worker de Cloudflare
//       que obtiene datos de Flashscore cada 30 minutos
//
// ============================================================
