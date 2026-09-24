export interface StaticPage {
  title: string;
  /** Paragraphs, separated by a blank line. */
  body: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PagesContent {
  about: StaticPage;
  shipping: StaticPage;
  returns: StaticPage;
  terms: StaticPage;
  privacy: StaticPage;
  faqs: FaqItem[];
}

export const DEFAULT_PAGES_CONTENT: PagesContent = {
  about: {
    title: "About Us",
    body:
      "Delight's Boutique is a Ghana-based retailer and wholesaler of ladies' corporate and casual wear, footwear, bags, fabrics, and jewellery.\n\nWe serve both individual shoppers and bulk buyers, with wholesale pricing available on qualifying orders.",
  },
  shipping: {
    title: "Shipping & Delivery",
    body:
      "We offer delivery within Accra and pickup at our store.\n\nDelivery time and cost are confirmed with you directly after you place an order — reach out on WhatsApp if you need an estimate before ordering.",
  },
  returns: {
    title: "Return Policy",
    body:
      "If an item arrives damaged or isn't what you ordered, contact us within 48 hours of delivery or pickup and we'll arrange a replacement or refund.\n\nItems must be unworn and in their original condition. Custom or made-to-order pieces are not eligible for return.",
  },
  terms: {
    title: "Terms of Service",
    body:
      "By ordering from Delight's Boutique, you agree to pay the price shown for each item at the time of ordering, in the payment method you select at checkout.\n\nOrders are confirmed once payment is verified — see our Return Policy for what happens if an item arrives damaged or incorrect.\n\nProduct photos are representative; minor variations in color or pattern (especially for fabrics and prints) can occur.",
  },
  privacy: {
    title: "Privacy Policy",
    body:
      "We collect only what's needed to fulfil your order: your name, phone number, and delivery address if applicable.\n\nWe don't sell or share your information with third parties. Your phone number is used to look up your orders under \"Track My Order\" and to contact you about your order.\n\nIf you have questions about your data, reach out to us on WhatsApp or by phone.",
  },
  faqs: [
    {
      id: "faq-1",
      question: "Do you offer wholesale pricing?",
      answer:
        "Yes — wholesale pricing and minimum order quantities are shown on eligible products, or message us on WhatsApp to get set up.",
    },
    {
      id: "faq-2",
      question: "How do I pay for my order?",
      answer:
        "We accept bank transfer, mobile money, and cash on delivery/pickup. You'll choose your method at checkout.",
    },
    {
      id: "faq-3",
      question: "Can I track my order?",
      answer: 'Yes — use "Track My Order" in the footer and enter the phone number you used at checkout.',
    },
  ],
};

const STORAGE_KEY = "delight-boutique-pages-content";

export function getPagesContent(): PagesContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PAGES_CONTENT, ...JSON.parse(raw) } : DEFAULT_PAGES_CONTENT;
  } catch {
    return DEFAULT_PAGES_CONTENT;
  }
}

function writePagesContent(content: PagesContent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch {
    // Storage may be full or blocked — the change still applies for this session.
  }
}

export function saveStaticPage(
  key: "about" | "shipping" | "returns" | "terms" | "privacy",
  page: StaticPage,
) {
  writePagesContent({ ...getPagesContent(), [key]: page });
}

export function saveFaqs(faqs: FaqItem[]) {
  writePagesContent({ ...getPagesContent(), faqs });
}
