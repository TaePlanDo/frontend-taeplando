import type { ComponentProps } from "react";

const EXERCISE_IMAGE_FALLBACK = "/exercise-icon.png";

type ExerciseImageProps = Omit<ComponentProps<"img">, "src"> & {
  src?: string | null;
  forceFallback?: boolean;
};

export function ExerciseImage({
  src,
  forceFallback = false,
  alt = "",
  onError,
  ...props
}: ExerciseImageProps) {
  return (
    <img
      src={
        forceFallback
          ? EXERCISE_IMAGE_FALLBACK
          : (src ?? EXERCISE_IMAGE_FALLBACK)
      }
      alt={alt}
      onError={(event) => {
        event.currentTarget.src = EXERCISE_IMAGE_FALLBACK;
        onError?.(event);
      }}
      {...props}
    />
  );
}
