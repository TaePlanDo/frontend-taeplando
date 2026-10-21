import type { ImgHTMLAttributes } from "react";

import { cn } from "cn";

type LogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height"
> & {
  width?: number | string;
  height?: number | string;
  alt?: string;
  shadow?: boolean;
};

function LogoBased({ width, height, alt, className, ...props }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      className={cn("object-contain", className)}
      {...props}
    />
  );
}

export function Logo({
  width,
  height,
  alt = "TaePlanDo",
  className,
  shadow = false,
  ...props
}: LogoProps) {
  if (!shadow) {
    return (
      <LogoBased
        width={width}
        height={height}
        className={className}
        alt={alt}
        {...props}
      />
    );
  }

  return (
    <div className="relative">
      <LogoBased
        width={width}
        height={height}
        alt={alt}
        className={className}
        {...props}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/5 to-transparent" />
    </div>
  );
}
