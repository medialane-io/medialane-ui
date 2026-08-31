
function toMs(dateStr: string | number): number {
  const raw = typeof dateStr === "string" && /^\d+$/.test(dateStr.trim())
    ? Number(dateStr)
    : dateStr;
  return typeof raw === "number" ? raw * 1000 : new Date(raw).getTime();
}

export function isExpired(endTime: string | number | null | undefined): boolean {
  if (endTime === null || endTime === undefined || endTime === "" || endTime === 0 || endTime === "0") {
    return false;
  }
  const ms = toMs(endTime);
  if (!Number.isFinite(ms)) return false;
  return ms - Date.now() <= 0;
}

export function timeUntil(dateStr: string | number): string {
  const ms = toMs(dateStr);
  const diff = ms - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
