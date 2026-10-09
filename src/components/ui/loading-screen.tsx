type LoadingScreenProps = {
  label?: string;
};

export function LoadingScreen({ label = "Ładowanie…" }: LoadingScreenProps) {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#181818] text-white"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="size-10 animate-spin rounded-full border-2 border-[#FFC7B3]/30 border-t-[#EC6212] [animation-duration:0.5s]"
        aria-hidden
      />
      <p className="text-base">{label}</p>
    </div>
  );
}
