export interface SiteSettings {
  tagline: string;
  whatsappNumber: string;
  whatsappMessage: string;
  phoneDisplay: string;
  address: string;
  hours: string;
  announcement: string;
  bankTransferInstructions: string;
  mobileMoneyInstructions: string;
  cashInstructions: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  /** Where "new order" alerts go once a backend can actually send them — see notifications.ts for the in-app bell, which already works. */
  notifyByEmail: boolean;
  notificationEmail: string;
  notifyByWhatsapp: boolean;
}

// Editable contact/branding copy shown across the storefront — the business
// name stays a fixed constant (lib/constants.ts), everything else here is
// content an owner can change without a developer.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  tagline: "Corporate & casual wear, footwear, bags, fabrics and jewellery.",
  whatsappNumber: "233240000000",
  whatsappMessage: "Hello Delight's Boutique, I'd like to ask about a product.",
  phoneDisplay: "+233 24 000 0000",
  address: "Ring Road Central, Accra, Ghana",
  hours: "Mon – Sat, 9am – 6pm",
  announcement: "Wholesale & retail welcome — order today, pay on confirmation.",
  bankTransferInstructions:
    "Transfer to Delight's Boutique — GCB Bank, Acct 001-234-5678. Send your proof of payment via WhatsApp after ordering.",
  mobileMoneyInstructions:
    "Send to MoMo number 024-000-0000 (Delight's Boutique). Send your proof of payment via WhatsApp after ordering.",
  cashInstructions: "Pay in cash when your order is delivered or picked up.",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  notifyByEmail: true,
  notificationEmail: "owner@delightsboutique.com",
  notifyByWhatsapp: true,
};

const STORAGE_KEY = "delight-boutique-site-settings";

export function getSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveSiteSettings(updates: Partial<SiteSettings>) {
  const next = { ...getSiteSettings(), ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked — the change still applies for this session.
  }
}

export function buildWhatsAppLink(phoneNumber: string, message: string) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
