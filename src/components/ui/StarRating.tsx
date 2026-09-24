const STAR = "★";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
}

export function StarRating({ rating, reviewCount }: StarRatingProps) {
  const filled = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span aria-hidden className="tracking-tight text-accent">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < filled ? "text-accent" : "text-border-subtle"}>
            {STAR}
          </span>
        ))}
      </span>
      <span className="text-muted-foreground">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" && ` (${reviewCount})`}
      </span>
    </div>
  );
}
