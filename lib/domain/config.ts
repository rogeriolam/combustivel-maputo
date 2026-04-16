export const MAPUTO_CENTER = {
  latitude: -25.9453,
  longitude: 32.5892,
  zoom: 10.9
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
