import { cn } from "cn";

interface BackgroundDotsProps {
  className?: string;
  width?: number;
  height?: number;
}

export function BackgroundDots({
  className,
  width,
  height,
}: BackgroundDotsProps) {
  return (
    <img
      src="/background-dot-details.png"
      alt=""
      aria-hidden
      className={cn(
        className,
        "pointer-events-none absolute -z-10 hidden w-auto -translate-y-1/2 select-none lg:block",
      )}
      width={width}
      height={height}
    />
  );
}
