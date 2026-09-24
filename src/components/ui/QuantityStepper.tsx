interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ quantity, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-border-subtle">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-9 w-9 items-center justify-center text-lg text-foreground/70 hover:text-primary"
      >
        &minus;
      </button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="flex h-9 w-9 items-center justify-center text-lg text-foreground/70 hover:text-primary"
      >
        +
      </button>
    </div>
  );
}
