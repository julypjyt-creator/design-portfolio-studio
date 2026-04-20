import { cn } from "@/lib/utils";

export function Chip({
  children,
  tone = "default"
}: {
  children: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
        tone === "accent"
          ? "border-accent/20 bg-accent/10 text-accent"
          : "border-line bg-panel text-stone"
      )}
    >
      {children}
    </span>
  );
}
