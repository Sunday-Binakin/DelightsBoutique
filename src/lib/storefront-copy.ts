export interface TrustBadgeCopy {
  title: string;
  description: string;
  ctaLabel: string;
}

export interface StorefrontCopy {
  trustBadges: [TrustBadgeCopy, TrustBadgeCopy, TrustBadgeCopy];
  contactHeading: string;
  contactSubtext: string;
  wholesaleIntro: string;
  wholesaleWhatsappMessage: string;
  newArrivalsTitle: string;
  newArrivalsSubtitle: string;
  bestSellersTitle: string;
  bestSellersSubtitle: string;
  newsletterHeading: string;
  newsletterSubtext: string;
  newsletterSuccessMessage: string;
  cartDisclaimer: string;
  checkoutDisclaimer: string;
  trackOrderHeading: string;
  trackOrderSubtext: string;
  categoryGridEyebrow: string;
  categoryGridTitle: string;
}

// Storefront copy that isn't tied to a specific page/section editor already
// (banners, collection tabs, flash sale, site settings, static pages) — the
// odds and ends of homepage/section text, editable from /admin/content.
export const DEFAULT_STOREFRONT_COPY: StorefrontCopy = {
  trustBadges: [
    {
      title: "Browse our FAQs",
      description: "Answers about sizing, ordering, and payment.",
      ctaLabel: "Read FAQs",
    },
    {
      title: "Chat with Us",
      description: "Questions before you order? Message us directly.",
      ctaLabel: "Chat on WhatsApp",
    },
    {
      title: "Delivery & Returns",
      description: "Delivery, pickup, and return policy details.",
      ctaLabel: "Read More",
    },
  ],
  contactHeading: "Get in Touch",
  contactSubtext: "Questions about an order, sizing, or wholesale pricing? Reach us any of these ways.",
  wholesaleIntro:
    "Every item below ships at a discounted wholesale price once you order at or above its minimum order quantity (MOQ), shown on each product. Wholesale accounts are set up by our team — message us on WhatsApp with what you're looking to stock and we'll get you set up.",
  wholesaleWhatsappMessage: "Hello Delight's Boutique, I'd like to ask about wholesale pricing.",
  newArrivalsTitle: "New Arrivals",
  newArrivalsSubtitle:
    "The latest pieces added to the catalog, across dresses, footwear, bags, fabrics and jewellery.",
  bestSellersTitle: "Best Sellers",
  bestSellersSubtitle: "Customer favorites across the catalog — the pieces people keep coming back for.",
  newsletterHeading: "Join Our Newsletter",
  newsletterSubtext: "Be the first to hear about new arrivals, restocks, and offers. Unsubscribe any time.",
  newsletterSuccessMessage: "Thanks for subscribing — watch your inbox!",
  cartDisclaimer:
    "Delivery/pickup and final payment are arranged with the admin after you submit your order — no payment is taken on this site.",
  checkoutDisclaimer:
    'Your order will be marked "Pending Confirmation" — we\'ll reach out on WhatsApp or by phone to confirm payment and delivery.',
  trackOrderHeading: "Track My Order",
  trackOrderSubtext: "Enter the phone number you used at checkout to see all your orders.",
  categoryGridEyebrow: "Shop by Category",
  categoryGridTitle: "Our Full Catalog",
};

