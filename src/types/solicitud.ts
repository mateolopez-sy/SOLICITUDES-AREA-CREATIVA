export type MesaType = 'Visual' | 'Packaging' | 'Pauta' | 'Digital' | 'Producción';

export type PrioridadType = 'P1 - Urgente' | 'P2 - Alta' | 'P3 - Normal' | 'P4 - Planificada';

export type AprobacionType = 'Pendiente' | 'Aprobado' | 'Rechazado';

export type EstadoType = 'Nueva' | 'En proceso' | 'Ajustes' | 'Finalizada' | 'Rechazada';

export interface Solicitud {
  id: string; // #Solicitud e.g. "F2"
  marcaTemporal: string; // YYYY-MM-DD HH:mm:ss
  mes: string; // e.g. "Octubre"
  correo: string;
  solicitante: string;
  area: string;
  mesa: MesaType;
  marca: string;
  pais: string;
  pieza: string;
  detallePieza: string; // Nombre/Número Proyecto
  descripcion: string; // Descripción / Link Reference
  linkBrief: string; // Link Brief PDF
  cantidad: number;
  fechaRequerida: string; // YYYY-MM-DD
  prioridad: PrioridadType;
  aprobacion: AprobacionType;
  responsable: string; // Sin Asignar or Designer Name
  estado: EstadoType;
  fechaAsignacion: string;
  fechaInicio: string;
  ajustesCantidad: number;
  notasAjustes: string;
  fechaCierre: string;
  tiempoTotal: string; // e.g. "2 h, 15 min, 30 seg"
  linkResultado: string;
}

export type DisenadoresPorMesa = Record<MesaType, string[]>;

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MESAS: MesaType[] = ['Visual', 'Packaging', 'Pauta', 'Digital', 'Producción'];

export const MARCAS = [
  'Yoi',
  'Lili Pink',
  'Lili Pink Beauty & Wellness',
  'Fast Moda',
  'Yahad'
];

export const AREAS = [
  'Mercadeo',
  'Producto',
  'Digital',
  'Recursos Humanos',
  'SAC',
  'Visual',
  'Wholesale',
  'Internacional'
];

export const PAISES = [
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'México',
  'LATAM'
];

export const INTEGRANTES_IMPRESOS = [
  'Valentina Monroy',
  'Daniel Gutierrez',
  'Mónica Hernández',
  'Valentina Rodríguez',
  'Adriana Herrera',
  'Liz Zamantha',
  'Duván Guerrero',
  'Paola Solano',
  'Esteban Banano'
];

export const PIEZAS: Record<MesaType, string[]> = {
  Visual: [
    'KV de Campaña / Lanzamiento',
    'Desarrollo de Piezas de Campaña',
    'P.O.P. y Punto de Venta',
    'Material Impreso para Activaciones',
    'Proyecto de Comunicación Visual',
    'Pieza Gráfica Impresa General',
    'Apertura de Tiendas / Cosmocentro',
    'Banners / Cenefas / Vinilos',
    'Vitrina / Dinteles / Cajas de Luz'
  ],
  Packaging: [
    'Propuesta de KV Packaging (Beauty/Textil)',
    'Planos Técnicos en PDF/Illustrator',
    'Mockups de Empaques',
    'Órdenes de China - Tech (Cargadores/Cables/PowerBank)',
    'Órdenes de China - Beauty & Office',
    'Órdenes de China - Lifestyle, Toys & Shoes',
    'Empaques Especiales (Cajas / Bolsas Kraft)',
    'Etiqueta, Soporte o Faja de Medias',
    'Empaques Termos y Contacto con Alimentos'
  ],
  Pauta: [
    'Pauta digital Meta/Google',
    'Optimización Pauta',
    'Banners app/web/CRO',
    'KV campaña digital',
    'Historias estáticas/tácticos',
    'Contenido portafolio',
    'Legales',
    'Mailing CRM',
    'Landing/micrositio',
    'Motion/GIF básico',
    'Kit campaña digital',
    'A/B testing creativo'
  ],
  Digital: [
    'Banners redes sociales',
    'KV particular',
    'Edición de video',
    'Historias',
    'Key visual campaña digital',
    'Piezas digitales campaña',
    'Tripleta',
    'Post',
    'Reels'
  ],
  Producción: [
    'Edición de Video',
    'Creación con IA',
    'Shooting Fotográfico',
    'Retoque de Imagen'
  ]
};

export const HEADERS_GOOGLE_SHEETS = [
  '#Solicitud',
  'Marca temporal',
  'Mes',
  'Correo',
  'Solicitante',
  'Área Solicitante',
  'Mesa',
  'Marca',
  'País',
  'Pieza',
  'Nombre/Número Proyecto',
  'Descripción/Link Reference',
  'Link Brief PDF',
  'Cantidad',
  'Fecha Requerida',
  'Prioridad SLA',
  'Aprobación',
  'Responsable',
  'Estado',
  'Fecha Asignación',
  'Fecha Inicio',
  'Ajustes Cantidad',
  'Notas Ajustes',
  'Fecha Cierre',
  'Tiempo Total Formateado',
  'Link Resultado'
];
