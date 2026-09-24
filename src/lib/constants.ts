export const SITE = {
  name: "Delight's Boutique",
  tagline: "Corporate & casual wear, footwear, bags, fabrics and jewellery.",
  whatsappNumber: "233240000000",
  whatsappMessage: "Hello Delight's Boutique, I'd like to ask about a product.",
  phoneDisplay: "+233 24 000 0000",
  address: "Ring Road Central, Accra, Ghana",
  hours: "Mon – Sat, 9am – 6pm",
  announcement: "Wholesale & retail welcome — order today, pay on confirmation.",
};

export const NAV_LINKS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Dresses", href: "/category/dresses" },
  { label: "Footwear", href: "/category/footwear" },
  { label: "Bags", href: "/category/bags" },
  { label: "Fabrics", href: "/category/fabrics" },
  { label: "Jewellery", href: "/category/jewellery" },
];

export const MORE_LINKS = [
  { label: "Accessories", href: "/category/accessories" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Contact", href: "/contact" },
];

export function buildWhatsAppLink(message: string = SITE.whatsappMessage) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
