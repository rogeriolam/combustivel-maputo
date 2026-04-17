import { buildDashboardSummary, calculateFuelAggregate, filterStations } from "@/lib/domain/logic";
import { mockAlerts, mockProfiles, mockSignals, mockStations } from "@/lib/mocks/data";
import { buildProfilePayload } from "@/lib/supabase/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AlertPreference, DashboardSummary, Profile, Signal, Station, StationFilters } from "@/lib/domain/types";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getStations(filters: StationFilters = {}): Promise<Station[]> {
  if (!hasSupabaseEnv()) {
    return filterStations(mockStations, filters);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return filterStations(mockStations, filters);
  }

  const { data: stations, error } = await supabase
    .from("stations_with_current_status")
    .select("*")
    .order("name");

  if (error || !stations) {
    return filterStations(mockStations, filters);
  }

  return filterStations(
    stations.map((station) => ({
      id: station.id,
      name: station.name,
      city: station.city,
      neighborhood: station.neighborhood,
      latitude: station.latitude,
      longitude: station.longitude,
      createdAt: station.created_at,
      createdBy: station.created_by,
      isActive: station.is_active,
      isValidated: station.is_validated,
      adminNotes: station.admin_notes,
      gasoline: {
        fuelType: "gasoline",
        status: station.gasoline_status,
        confidence: station.gasoline_confidence,
        availableCount: station.gasoline_available_count,
        unavailableCount: station.gasoline_unavailable_count,
        lastUpdatedAt: station.gasoline_last_updated_at,
        recentSignals: station.gasoline_recent_signals,
        explanation: station.gasoline_explanation,
        weightedAvailable: station.gasoline_weighted_available,
        weightedUnavailable: station.gasoline_weighted_unavailable
      },
      diesel: {
        fuelType: "diesel",
        status: station.diesel_status,
        confidence: station.diesel_confidence,
        availableCount: station.diesel_available_count,
        unavailableCount: station.diesel_unavailable_count,
        lastUpdatedAt: station.diesel_last_updated_at,
        recentSignals: station.diesel_recent_signals,
        explanation: station.diesel_explanation,
        weightedAvailable: station.diesel_weighted_available,
        weightedUnavailable: station.diesel_weighted_unavailable
      }
    })),
    filters
  );
}

export async function getStationById(id: string): Promise<Station | null> {
  const stations = await getStations();
  return stations.find((station) => station.id === id) ?? null;
}

export async function getSignalsForStation(stationId: string): Promise<Signal[]> {
  if (!hasSupabaseEnv()) {
    return mockSignals.filter((signal) => signal.stationId === stationId);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return mockSignals.filter((signal) => signal.stationId === stationId);
  }

  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockSignals.filter((signal) => signal.stationId === stationId);
  }

  return data.map((signal) => ({
    id: signal.id,
    stationId: signal.station_id,
    userId: signal.user_id,
    fuelType: signal.fuel_type,
    option: signal.status_option,
    createdAt: signal.created_at,
    userLatitude: signal.user_latitude,
    userLongitude: signal.user_longitude,
    distanceMeters: signal.distance_meters,
    gpsValidated: signal.gps_validated,
    reputationWeight: signal.reputation_weight
  }));
}

export async function getDashboardSummary(filters: StationFilters = {}): Promise<DashboardSummary> {
  const stations = await getStations(filters);
  return buildDashboardSummary(stations);
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) {
    return mockProfiles[0];
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return mockProfiles[0];
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!data) {
    const payload = buildProfilePayload(user);

    await supabase.from("profiles").upsert(payload, {
      onConflict: "id"
    });

    return {
      id: payload.id,
      fullName: payload.full_name,
      email: payload.email,
      provider: payload.auth_provider,
      reputationScore: payload.reputation_score,
      reputationWeight: payload.reputation_weight,
      role: payload.role,
      createdAt: payload.created_at
    };
  }

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    provider: data.auth_provider,
    reputationScore: data.reputation_score,
    reputationWeight: data.reputation_weight,
    role: data.role,
    createdAt: data.created_at
  };
}

export async function getAlerts(): Promise<AlertPreference[]> {
  if (!hasSupabaseEnv()) {
    return mockAlerts;
  }

  const profile = await getCurrentUserProfile();
  if (!profile) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return mockAlerts;
  }

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockAlerts;
  }

  return data.map((alert) => ({
    id: alert.id,
    userId: alert.user_id,
    stationId: alert.station_id ?? undefined,
    city: alert.city ?? undefined,
    fuelType: alert.fuel_type,
    triggerStatus: alert.trigger_status,
    channel: alert.channel,
    isActive: alert.is_active,
    createdAt: alert.created_at
  }));
}

export async function getAdminMetrics() {
  const stations = await getStations();
  const profiles = mockProfiles;
  const signals = mockSignals;

  return {
    flaggedSignals: signals.filter((signal) => !signal.gpsValidated).length,
    blockedUsers: profiles.filter((profile) => profile.role === "blocked").length,
    totalProfiles: profiles.length,
    recentSignals: signals.length,
    candidateDuplicates: stations.filter((station) => !station.isValidated).length
  };
}

export async function rebuildStationFromSignals(stationId: string): Promise<Station | null> {
  const station = await getStationById(stationId);
  if (!station) return null;
  const signals = await getSignalsForStation(stationId);

  return {
    ...station,
    gasoline: calculateFuelAggregate("gasoline", signals),
    diesel: calculateFuelAggregate("diesel", signals)
  };
}
