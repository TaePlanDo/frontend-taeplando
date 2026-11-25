import { useState } from "react";

import { useTheme } from "@/hooks/useTheme";

type ExerciseThumbnailProps = {
  darkUrl: string | null;
  lightUrl: string | null;
  isOffline: boolean;
};

export function ExerciseThumbnail({
  darkUrl,
  lightUrl,
  isOffline,
}: ExerciseThumbnailProps) {
  const { theme } = useTheme();
  const placeholder = `/exercise-placeholder-${theme}.svg`;
  const src = isOffline ? null : theme === "light" ? lightUrl : darkUrl;

  return (
    <ThumbnailImage
      key={`${src ?? ""}:${placeholder}`}
      src={src}
      placeholder={placeholder}
    />
  );
}

function ThumbnailImage({
  src,
  placeholder,
}: {
  src: string | null;
  placeholder: string;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "loaded",
  );
  const showPlaceholder = !src || status === "error";

  return (
    <div className="pointer-events-none relative size-22 shrink-0 overflow-hidden rounded-2xl bg-muted">
      {status === "loading" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-muted-foreground/20"
          data-testid="thumbnail-skeleton"
        />
      )}
      <img
        src={showPlaceholder ? placeholder : src}
        alt=""
        loading="lazy"
        className={`size-full object-cover ${status === "loading" ? "invisible" : ""}`}
        onLoad={() => {
          if (!showPlaceholder) setStatus("loaded");
        }}
        onError={() => {
          if (!showPlaceholder) setStatus("error");
        }}
      />
    </div>
  );
}
