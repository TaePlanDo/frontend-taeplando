type ExerciseStatBlockProps = {
  label: string;
  value: string;
};

export function ExerciseStatBlock({ label, value }: ExerciseStatBlockProps) {
  return (
    <div className="flex flex-col gap-2 border-2 px-4 py-2 rounded-2xl">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
