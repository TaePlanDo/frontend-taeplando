import type { ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type LogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height"
> & {
  width?: number | string;
  height?: number | string;
  alt?: string;
};

export function Logo({
  width,
  height,
  alt = "TaePlanDo",
  className,
  ...props
}: LogoProps) {
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
