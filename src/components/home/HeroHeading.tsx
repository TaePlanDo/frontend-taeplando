import { cn } from "@/lib/utils";

const brandGlow = {
  textShadow:
    "0 0 28px rgba(180, 60, 10, 0.35), 0 0 64px rgba(200, 80, 15, 0.28), 0 0 110px rgba(160, 50, 8, 0.2)",
};

type HeroHeadingProps = {
  className?: string;
};

export function HeroHeading({ className }: HeroHeadingProps) {
  return (
    <h1
      className={cn(
        "lg:text-5xl text-4xl leading-[1.15] font-extrabold tracking-tight text-[#CC7979] lg:w-120",
        className,
      )}
      style={brandGlow}
    >
      Zaplanuj sztuki walki
      <span className="mt-3 block whitespace-nowrap">
        z <span className="text-6xl text-[#C22108]">TaePlanDo</span>
      </span>
    </h1>
  );
}
