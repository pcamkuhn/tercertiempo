# 🚀 GUÍA DE DESPLIEGUE — TercerTiempo

## PASO 1 — Crear base de datos en Supabase (10 min, gratis)

1. Ve a **https://supabase.com** → "Start your project"
2. Crea una cuenta (puede ser con GitHub o Google)
3. Click en **"New project"**
   - Organization: personal
   - Name: `tercertiempo`
   - Database Password: escribe una contraseña segura (guárdala)
   - Region: **South America (São Paulo)** — más rápido desde Ecuador
4. Espera ~2 minutos mientras crea el proyecto
5. Ve a **Settings → API**:
   - Copia el **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - Copia el **anon / public key** (empieza con `eyJ...`)
6. Ve a **SQL Editor → New query**
7. Pega TODO el contenido de `database/schema.sql` y click **Run**
8. Verás "Success" si todo salió bien

---

## PASO 2 — Configurar la app

Abre el archivo `js/config.js` y reemplaza:

```javascript
SUPABASE_URL: 'https://TU_PROYECTO.supabase.co',       // ← tu Project URL
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsIn...',        // ← tu anon key
```

---

## PASO 3 — Subir a GitHub (5 min)

1. Crea cuenta en **https://github.com** si no tienes
2. Click en **"New repository"** → nombre: `tercertiempo` → Public → Create
3. Sube los archivos (opción fácil: arrastrar todos a la página del repo)
   - O desde terminal: `git init && git add . && git commit -m "init" && git remote add origin TU_URL && git push`

---

## PASO 4 — Desplegar en Vercel (5 min, gratis)

1. Ve a **https://vercel.com** → "Sign up" con tu cuenta de GitHub
2. Click en **"Add New Project"**
3. Importa tu repositorio `tercertiempo`
4. Vercel lo detecta como sitio estático automáticamente
5. Click **Deploy**
6. En ~1 minuto tienes tu URL: `https://tercertiempo.vercel.app`

---

## PASO 5 — Dominio propio (opcional)

En Vercel: **Settings → Domains → Add**
- Compra `tercertiempo.com` en GoDaddy, Namecheap, etc. (~$12/año)
- Vercel te da las instrucciones DNS

---

## CADA SEMANA — Actualizar jornada y resultados

### Actualizar fixture (antes de la jornada):
En `js/api.js`, edita `FIXTURE_ACTUAL` con los partidos de la nueva jornada.
En `js/config.js`, actualiza `JORNADA_ACTUAL`.

### Ingresar resultados (después de la jornada):
En Supabase → **Table Editor → resultados_jornadas → Insert row**:
```json
{
  "jornada": 13,
  "resultados": {"f1":"1","f2":"x","f3":"2","f4":"1","f5":"x","f6":"1","f7":"2","f8":"1"},
  "marcadores": {"f1":"2-1","f2":"1-1","f3":"0-2","f4":"3-0","f5":"0-0","f6":"1-0","f7":"0-1","f8":"2-0"},
  "revelado": true
}
```

---

## DATOS EN VIVO con Flashscore (avanzado)

Flashscore no tiene API pública oficial. Opciones:

### Opción A — football-data.org (recomendada, gratis):
1. Regístrate en https://www.football-data.org/
2. Obtén tu API key gratuita
3. En `js/config.js`:
   ```javascript
   USE_LIVE_DATA: true,
   FOOTBALL_DATA_KEY: 'tu_api_key',
   ```
4. Descomenta el código de football-data.org en `js/api.js`
   - **Nota**: La LigaPro Ecuador está disponible en el plan gratuito

### Opción B — Cloudflare Worker (intermedio):
Crea un worker que consulte Flashscore cada 30 min y guarde en Supabase.
Código del worker disponible en: `/workers/flashscore-worker.js`

---

## COSTOS

| Servicio | Plan | Costo |
|----------|------|-------|
| Supabase | Free (500MB, 50k usuarios) | $0 |
| Vercel | Hobby (100GB bandwidth) | $0 |
| Dominio .com | Anual | ~$12/año |
| football-data.org | Free tier | $0 |
| **Total mínimo** | | **$0/mes** |

---

## SOPORTE

Para dudas técnicas puedes consultar:
- Documentación Supabase: https://supabase.com/docs
- Documentación Vercel: https://vercel.com/docs
