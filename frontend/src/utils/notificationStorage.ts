const READ_IDS_KEY = "readNotificationIds";
const DISMISSED_ANNOUNCEMENT_KEY = "dismissedAnnouncementId";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function getVisitorReadNotificationIds(): Set<string> {
  return new Set(readIds());
}

export function markVisitorNotificationRead(id: string): void {
  if (typeof window === "undefined") return;
  const ids = new Set(readIds());
  ids.add(id);
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
}

export function markAllVisitorNotificationsRead(ids: string[]): void {
  if (typeof window === "undefined") return;
  const merged = new Set([...readIds(), ...ids]);
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...merged]));
}

export function getDismissedAnnouncementId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DISMISSED_ANNOUNCEMENT_KEY);
}

export function dismissAnnouncement(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_ANNOUNCEMENT_KEY, id);
}

export function adjustUnreadCountForVisitor(
  serverCount: number,
  broadcastIds: string[]
): number {
  const read = getVisitorReadNotificationIds();
  const unreadBroadcasts = broadcastIds.filter((id) => !read.has(id)).length;
  return unreadBroadcasts > 0 ? unreadBroadcasts : Math.max(0, serverCount - read.size);
}
