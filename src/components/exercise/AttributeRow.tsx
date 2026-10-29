import { AttributeBadges } from "./AttributeBadges";

type AttributeRowProps = {
  label: string;
  names: string[];
  className: string;
};

export function AttributeRow({ label, names, className }: AttributeRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-base font-bold text-foreground">{label}</h4>
      {names.length ? (
        <AttributeBadges label={label} names={names} className={className} />
      ) : (
        <p className="text-sm text-muted-foreground">Brak</p>
      )}
    </div>
  );
}
