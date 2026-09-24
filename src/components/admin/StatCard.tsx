import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number | string;
  tone?: "default" | "warning";
  href?: string;
}

export function StatCard({ label, value, tone = "default", href }: StatCardProps) {
  const content = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone === "warning" ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-border-subtle p-5 transition-colors hover:border-primary hover:bg-muted/40"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-xl border border-border-subtle p-5">{content}</div>;
}
