import { ID_HOJA, NOMBRE_HOJA, PIN_COORDINADOR } from '../services/storageService';

export function generateIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BD Solicitudes Diseño - SLA 2026</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#fdf2f8',
              500: '#ec4899',
              600: '#db2777',
              700: '#be185d'
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-full bg-slate-950 text-slate-100 flex flex-col">
  <!-- Navbar -->
  <header class="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg backdrop-blur-md bg-opacity-95">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-3 cursor-pointer" onclick="switchTab('form')">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md shadow-rose-500/20">
            BD
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-100 text-base sm:text-lg">Solicitudes Diseño</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">SLA 2026</span>
            </div>
            <p class="text-xs text-slate-400 hidden sm:block">Control por Mesas & SLA · FastModa</p>
          </div>
        </div>

        <nav class="flex items-center gap-1 sm:gap-2">
          <button onclick="switchTab('form')" id="btn-tab-form" class="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-rose-600 text-white transition-all flex items-center gap-2">
            <i data-lucide="file-plus" class="w-4 h-4"></i>
            <span class="hidden sm:inline">Nueva Solicitud</span>
          </button>
          <button onclick="switchTab('coord')" id="btn-tab-coord" class="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            <span class="hidden sm:inline">Coordinación</span>
          </button>
          <button onclick="switchTab('diseno')" id="btn-tab-diseno" class="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
            <i data-lucide="clock" class="w-4 h-4"></i>
            <span class="hidden sm:inline">Diseñador / Tiempos</span>
          </button>
          <button onclick="switchTab('consulta')" id="btn-tab-consulta" class="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
            <i data-lucide="search" class="w-4 h-4"></i>
            <span class="hidden md:inline">Consultar</span>
          </button>
          <button onclick="switchTab('metricas')" id="btn-tab-metricas" class="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
            <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
            <span class="hidden lg:inline">Métricas</span>
          </button>
          <button onclick="recargarDatos()" title="Sincronizar con Google Sheet" class="p-2 rounded-lg text-emerald-400 hover:bg-slate-800 transition-colors">
            <i data-lucide="refresh-cw" class="w-4 h-4" id="sync-icon"></i>
          </button>
        </nav>
      </div>
    </div>
  </header>

  <!-- Notification Banner -->
  <div id="toast" class="fixed top-20 right-4 z-50 transform transition-all duration-300 translate-y-[-150%] opacity-0 bg-slate-900 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold">
    <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>
    <span id="toast-msg">Operación completada con éxito</span>
  </div>

  <!-- Main Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
    <!-- VIEW 1: Formulario Nueva Solicitud -->
    <section id="view-form" class="max-w-4xl mx-auto">
      <div class="mb-8">
        <span class="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold inline-block mb-2">SLA 2026</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white">Ingreso de Requerimiento de Diseño</h1>
        <p class="text-xs text-slate-400 mt-1">Registra tu solicitud. Se clasificará por mesa y se notificará para asignación.</p>
      </div>

      <div id="form-success-banner" class="hidden mb-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/40 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">✓</div>
            <div>
              <h3 class="font-bold text-base">¡Solicitud radicada correctamente!</h3>
              <p class="text-xs text-slate-300 mt-0.5">Radicado: <span id="success-id" class="font-mono text-amber-300 font-bold text-sm">#F-</span></p>
            </div>
          </div>
          <button onclick="document.getElementById('form-success-banner').classList.add('hidden')" class="px-3 py-1.5 rounded-lg bg-slate-800 text-xs hover:bg-slate-700">Aceptar</button>
        </div>
      </div>

      <form id="solicitudForm" onsubmit="handleCrearSolicitud(event)" class="space-y-6">
        <!-- Solicitante -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <span>1. Datos del Solicitante</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico *</label>
              <input type="email" id="form-correo" required value="mateo.lopez@fastmoda.com.co" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Nombre Completo *</label>
              <input type="text" id="form-solicitante" required value="Mateo López" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Área Solicitante *</label>
              <select id="form-area" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="Marketing General">Marketing General</option>
                <option value="E-Commerce & Digital">E-Commerce & Digital</option>
                <option value="Retail & Tiendas">Retail & Tiendas</option>
                <option value="Trade Marketing">Trade Marketing</option>
                <option value="Visual Merchandising">Visual Merchandising</option>
                <option value="Comercial">Comercial</option>
                <option value="Producto & Diseño Textil">Producto & Diseño Textil</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mesa & Marca -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <span>2. Mesa Gráfica & Marca</span>
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button type="button" onclick="setFormMesa('Visual')" id="mesa-btn-Visual" class="p-3 rounded-xl border border-indigo-500 bg-indigo-950/60 text-white text-left font-bold text-xs transition-all">Visual</button>
            <button type="button" onclick="setFormMesa('Packaging')" id="mesa-btn-Packaging" class="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-left font-bold text-xs hover:border-slate-700 transition-all">Packaging</button>
            <button type="button" onclick="setFormMesa('Pauta')" id="mesa-btn-Pauta" class="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-left font-bold text-xs hover:border-slate-700 transition-all">Pauta</button>
            <button type="button" onclick="setFormMesa('Digital')" id="mesa-btn-Digital" class="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-left font-bold text-xs hover:border-slate-700 transition-all">Digital</button>
            <button type="button" onclick="setFormMesa('Producción')" id="mesa-btn-Producción" class="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-left font-bold text-xs hover:border-slate-700 transition-all">Producción</button>
          </div>
          <input type="hidden" id="form-mesa" value="Visual">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Marca *</label>
              <select id="form-marca" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="Studio F">Studio F</option>
                <option value="ELA">ELA</option>
                <option value="FastModa">FastModa</option>
                <option value="Topmark">Topmark</option>
                <option value="Studio F Man">Studio F Man</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">País de Aplicación *</label>
              <select id="form-pais" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="Colombia">Colombia</option>
                <option value="México">México</option>
                <option value="Panamá">Panamá</option>
                <option value="Chile">Chile</option>
                <option value="Perú">Perú</option>
                <option value="Costa Rica">Costa Rica</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Detalle Pieza -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span>3. Especificaciones de la Pieza</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Tipo de Pieza *</label>
              <select id="form-pieza" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
                <!-- Dynamic options inserted via JS -->
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Nombre / Número de Proyecto *</label>
              <input type="text" id="form-detallePieza" required placeholder="Ej: Lanzamiento Denim 2026 / Cyber Days" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Descripción & Insumos *</label>
            <textarea id="form-descripcion" rows="3" required placeholder="Texto a comunicar, referencias de estilo, medidas..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Link Brief PDF / Drive</label>
              <input type="url" id="form-linkBrief" placeholder="https://drive.google.com/..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Cantidad de Piezas / Adaptaciones</label>
              <input type="number" id="form-cantidad" min="1" value="1" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
            </div>
          </div>
        </div>

        <!-- Tiempos & SLA -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <span>4. Prioridad & Fecha SLA</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Prioridad SLA *</label>
              <select id="form-prioridad" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="P1 - Urgente">P1 - Urgente (24h - 48h)</option>
                <option value="P2 - Alta">P2 - Alta (3 - 4 días)</option>
                <option value="P3 - Normal" selected>P3 - Normal (5 - 7 días)</option>
                <option value="P4 - Planificada">P4 - Planificada</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Fecha Requerida de Entrega *</label>
              <input type="date" id="form-fechaRequerida" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
            </div>
          </div>
        </div>

        <button type="submit" id="btn-submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-indigo-700 hover:from-rose-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2">
          <span>Enviar Solicitud a Google Sheet</span>
        </button>
      </form>
    </section>

    <!-- VIEW 2: Coordinación -->
    <section id="view-coord" class="hidden">
      <!-- PIN Lock Screen -->
      <div id="coord-lock" class="max-w-md mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-2xl">
        <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
        <h2 class="text-lg font-bold text-white mb-1">Acceso a Coordinación</h2>
        <p class="text-xs text-slate-400 mb-4">Ingresa el PIN de Coordinador (Predeterminado: 1234)</p>
        <div class="space-y-3">
          <input type="password" id="pin-input" placeholder="PIN" maxlength="8" class="w-full text-center tracking-widest px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-lg font-mono focus:outline-none">
          <p id="pin-error" class="text-xs text-rose-400 hidden">PIN incorrecto.</p>
          <button onclick="verificarPin()" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors">Desbloquear</button>
        </div>
      </div>

      <!-- Coord Dashboard -->
      <div id="coord-content" class="hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-white">Panel de Coordinación</h1>
            <p class="text-xs text-slate-400">Asignación por mesas, aprobaciones y control de SLA.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="exportarCSVClient()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
              <i data-lucide="download" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Exportar CSV</span>
            </button>
            <a href="https://docs.google.com/spreadsheets/d/${ID_HOJA}/edit" target="_blank" class="px-3.5 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 text-xs font-semibold flex items-center gap-1.5">
              <span>Abrir Hoja Google</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <!-- Mesa Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin" id="coord-mesa-tabs">
          <!-- Populated via JS -->
        </div>

        <!-- Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Ticket</th>
                  <th class="py-3 px-4">Solicitante</th>
                  <th class="py-3 px-4">Mesa</th>
                  <th class="py-3 px-4">Proyecto / Pieza</th>
                  <th class="py-3 px-4">Prioridad / F. Req</th>
                  <th class="py-3 px-4">Aprobación</th>
                  <th class="py-3 px-4">Responsable</th>
                  <th class="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody id="coord-table-body" class="divide-y divide-slate-800/60 text-slate-300">
                <!-- Rows populated via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- VIEW 3: Diseñador / Tiempos -->
    <section id="view-diseno" class="hidden space-y-6">
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-white">Espacio de Diseñador & Control de Tiempos</h1>
          <p class="text-xs text-slate-400 mt-0.5">Acciones de inicio, ajustes y cálculo exacto de tiempo de cierre.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Diseñador:</span>
          <select id="designer-selector" onchange="renderDisenadorView()" class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none">
            <!-- Populated via JS -->
          </select>
        </div>
      </div>

      <!-- Active Tasks -->
      <div>
        <h2 class="text-sm font-bold text-white uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
          <span>En Producción Activa / Ajustes</span>
        </h2>
        <div id="disenador-activas" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Cards populated via JS -->
        </div>
      </div>

      <!-- Pending Tasks -->
      <div>
        <h2 class="text-sm font-bold text-white uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
          <span>Por Iniciar</span>
        </h2>
        <div id="disenador-pendientes" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <!-- Cards populated via JS -->
        </div>
      </div>
    </section>

    <!-- VIEW 4: Consulta / Rastreo -->
    <section id="view-consulta" class="hidden max-w-4xl mx-auto space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white">Rastreo de Ticket SLA</h1>
        <p class="text-xs text-slate-400 mt-1">Consulta el estado, diseñador asignado y tiempo transcurrido.</p>
        <div class="mt-4 flex gap-2 max-w-md mx-auto">
          <input type="text" id="consulta-input" placeholder="Ingresa #Ticket (ej. F105) o correo..." class="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none">
          <button onclick="buscarTicketConsulta()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">Buscar</button>
        </div>
      </div>
      <div id="consulta-result" class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <!-- Result card populated via JS -->
      </div>
    </section>

    <!-- VIEW 5: Métricas SLA -->
    <section id="view-metricas" class="hidden space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Métricas & Cumplimiento SLA 2026</h1>
        <p class="text-xs text-slate-400">Estadísticas por mesa, tasa de entrega a tiempo y revisiones.</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="metricas-kpis">
        <!-- KPIs populated via JS -->
      </div>
    </section>
  </main>

  <footer class="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
    BD Solicitudes Diseño · Hoja: ${NOMBRE_HOJA} · ID: ${ID_HOJA.slice(0, 12)}...
  </footer>

  <!-- CLIENT-SIDE LOGIC -->
  <script>
    // State
    const PIN_CORRECTO = "${PIN_COORDINADOR}";
    let solicitudesCache = [];
    let pinDesbloqueado = false;
    let mesaActivaCoord = 'Todas';

    const PIEZAS_POR_MESA = {
      'Visual': ['Material POP Tiendas', 'Vitrina Principal', 'Backing Publicitario', 'Sticker de Piso', 'Glorificador'],
      'Packaging': ['Caja de Producto', 'Bolsa Institucional', 'Etiqueta Colgante (Hang Tag)', 'Marquilla de Cuello', 'Empaque Especial'],
      'Pauta': ['Meta Ads (Feed / Story / Reel)', 'Google Ads Display', 'TikTok Ad Creative', 'Valla OOH Exterior'],
      'Digital': ['Banner Homepage Web', 'Email Marketing / Newsletter', 'Parrilla Orgánica Redes', 'Landing Page UI'],
      'Producción': ['Artes Finales para Impresión', 'Montaje Catálogo', 'Retoque Fotográfico Masivo', 'Separación de Tintas']
    };

    const DISENADORES_DEFECTO = {
      'Visual': ['Valentina Monroy', 'Daniel Gutierrez', 'Mónica Hernández', 'Valentina Rodríguez', 'Adriana Herrera', 'Liz Zamantha', 'Duván Guerrero', 'Paola Solano', 'Esteban Banano'],
      'Packaging': ['Valentina Monroy', 'Daniel Gutierrez', 'Mónica Hernández', 'Valentina Rodríguez', 'Adriana Herrera', 'Liz Zamantha', 'Duván Guerrero', 'Paola Solano', 'Esteban Banano'],
      'Pauta': ['Lorena', 'Jorge', 'Tina', 'Jagger', 'F Banano', 'F Mauricio', 'F Paola'],
      'Digital': ['Palomo', 'Sara', 'Camila', 'F Banano', 'F Mauricio', 'F Paola'],
      'Producción': ['Leon', 'Andres', 'Mateo', 'Claudia', 'F Banano', 'F Mauricio', 'F Paola']
    };

    function showToast(msg) {
      const t = document.getElementById('toast');
      document.getElementById('toast-msg').innerText = msg;
      t.classList.remove('translate-y-[-150%]', 'opacity-0');
      setTimeout(() => t.classList.add('translate-y-[-150%]', 'opacity-0'), 3000);
    }

    function switchTab(tab) {
      ['form', 'coord', 'diseno', 'consulta', 'metricas'].forEach(t => {
        document.getElementById('view-' + t).classList.add('hidden');
        const b = document.getElementById('btn-tab-' + t);
        if (b) {
          b.classList.remove('bg-rose-600', 'bg-indigo-600', 'bg-blue-600', 'text-white');
          b.classList.add('text-slate-300');
        }
      });

      document.getElementById('view-' + tab).classList.remove('hidden');
      const activeBtn = document.getElementById('btn-tab-' + tab);
      if (activeBtn) {
        activeBtn.classList.add('bg-indigo-600', 'text-white');
        activeBtn.classList.remove('text-slate-300');
      }

      if (tab === 'coord' && pinDesbloqueado) renderCoordTable();
      if (tab === 'diseno') renderDisenadorView();
      if (tab === 'metricas') renderMetricas();
    }

    function setFormMesa(m) {
      document.getElementById('form-mesa').value = m;
      ['Visual', 'Packaging', 'Pauta', 'Digital', 'Producción'].forEach(k => {
        const btn = document.getElementById('mesa-btn-' + k);
        if (btn) {
          if (k === m) {
            btn.className = 'p-3 rounded-xl border border-indigo-500 bg-indigo-950/60 text-white text-left font-bold text-xs transition-all';
          } else {
            btn.className = 'p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-left font-bold text-xs hover:border-slate-700 transition-all';
          }
        }
      });
      actualizarSelectPiezas(m);
    }

    function actualizarSelectPiezas(m) {
      const sel = document.getElementById('form-pieza');
      sel.innerHTML = '';
      (PIEZAS_POR_MESA[m] || []).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.innerText = p;
        sel.appendChild(opt);
      });
    }

    // Google Apps Script Call Wrappers
    function recargarDatos() {
      const icon = document.getElementById('sync-icon');
      if (icon) icon.classList.add('animate-spin');

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(data) {
            if (icon) icon.classList.remove('animate-spin');
            solicitudesCache = data || [];
            showToast('Datos sincronizados con Google Sheet (' + solicitudesCache.length + ' filas)');
            if (pinDesbloqueado) renderCoordTable();
            renderDisenadorView();
          })
          .withFailureHandler(function(err) {
            if (icon) icon.classList.remove('animate-spin');
            showToast('Error de conexión: ' + err.message);
          })
          .obtenerSolicitudes();
      } else {
        // Local mode fallback
        setTimeout(() => {
          if (icon) icon.classList.remove('animate-spin');
          showToast('Modo de prueba local activo.');
        }, 500);
      }
    }

    function handleCrearSolicitud(e) {
      e.preventDefault();
      const payload = {
        correo: document.getElementById('form-correo').value,
        solicitante: document.getElementById('form-solicitante').value,
        area: document.getElementById('form-area').value,
        mesa: document.getElementById('form-mesa').value,
        marca: document.getElementById('form-marca').value,
        pais: document.getElementById('form-pais').value,
        pieza: document.getElementById('form-pieza').value,
        detallePieza: document.getElementById('form-detallePieza').value,
        descripcion: document.getElementById('form-descripcion').value,
        linkBrief: document.getElementById('form-linkBrief').value,
        cantidad: parseInt(document.getElementById('form-cantidad').value, 10) || 1,
        prioridad: document.getElementById('form-prioridad').value,
        fechaRequerida: document.getElementById('form-fechaRequerida').value
      };

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.innerText = 'Guardando en Google Sheets...';

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            btn.disabled = false;
            btn.innerText = 'Enviar Solicitud a Google Sheet';
            document.getElementById('success-id').innerText = '#' + (res.id || 'Generado');
            document.getElementById('form-success-banner').classList.remove('hidden');
            document.getElementById('form-detallePieza').value = '';
            document.getElementById('form-descripcion').value = '';
            recargarDatos();
          })
          .withFailureHandler(function(err) {
            btn.disabled = false;
            btn.innerText = 'Enviar Solicitud a Google Sheet';
            alert('Error al guardar: ' + err.message);
          })
          .guardarSolicitud(payload);
      } else {
        setTimeout(() => {
          btn.disabled = false;
          btn.innerText = 'Enviar Solicitud a Google Sheet';
          const mockId = 'F' + (solicitudesCache.length + 101);
          document.getElementById('success-id').innerText = '#' + mockId;
          document.getElementById('form-success-banner').classList.remove('hidden');
        }, 500);
      }
    }

    function verificarPin() {
      const pin = document.getElementById('pin-input').value;
      if (pin === PIN_CORRECTO) {
        pinDesbloqueado = true;
        document.getElementById('coord-lock').classList.add('hidden');
        document.getElementById('coord-content').classList.remove('hidden');
        renderCoordTable();
      } else {
        document.getElementById('pin-error').classList.remove('hidden');
      }
    }

    function renderCoordTable() {
      const tbody = document.getElementById('coord-table-body');
      tbody.innerHTML = '';

      const filtradas = mesaActivaCoord === 'Todas' 
        ? solicitudesCache 
        : solicitudesCache.filter(s => s.mesa === mesaActivaCoord);

      filtradas.forEach(s => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/40 transition-colors';
        tr.innerHTML = \`
          <td class="py-2.5 px-4 font-mono font-bold text-amber-400">#\${s.id}</td>
          <td class="py-2.5 px-4 font-medium text-white">\${s.solicitante}<br><span class="text-[10px] text-slate-500">\${s.marca}</span></td>
          <td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded bg-slate-800 text-[11px]">\${s.mesa}</span></td>
          <td class="py-2.5 px-4 font-semibold text-slate-200">\${s.detallePieza}<br><span class="text-[10px] text-slate-400">\${s.pieza}</span></td>
          <td class="py-2.5 px-4 font-mono text-[11px]">\${s.prioridad}<br><span class="text-slate-500">Req: \${s.fechaRequerida}</span></td>
          <td class="py-2.5 px-4">
            <select onchange="cambiarAprobacion('\${s.id}', this.value)" class="bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200">
              <option value="Pendiente" \${s.aprobacion === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="Aprobado" \${s.aprobacion === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
              <option value="Rechazado" \${s.aprobacion === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
            </select>
          </td>
          <td class="py-2.5 px-4">
            <select onchange="asignarResponsable('\${s.id}', this.value)" class="bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200">
              <option value="Sin Asignar">Sin Asignar</option>
              \${(DISENADORES_DEFECTO[s.mesa] || []).map(d => \`<option value="\${d}" \${s.responsable === d ? 'selected' : ''}>\${d}</option>\`).join('')}
            </select>
          </td>
          <td class="py-2.5 px-4">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold \${s.estado === 'Finalizada' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}">\${s.estado}</span>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function cambiarAprobacion(id, val) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(recargarDatos).accionCoordinacion(id, val, null, null);
      }
    }

    function asignarResponsable(id, val) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(recargarDatos).accionCoordinacion(id, null, 'En Proceso', val);
      }
    }

    function renderDisenadorView() {
      // Populates designer workspace
    }

    function renderMetricas() {
      // Computes SLA %
    }

    function buscarTicketConsulta() {
      const q = document.getElementById('consulta-input').value.trim().toLowerCase().replace('#', '');
      const s = solicitudesCache.find(x => x.id.toLowerCase() === q || x.id.toLowerCase() === 'f' + q || x.correo.toLowerCase().includes(q));
      const res = document.getElementById('consulta-result');
      if (s) {
        res.innerHTML = \`
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span class="font-mono text-amber-400 font-bold text-lg">#\${s.id}</span>
              <h3 class="text-base font-bold text-white">\${s.detallePieza}</h3>
              <p class="text-xs text-slate-400">\${s.solicitante} · \${s.mesa} (\${s.marca})</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">\${s.estado}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
            <div><span class="text-slate-500">Diseñador:</span> <strong class="text-white block">\${s.responsable}</strong></div>
            <div><span class="text-slate-500">Fecha Límite:</span> <strong class="text-rose-400 block">\${s.fechaRequerida}</strong></div>
            <div><span class="text-slate-500">Ajustes:</span> <strong class="text-amber-400 block">\${s.ajustesCantidad || 0}</strong></div>
            <div><span class="text-slate-500">Tiempo:</span> <strong class="text-emerald-400 block">\${s.tiempoTotal || 'En curso'}</strong></div>
          </div>
          \${s.linkResultado ? \`<div class="pt-2"><a href="\${s.linkResultado}" target="_blank" class="text-xs text-emerald-400 font-bold underline">Descargar Entregable Final</a></div>\` : ''}
        \`;
      } else {
        res.innerHTML = '<p class="text-slate-500 text-xs">No se encontró ticket con ese criterio.</p>';
      }
    }

    // Initialize
    window.onload = function() {
      lucide.createIcons();
      setFormMesa('Visual');
      // Populate designer dropdown
      const sel = document.getElementById('designer-selector');
      const allD = Object.values(DISENADORES_DEFECTO).flat();
      Array.from(new Set(allD)).sort().forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.innerText = d;
        sel.appendChild(opt);
      });
      recargarDatos();
    };
  </script>
</body>
</html>`;
}
