"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUploadProducts } from "@/lib/api/products";
import { ApiError, describeApiError } from "@/lib/api/client";
import type { BulkUploadResult } from "@/lib/api/types";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/admin/Breadcrumb";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const COLUMNS =
  "slug, name, categorySlug, description, retailPrice, wholesalePrice, wholesaleMoq, compareAtPrice, tone, badge, stockStatus, sizes, colors, imageUrls";

export default function BulkProductUploadPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState("");
  const upload = useMutation({
    mutationFn: (chosen: File) => bulkUploadProducts(chosen),
    onSuccess: (result: BulkUploadResult) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${result.successCount} product${result.successCount === 1 ? "" : "s"} imported.`);
    },
  });

  function handleFileChange(chosen: File | undefined) {
    setClientError("");
    upload.reset();
    if (!chosen) {
      setFile(null);
      return;
    }
    if (chosen.size > MAX_FILE_BYTES) {
      setFile(null);
      setClientError("That file is over 2MB. Split it into smaller files.");
      return;
    }
    setFile(chosen);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (file) upload.mutate(file);
  }

  const uploadError =
    upload.error instanceof ApiError && upload.error.fields?.file
      ? upload.error.fields.file
      : describeApiError(upload.error, "Couldn't upload that file. Try again.");

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Bulk Upload" },
        ]}
      />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Bulk Product Upload</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Upload a CSV with one product per row. Existing slugs are rejected, not updated. Up to 1,000
        rows and 2MB per file. Separate multiple sizes, colours or image URLs with semicolons.
      </p>
      <p className="mt-3 max-w-2xl rounded-lg bg-muted px-3.5 py-2.5 font-mono text-xs text-foreground/80">
        {COLUMNS}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={upload.isPending}
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          className="text-sm text-foreground file:mr-4 file:rounded-full file:border file:border-border-subtle file:bg-background file:px-4 file:py-2 file:text-sm file:font-medium"
        />
        {clientError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {clientError}
          </p>
        )}
        {upload.isError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {uploadError}
          </p>
        )}
        <Button type="submit" disabled={!file || upload.isPending} className="self-start">
          {upload.isPending ? "Uploading…" : "Upload Products"}
        </Button>
      </form>

      {upload.data && (
        <section className="mt-8 max-w-3xl">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {upload.data.successCount} imported, {upload.data.errorCount} failed
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {upload.data.rows.map((row) => (
                  <tr key={row.rowNumber} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{row.rowNumber}</td>
                    <td className="px-4 py-3 text-foreground">{row.slug ?? "—"}</td>
                    <td className="px-4 py-3">
                      {row.success ? (
                        <span className="text-primary">Imported</span>
                      ) : (
                        <span className="text-red-700">{row.error ?? "Failed"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
