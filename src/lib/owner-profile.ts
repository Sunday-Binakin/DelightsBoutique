export interface OwnerProfile {
  name: string;
  email: string;
  phone?: string;
  /** Placeholder only — login doesn't verify this yet, see admin-auth.ts. */
  password: string;
}

// The Owner's own account details, editable from their "My Account" page.
// Note this is display/contact info only — admin-auth.ts treats ANY email
// that doesn't match a staff record as the Owner, so changing this email
// doesn't change what's typed at login (see adminSignIn's comment).
export const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  name: "Owner",
  email: "owner@delightsboutique.com",
  phone: "",
  password: "owner-placeholder",
};

const STORAGE_KEY = "delight-boutique-owner-profile";

export function getOwnerProfile(): OwnerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_OWNER_PROFILE, ...JSON.parse(raw) } : DEFAULT_OWNER_PROFILE;
  } catch {
    return DEFAULT_OWNER_PROFILE;
  }
}

export function saveOwnerProfile(updates: Partial<OwnerProfile>) {
  const next = { ...getOwnerProfile(), ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked — the change still applies for this session.
  }
}
