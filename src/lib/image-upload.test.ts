import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server, API } from "@/test/server";
import { ApiError } from "@/lib/api/client";
import { uploadErrorMessage, uploadImage } from "./image-upload";
import { resolveAssetUrl } from "./asset-url";

describe("uploadImage", () => {
  it("posts the photo as multipart form data and returns its URL", async () => {
    let contentType = "";
    server.use(
      http.post(`${API}/api/admin/uploads/images`, ({ request }) => {
        contentType = request.headers.get("content-type") ?? "";
        return HttpResponse.json({ url: "/files/uploads/a.jpg", width: 1000, height: 750 }, { status: 201 });
      }),
    );

    const url = await uploadImage(new File(["bytes"], "scarf.jpg", { type: "image/jpeg" }));

    expect(url).toBe("/files/uploads/a.jpg");
    expect(contentType).toMatch(/^multipart\/form-data/);
  });
});

describe("uploadErrorMessage", () => {
  it("prefers the field message from the API", () => {
    const err = new ApiError(400, "VALIDATION_ERROR", "One or more fields are invalid.", {
      file: "File exceeds 5MB.",
    });
    expect(uploadErrorMessage(err)).toBe("File exceeds 5MB.");
  });

  it("falls back to a generic message for unexpected failures", () => {
    expect(uploadErrorMessage(new Error("network down"))).toMatch(/couldn't upload/i);
  });
});

describe("resolveAssetUrl", () => {
  it("resolves API paths against the API host", () => {
    expect(resolveAssetUrl("/files/uploads/a.jpg")).toBe("https://api.test.invalid/files/uploads/a.jpg");
  });

  it("leaves absolute and data URLs alone", () => {
    expect(resolveAssetUrl("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
    expect(resolveAssetUrl("data:image/jpeg;base64,AAAA")).toBe("data:image/jpeg;base64,AAAA");
  });
});
