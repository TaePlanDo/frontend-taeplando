import { cn } from "cn";

interface HeroDescriptionProps {
  className?: string;
  description: string;
}

export function HeroDescription({
  className,
  description,
}: HeroDescriptionProps) {
  return (
    <p className={cn("mt-4 text-xl text-secondary lg:flex hidden", className)}>
      {description}
    </p>
  );
}
