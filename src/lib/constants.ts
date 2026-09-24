export const SITE = {
  name: "Delight's Boutique",
};

// Fixed nav entries that aren't categories — category links themselves are
// derived live from the categories store (see MainNav.tsx), so renaming,
// adding, or removing a category never requires a code change here.
export const UTILITY_LINKS = [
  { label: "Wholesale", href: "/wholesale" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Contact", href: "/contact" },
];
