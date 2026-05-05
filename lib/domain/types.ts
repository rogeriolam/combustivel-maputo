export type FuelType = "gasoline" | "diesel";
export type SignalOption = "available" | "unavailable";
export type FuelStatus = "available" | "unavailable" | "conflict" | "unknown";
export type QueueOption = "none" | "short" | "long";
export type QueueStatus = QueueOption | "conflict" | "unknown";
export type ConfidenceLevel = "low" | "medium" | "high";
export type UserRole = "active" | "blocked" | "admin";
export type Province =
  | "Cidade de Maputo"
  | "Maputo"
  | "Gaza"
  | "Inhambane"
  | "Sofala"
  | "Manica"
  | "Tete"
  | "Zambézia"
  | "Nampula"
  | "Cabo Delgado"
  | "Niassa";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  provider: string;
  reputationScore: number;
  reputationWeight: number;
  role: UserRole;
  createdAt: string;
}

export interface Signal {
  id: string;
  stationId: string;
  userId?: string;
  reporterKey?: string;
  userName?: string;
  userEmail?: string;
  fuelType: FuelType;
  option: SignalOption;
  queueStatus?: QueueOption;
  createdAt: string;
  userLatitude: number;
  userLongitude: number;
  distanceMeters: number;
  gpsValidated: boolean;
  reputationWeight: number;
}

export interface FuelAggregate {
  fuelType: FuelType;
  status: FuelStatus;
  confidence: ConfidenceLevel;
  availableCount: number;
  unavailableCount: number;
  lastUpdatedAt: string | null;
  recentSignals: number;
  explanation: string;
  weightedAvailable: number;
  weightedUnavailable: number;
}

export interface QueueAggregate {
  status: QueueStatus;
  noneCount: number;
  shortCount: number;
  longCount: number;
  recentSignals: number;
  lastUpdatedAt: string | null;
  explanation: string;
}

export interface Station {
  id: string;
  name: string;
  province: Province;
  municipality: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  isValidated: boolean;
  adminNotes?: string;
  gasoline: FuelAggregate;
  diesel: FuelAggregate;
  queue: QueueAggregate;
}

export interface AlertPreference {
  id: string;
  userId: string;
  stationId?: string;
  province?: Province;
  fuelType: FuelType;
  triggerStatus: "available";
  channel: "browser" | "email";
  isActive: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalStations: number;
  gasolineAvailable: number;
  gasolineUnavailable: number;
  dieselAvailable: number;
  dieselUnavailable: number;
  conflict: number;
  unknown: number;
}

export interface StationFilters {
  search?: string;
  province?: Province | "all";
  fuelType?: FuelType | "all";
  status?: FuelStatus | "all";
}
