export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Chargement..."
    />
  );
}
