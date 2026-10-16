import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";

// Site-wide fallback share-preview image — every route inherits this
// unless it defines its own opengraph-image.tsx. Product/category photos
// are inline data URLs on the API records, so they aren't used here; this is
// the substitute until the backend serves photos at URLs we can fetch.
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0550c2 0%, #bf5501 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -1 }}>{SITE.name}</div>
        <div
          style={{
            marginTop: 22,
            fontSize: 30,
            color: "#cfe0f7",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          {DEFAULT_SITE_SETTINGS.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
