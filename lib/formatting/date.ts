const MAPUTO_TIME_ZONE = "Africa/Maputo";

export function formatMaputoDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: MAPUTO_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatMaputoRelative(value: string | Date) {
  const target = new Date(value).getTime();
  const deltaMinutes = Math.round((target - Date.now()) / 60_000);
  const absoluteMinutes = Math.abs(deltaMinutes);

  if (absoluteMinutes < 1) {
    return "agora mesmo";
  }

  const rtf = new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" });

  if (absoluteMinutes < 60) {
    return rtf.format(deltaMinutes, "minute");
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  const absoluteHours = Math.abs(deltaHours);
  if (absoluteHours < 24) {
    return rtf.format(deltaHours, "hour");
  }

  const deltaDays = Math.round(deltaHours / 24);
  return rtf.format(deltaDays, "day");
}
