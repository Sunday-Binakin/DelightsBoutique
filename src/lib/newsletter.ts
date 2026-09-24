export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}

const STORAGE_KEY = "delight-boutique-newsletter-subscribers";

function readAll(): NewsletterSubscriber[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(subscribers: NewsletterSubscriber[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
  } catch {
    // Storage may be full or blocked — the signup still succeeds for this session.
  }
}

export function getSubscribers(): NewsletterSubscriber[] {
  return readAll();
}

/** Adds an email if it isn't already subscribed. Returns false if it was a duplicate. */
export function addSubscriber(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const all = readAll();
  if (all.some((s) => s.email === normalized)) return false;

  writeAll([...all, { email: normalized, subscribedAt: new Date().toISOString() }]);
  return true;
}
