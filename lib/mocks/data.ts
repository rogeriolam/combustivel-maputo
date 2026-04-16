import { calculateFuelAggregate } from "@/lib/domain/logic";
import { AlertPreference, Profile, Signal, Station } from "@/lib/domain/types";

export const mockProfiles: Profile[] = [
  {
    id: "user-1",
    fullName: "Celina Mucavele",
    email: "celina@example.com",
    provider: "google",
    reputationScore: 78,
    reputationWeight: 1.1,
    role: "active",
    createdAt: "2026-04-14T08:00:00.000Z"
  },
  {
    id: "user-2",
    fullName: "Paulo Matola",
    email: "paulo@example.com",
    provider: "email",
    reputationScore: 22,
    reputationWeight: 1,
    role: "active",
    createdAt: "2026-04-12T09:15:00.000Z"
  },
  {
    id: "admin-1",
    fullName: "Admin Combustível Maputo",
    email: "admin@example.com",
    provider: "google",
    reputationScore: 98,
    reputationWeight: 1.25,
    role: "admin",
    createdAt: "2026-04-01T09:15:00.000Z"
  }
];

export const mockSignals: Signal[] = [
  {
    id: "sig-1",
    stationId: "station-1",
    userId: "user-1",
    fuelType: "gasoline",
    option: "available",
    createdAt: "2026-04-15T12:20:00.000Z",
    userLatitude: -25.9533,
    userLongitude: 32.5925,
    distanceMeters: 18,
    gpsValidated: true,
    reputationWeight: 1.1
  },
  {
    id: "sig-2",
    stationId: "station-1",
    userId: "user-2",
    fuelType: "gasoline",
    option: "available",
    createdAt: "2026-04-15T13:05:00.000Z",
    userLatitude: -25.9534,
    userLongitude: 32.5924,
    distanceMeters: 22,
    gpsValidated: true,
    reputationWeight: 1
  },
  {
    id: "sig-3",
    stationId: "station-1",
    userId: "user-1",
    fuelType: "diesel",
    option: "unavailable",
    createdAt: "2026-04-15T12:59:00.000Z",
    userLatitude: -25.9533,
    userLongitude: 32.5925,
    distanceMeters: 18,
    gpsValidated: true,
    reputationWeight: 1.1
  },
  {
    id: "sig-4",
    stationId: "station-1",
    userId: "user-2",
    fuelType: "diesel",
    option: "available",
    createdAt: "2026-04-15T13:20:00.000Z",
    userLatitude: -25.9534,
    userLongitude: 32.5924,
    distanceMeters: 22,
    gpsValidated: true,
    reputationWeight: 1
  },
  {
    id: "sig-5",
    stationId: "station-2",
    userId: "user-1",
    fuelType: "gasoline",
    option: "unavailable",
    createdAt: "2026-04-15T12:45:00.000Z",
    userLatitude: -25.9121,
    userLongitude: 32.4951,
    distanceMeters: 30,
    gpsValidated: true,
    reputationWeight: 1.1
  },
  {
    id: "sig-6",
    stationId: "station-2",
    userId: "admin-1",
    fuelType: "gasoline",
    option: "unavailable",
    createdAt: "2026-04-15T13:18:00.000Z",
    userLatitude: -25.912,
    userLongitude: 32.4952,
    distanceMeters: 19,
    gpsValidated: true,
    reputationWeight: 1.25
  },
  {
    id: "sig-7",
    stationId: "station-2",
    userId: "user-2",
    fuelType: "diesel",
    option: "available",
    createdAt: "2026-04-15T11:50:00.000Z",
    userLatitude: -25.9121,
    userLongitude: 32.4951,
    distanceMeters: 30,
    gpsValidated: true,
    reputationWeight: 1
  },
  {
    id: "sig-8",
    stationId: "station-3",
    userId: "user-1",
    fuelType: "gasoline",
    option: "available",
    createdAt: "2026-04-15T10:00:00.000Z",
    userLatitude: -25.873,
    userLongitude: 32.4601,
    distanceMeters: 28,
    gpsValidated: true,
    reputationWeight: 1.1
  }
];

const baseStations = [
  {
    id: "station-1",
    name: "Petromoc Julius Nyerere",
    city: "Maputo" as const,
    neighborhood: "Polana Cimento",
    latitude: -25.9532,
    longitude: 32.5922,
    createdAt: "2026-04-15T06:00:00.000Z",
    createdBy: "admin-1",
    isActive: true,
    isValidated: true,
    adminNotes: "Estação com muito movimento na hora de ponta."
  },
  {
    id: "station-2",
    name: "Galp Machava",
    city: "Matola" as const,
    neighborhood: "Machava",
    latitude: -25.9119,
    longitude: 32.495,
    createdAt: "2026-04-15T06:30:00.000Z",
    createdBy: "user-1",
    isActive: true,
    isValidated: true,
    adminNotes: "Bom ponto para cobertura da zona industrial."
  },
  {
    id: "station-3",
    name: "TotalEnergies Matola Rio",
    city: "Matola" as const,
    neighborhood: "Matola Rio",
    latitude: -25.8728,
    longitude: 32.4604,
    createdAt: "2026-04-15T08:30:00.000Z",
    createdBy: "user-2",
    isActive: true,
    isValidated: false
  }
];

export const mockStations: Station[] = baseStations.map((station) => {
  const signals = mockSignals.filter((signal) => signal.stationId === station.id);

  return {
    ...station,
    gasoline: calculateFuelAggregate("gasoline", signals),
    diesel: calculateFuelAggregate("diesel", signals)
  };
});

export const mockAlerts: AlertPreference[] = [
  {
    id: "alert-1",
    userId: "user-1",
    stationId: "station-2",
    fuelType: "gasoline",
    triggerStatus: "available",
    channel: "browser",
    isActive: true,
    createdAt: "2026-04-15T10:10:00.000Z"
  },
  {
    id: "alert-2",
    userId: "user-1",
    city: "Maputo",
    fuelType: "diesel",
    triggerStatus: "available",
    channel: "email",
    isActive: true,
    createdAt: "2026-04-15T11:10:00.000Z"
  }
];
