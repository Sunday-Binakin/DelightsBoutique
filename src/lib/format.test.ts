import { describe, expect, it } from "vitest";
import { formatPrice, slugify, timeAgo } from "@/lib/format";

describe("formatPrice", () => {
  it("formats a whole number as Ghana Cedis with no decimals", () => {
    expect(formatPrice(350)).toBe("GH₵350");
  });

  it("rounds off fractional amounts", () => {
    expect(formatPrice(19.99)).toBe("GH₵20");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("GH₵0");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Ada Corporate Dress")).toBe("ada-corporate-dress");
  });

  it("strips punctuation and collapses repeated separators", () => {
    expect(slugify("Amara's Ankara Print (6 yds)!")).toBe("amara-s-ankara-print-6-yds");
  });

  it("trims leading/trailing hyphens produced by leading/trailing junk", () => {
    expect(slugify("  --Sunglasses--  ")).toBe("sunglasses");
  });

  it("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("timeAgo", () => {
  it("reports 'just now' for a timestamp less than a minute old", () => {
    expect(timeAgo(new Date().toISOString())).toBe("just now");
  });

  it("reports whole minutes for a recent timestamp", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinutesAgo)).toBe("5m ago");
  });

  it("reports whole hours once past 60 minutes", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(threeHoursAgo).not.toBe(undefined);
    expect(timeAgo(threeHoursAgo)).toBe("3h ago");
  });

  it("reports whole days once past 24 hours", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe("2d ago");
  });
});
