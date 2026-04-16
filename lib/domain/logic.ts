import {
  GPS_RADIUS_METERS,
  MIN_SIGNALS_FOR_STATUS,
  SIGNAL_WINDOW_HOURS,
  STATUS_MAJORITY_THRESHOLD,
  confidenceLabels,
  fuelLabels,
  statusLabels
} from "@/lib/domain/config";
import {
  ConfidenceLevel,
  DashboardSummary,
  FuelAggregate,
  FuelStatus,
  FuelType,
  Profile,
  Signal,
  SignalOption,
  Station,
  StationFilters
} from "@/lib/domain/types";

export function getRecentSignals(signals: Signal[], now = new Date()): Signal[] {
  const cutoff = new Date(now.getTime() - SIGNAL_WINDOW_HOURS * 60 * 60 * 1000);
  return signals.filter((signal) => new Date(signal.createdAt) >= cutoff && signal.gpsValidated);
}

export function getLatestSignalsPerUser(signals: Signal[]): Signal[] {
  const map = new Map<string, Signal>();

  for (const signal of [...signals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )) {
    const key = `${signal.stationId}:${signal.fuelType}:${signal.userId}`;
    if (!map.has(key)) {
      map.set(key, signal);
    }
  }

  return [...map.values()];
}

export function scoreSignal(signal: Signal): number {
  return signal.reputationWeight;
}

export function getConfidenceLevel(
  recentSignals: number,
  majorityRatio: number | null
): ConfidenceLevel {
  if (recentSignals >= 6 && majorityRatio !== null && majorityRatio >= 0.75) {
    return "high";
  }

  if (recentSignals >= 3 && majorityRatio !== null && majorityRatio >= 0.6) {
    return "medium";
  }

  return "low";
}

export function getStatusExplanation(status: FuelStatus): string {
  switch (status) {
    case "available":
      return "A maioria das sinalizações recentes indica que este combustível está disponível.";
    case "unavailable":
      return "A maioria das sinalizações recentes indica que este combustível está indisponível.";
    case "conflict":
      return "Existem sinalizações recentes contraditórias e ainda não há maioria clara.";
    case "unknown":
    default:
      return "Ainda não existem sinalizações recentes suficientes para confiar neste estado.";
  }
}

export function calculateFuelAggregate(
  fuelType: FuelType,
  signals: Signal[],
  now = new Date()
): FuelAggregate {
  const recentSignals = getRecentSignals(signals.filter((signal) => signal.fuelType === fuelType), now);
  const latestSignals = getLatestSignalsPerUser(recentSignals);
  const availableSignals = latestSignals.filter((signal) => signal.option === "available");
  const unavailableSignals = latestSignals.filter((signal) => signal.option === "unavailable");

  const weightedAvailable = availableSignals.reduce((sum, signal) => sum + scoreSignal(signal), 0);
  const weightedUnavailable = unavailableSignals.reduce((sum, signal) => sum + scoreSignal(signal), 0);
  const totalWeight = weightedAvailable + weightedUnavailable;
  const availableRatio = totalWeight > 0 ? weightedAvailable / totalWeight : null;
  const unavailableRatio = totalWeight > 0 ? weightedUnavailable / totalWeight : null;

  let status: FuelStatus = "unknown";

  if (latestSignals.length < MIN_SIGNALS_FOR_STATUS) {
    status = "unknown";
  } else if ((availableRatio ?? 0) >= STATUS_MAJORITY_THRESHOLD) {
    status = "available";
  } else if ((unavailableRatio ?? 0) >= STATUS_MAJORITY_THRESHOLD) {
    status = "unavailable";
  } else {
    status = "conflict";
  }

  return {
    fuelType,
    status,
    confidence: getConfidenceLevel(
      latestSignals.length,
      status === "conflict" || status === "unknown"
        ? null
        : Math.max(availableRatio ?? 0, unavailableRatio ?? 0)
    ),
    availableCount: availableSignals.length,
    unavailableCount: unavailableSignals.length,
    lastUpdatedAt: latestSignals.length ? latestSignals[0].createdAt : null,
    recentSignals: latestSignals.length,
    explanation: getStatusExplanation(status),
    weightedAvailable,
    weightedUnavailable
  };
}

export function calculateReputation(profile: Pick<Profile, "reputationScore">): number {
  if (profile.reputationScore >= 80) {
    return 1.25;
  }
  if (profile.reputationScore >= 40) {
    return 1.1;
  }
  return 1;
}

export function distanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinAllowedRadius(distance: number, radius = GPS_RADIUS_METERS): boolean {
  return distance <= radius;
}

export function getDuplicateCandidates(stations: Station[], latitude: number, longitude: number) {
  return stations.filter(
    (station) => distanceMeters(latitude, longitude, station.latitude, station.longitude) <= GPS_RADIUS_METERS
  );
}

export function filterStations(stations: Station[], filters: StationFilters): Station[] {
  return stations.filter((station) => {
    const matchesSearch = filters.search
      ? station.name.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchesCity = !filters.city || filters.city === "all" ? true : station.city === filters.city;

    const activeFuel =
      filters.fuelType && filters.fuelType !== "all"
        ? station[filters.fuelType]
        : undefined;

    const matchesStatus =
      !filters.status || filters.status === "all"
        ? true
        : activeFuel
          ? activeFuel.status === filters.status
          : station.gasoline.status === filters.status || station.diesel.status === filters.status;

    return matchesSearch && matchesCity && matchesStatus;
  });
}

export function buildDashboardSummary(stations: Station[]): DashboardSummary {
  return stations.reduce<DashboardSummary>(
    (summary, station) => {
      summary.totalStations += 1;

      if (station.gasoline.status === "available") summary.gasolineAvailable += 1;
      if (station.gasoline.status === "unavailable") summary.gasolineUnavailable += 1;
      if (station.diesel.status === "available") summary.dieselAvailable += 1;
      if (station.diesel.status === "unavailable") summary.dieselUnavailable += 1;
      if (station.gasoline.status === "conflict" || station.diesel.status === "conflict") summary.conflict += 1;
      if (station.gasoline.status === "unknown" || station.diesel.status === "unknown") summary.unknown += 1;

      return summary;
    },
    {
      totalStations: 0,
      gasolineAvailable: 0,
      gasolineUnavailable: 0,
      dieselAvailable: 0,
      dieselUnavailable: 0,
      conflict: 0,
      unknown: 0
    }
  );
}

export function optionLabel(option: SignalOption): string {
  return option === "available" ? "Tem" : "Não tem";
}

export function fuelLegend() {
  return [
    {
      title: statusLabels.available,
      body: "A maioria das sinalizações recentes indica disponibilidade."
    },
    {
      title: statusLabels.unavailable,
      body: "A maioria das sinalizações recentes indica indisponibilidade."
    },
    {
      title: statusLabels.conflict,
      body: "As sinalizações recentes são contraditórias e nenhuma opção chega a 60%."
    },
    {
      title: statusLabels.unknown,
      body: "Existem menos de 2 sinalizações válidas nas últimas 3 horas."
    }
  ];
}

export function formatStatusMeta(aggregate: FuelAggregate): string {
  const fuel = fuelLabels[aggregate.fuelType];
  const status = statusLabels[aggregate.status];
  const confidence = confidenceLabels[aggregate.confidence];

  return `${fuel}: ${status} · confiança ${confidence}`;
}
