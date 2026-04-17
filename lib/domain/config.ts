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

export const provinceMapView = {
  "Cidade de Maputo": { latitude: -25.9653, longitude: 32.5892, zoom: 11.5 },
  Maputo: { latitude: -25.4500, longitude: 32.7500, zoom: 8.4 },
  Gaza: { latitude: -23.0222, longitude: 33.0000, zoom: 7.2 },
  Inhambane: { latitude: -23.8650, longitude: 35.3833, zoom: 7.1 },
  Sofala: { latitude: -19.1164, longitude: 34.8671, zoom: 7.1 },
  Manica: { latitude: -19.1167, longitude: 33.4833, zoom: 7.2 },
  Tete: { latitude: -16.1564, longitude: 33.5867, zoom: 6.8 },
  "Zambézia": { latitude: -17.8800, longitude: 36.8883, zoom: 6.9 },
  Nampula: { latitude: -15.1167, longitude: 39.2667, zoom: 6.8 },
  "Cabo Delgado": { latitude: -12.9740, longitude: 39.9075, zoom: 6.6 },
  Niassa: { latitude: -13.3000, longitude: 35.2500, zoom: 6.5 }
} as const;
