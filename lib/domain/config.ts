export const MAPUTO_CENTER = {
  latitude: -18.665695,
  longitude: 35.529562,
  zoom: 4.8
};

export const GPS_RADIUS_METERS = 100;
export const SIGNAL_WINDOW_HOURS = 3;
export const MIN_SIGNALS_FOR_STATUS = 2;
export const STATUS_MAJORITY_THRESHOLD = 0.6;

export const fuelLabels = {
  gasoline: "Gasolina",
  diesel: "Diesel"
} as const;

export const statusLabels = {
  available: "Tem",
  unavailable: "Não tem",
  conflict: "Em conflito",
  unknown: "Sem informação recente"
} as const;

export const confidenceLabels = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto"
} as const;

export const statusColors = {
  available: "var(--status-available)",
  unavailable: "var(--status-unavailable)",
  conflict: "var(--status-conflict)",
  unknown: "var(--status-unknown)"
} as const;

export const provinceOptions = [
  "Cidade de Maputo",
  "Maputo",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa"
] as const;
