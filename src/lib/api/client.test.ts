import { describe, expect, it } from "vitest";
import { ApiError, describeApiError, shouldRetryQuery } from "@/lib/api/client";

describe("shouldRetryQuery", () => {
  it("never retries client errors, including 404 and 429", () => {
    expect(shouldRetryQuery(0, new ApiError(404, "UNKNOWN", "nope"))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError(429, "RATE_LIMITED", "slow down"))).toBe(false);
  });

  it("retries transient failures up to twice", () => {
    expect(shouldRetryQuery(0, new TypeError("Failed to fetch"))).toBe(true);
    expect(shouldRetryQuery(1, new ApiError(503, "INTERNAL_ERROR", "down"))).toBe(true);
    expect(shouldRetryQuery(2, new TypeError("Failed to fetch"))).toBe(false);
  });
});

describe("describeApiError", () => {
  it("includes the server's wait time for rate-limited requests", () => {
    const err = new ApiError(429, "RATE_LIMITED", "Too many", undefined, 30);
    expect(describeApiError(err, "fallback")).toBe(
      "Too many attempts. Please wait 30 seconds and try again.",
    );
  });

  it("uses singular 'second' for a one-second wait", () => {
    const err = new ApiError(429, "RATE_LIMITED", "Too many", undefined, 1);
    expect(describeApiError(err, "fallback")).toContain("wait 1 second ");
  });

  it("falls back to a generic minute-long message when no Retry-After was sent", () => {
    const err = new ApiError(429, "RATE_LIMITED", "Too many");
    expect(describeApiError(err, "fallback")).toBe(
      "Too many attempts. Please wait a minute and try again.",
    );
  });

  it("passes through known server messages and uses the fallback for unknown ones", () => {
    expect(describeApiError(new ApiError(400, "VALIDATION_ERROR", "Bad input"), "fallback")).toBe(
      "Bad input",
    );
    expect(describeApiError(new ApiError(400, "UNKNOWN", "raw"), "fallback")).toBe("fallback");
    expect(describeApiError(new TypeError("offline"), "fallback")).toBe("fallback");
  });
});
