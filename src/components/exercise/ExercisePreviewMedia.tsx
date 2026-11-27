import { useState } from "react";

import { useTheme } from "@/hooks/useTheme";
import type { ExerciseDetails } from "@/types/exercise";

export function ExercisePreviewMedia({
  exercise,
}: {
  exercise: ExerciseDetails;
}) {
  const { theme } = useTheme();
  const animation =
    theme === "light" ? exercise.animation_url_light : exercise.animation_url;
  const thumbnail =
    theme === "light" ? exercise.image_url_light : exercise.image_url;
  const placeholder = `/exercise-placeholder-${theme}.svg`;

  return (
    <PreviewImage
      key={JSON.stringify([animation, thumbnail, placeholder])}
      animation={animation}
      thumbnail={thumbnail}
      placeholder={placeholder}
    />
  );
}

function PreviewImage({
  animation,
  thumbnail,
  placeholder,
}: {
  animation: string | null;
  thumbnail: string | null;
  placeholder: string;
}) {
  const [animationStatus, setAnimationStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const showAnimation = animation && animationStatus !== "error";

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
      {animationStatus !== "loaded" && (
        <img
          src={thumbnail && !thumbnailFailed ? thumbnail : placeholder}
          alt=""
          loading="lazy"
          className="size-full object-contain"
          onError={() => setThumbnailFailed(true)}
        />
      )}
      {showAnimation && (
        <img
          src={animation}
          alt=""
          loading="lazy"
          className={`absolute inset-0 size-full object-contain ${animationStatus === "loading" ? "invisible" : ""}`}
          onLoad={() => setAnimationStatus("loaded")}
          onError={() => setAnimationStatus("error")}
        />
      )}
    </div>
  );
}
