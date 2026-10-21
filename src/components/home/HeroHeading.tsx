import { cn } from "cn";

type HeroHeadingProps = {
  className?: string;
};

export function HeroHeading({ className }: HeroHeadingProps) {
  return (
    <h1
      className={cn(
        "lg:text-5xl text-4xl leading-[1.15] font-extrabold tracking-tight text-foreground lg:w-120 text-glow-primary",
        className,
      )}
    >
      Zaplanuj sztuki walki
      <span className="mt-3 block whitespace-nowrap">
        z <span className="text-6xl text-primary">TaePlanDo</span>
      </span>
    </h1>
  );
}
