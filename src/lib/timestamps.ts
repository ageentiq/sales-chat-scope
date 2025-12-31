// Centralized timestamp parsing for backend conversation data
//
// Data notes:
// - Some records include `latestTimestamp` (epoch seconds, UTC).
// - Many records include `timestamp` as a naive string like "YYYY-MM-DD HH:mm".
//
// Strategy:
// 1) Prefer latestTimestamp when present (most reliable)
// 2) Otherwise parse the naive string as LOCAL time (no timezone info provided)

export function getMessageTimeMs(input: {
  timestamp?: string | null | undefined;
  latestTimestamp?: number | null | undefined;
}): number {
  const lt = input.latestTimestamp;
  if (typeof lt === "number" && Number.isFinite(lt) && lt > 0) {
    return lt * 1000;
  }

  const ts = (input.timestamp ?? "").toString().trim();
  if (!ts) return 0;

  const m = ts.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    const date = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      s ? Number(s) : 0
    );
    const time = date.getTime();
    return Number.isFinite(time) ? time : 0;
  }

  const parsed = new Date(ts).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}
