import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATALOG_FILTERS,
  applyLocalCatalogFilters,
  catalogOptions,
  catalogRequestParams,
  catalogScope,
  mergeOptions,
} from "./catalog-filters";
import { makeProductDto } from "@/test/fixtures";
import type { Product } from "@/lib/types";
import { toProduct } from "@/lib/api/products";

function product(slug: string, overrides: Partial<Parameters<typeof makeProductDto>[0]> = {}): Product {
  return toProduct(makeProductDto({ slug, ...overrides }));
}

describe("catalogRequestParams", () => {
  it("sends no price bounds for All Prices", () => {
    const params = catalogRequestParams(DEFAULT_CATALOG_FILTERS);
    expect(params.minPrice).toBeUndefined();
    expect(params.maxPrice).toBeUndefined();
  });

  it("maps each price band to inclusive server bounds", () => {
    expect(catalogRequestParams({ ...DEFAULT_CATALOG_FILTERS, priceBand: 1 })).toMatchObject({
      maxPrice: 99.99,
    });
    expect(catalogRequestParams({ ...DEFAULT_CATALOG_FILTERS, priceBand: 2 })).toMatchObject({
      minPrice: 100,
      maxPrice: 250,
    });
    expect(catalogRequestParams({ ...DEFAULT_CATALOG_FILTERS, priceBand: 3 })).toMatchObject({
      minPrice: 250.01,
    });
  });

  it("omits empty size and colour lists", () => {
    const params = catalogRequestParams({ ...DEFAULT_CATALOG_FILTERS, sizes: ["M"], colors: [] });
    expect(params.size).toEqual(["M"]);
    expect(params.color).toBeUndefined();
  });
});

describe("applyLocalCatalogFilters", () => {
  const products = [
    product("cheap", { retailPrice: 80, sizes: ["S"], colors: ["Black"] }),
    product("edge-100", { retailPrice: 100, sizes: ["M"] }),
    product("edge-250", { retailPrice: 250, sizes: ["M", "L"] }),
    product("pricey", { retailPrice: 300, colors: ["Navy"] }),
  ];

  it("keeps the 100 and 250 edges in the middle band only", () => {
    const middle = applyLocalCatalogFilters(products, { ...DEFAULT_CATALOG_FILTERS, priceBand: 2 });
    expect(middle.map((p) => p.slug)).toEqual(["edge-100", "edge-250"]);
  });

  it("puts a 250 price in the middle band, not Over GH₵250", () => {
    const over = applyLocalCatalogFilters(products, { ...DEFAULT_CATALOG_FILTERS, priceBand: 3 });
    expect(over.map((p) => p.slug)).toEqual(["pricey"]);
  });

  it("matches sizes and colours as any-of", () => {
    const bySize = applyLocalCatalogFilters(products, { ...DEFAULT_CATALOG_FILTERS, sizes: ["L", "S"] });
    expect(bySize.map((p) => p.slug)).toEqual(["cheap", "edge-250"]);
    const byColor = applyLocalCatalogFilters(products, { ...DEFAULT_CATALOG_FILTERS, colors: ["Navy"] });
    expect(byColor.map((p) => p.slug)).toEqual(["pricey"]);
  });

  it("sorts by price when asked", () => {
    const sorted = applyLocalCatalogFilters(products, {
      ...DEFAULT_CATALOG_FILTERS,
      sort: "price-desc",
    });
    expect(sorted.map((p) => p.slug)).toEqual(["pricey", "edge-250", "edge-100", "cheap"]);
  });
});

describe("catalogScope", () => {
  it("carries only the price range, so facets count what the list shows", () => {
    expect(catalogScope({ ...DEFAULT_CATALOG_FILTERS, priceBand: 2, sizes: ["M"], sort: "rating" })).toEqual({
      minPrice: 100,
      maxPrice: 250,
    });
  });
});

describe("mergeOptions", () => {
  it("combines facet values with selections the facets don't list", () => {
    expect(mergeOptions(["L", "M"], ["XL", "M"])).toEqual(["L", "M", "XL"]);
  });
});

describe("catalogOptions", () => {
  it("lists loaded values and keeps selected values that are not loaded", () => {
    const products = [product("a", { sizes: ["M"] }), product("b", { sizes: ["S", "M"] })];
    expect(catalogOptions(products, ["XL"], "sizes")).toEqual(["M", "S", "XL"]);
  });
});
