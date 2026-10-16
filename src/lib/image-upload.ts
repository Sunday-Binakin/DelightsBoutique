import { apiFetch, ApiError } from "@/lib/api/client";

interface UploadedImage {
  url: string;
  width: number;
  height: number;
}

/** Uploads a photo; the API resizes it and returns the path it is served from. */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const uploaded = await apiFetch<UploadedImage>("/api/admin/uploads/images", {
    method: "POST",
    formData,
  });
  return uploaded.url;
}

export function uploadErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.fields?.file) return err.fields.file;
  if (err instanceof ApiError && err.code !== "UNKNOWN") return err.message;
  return "Couldn't upload that photo. Try a smaller image or try again.";
}
