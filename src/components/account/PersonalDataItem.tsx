import { Separator } from "@/components/ui/separator";

type PersonalDataItemProps = {
  title: string;
  value: string;
  separator?: boolean;
};

export function PersonalDataItem({
  title,
  value,
  separator = true,
}: PersonalDataItemProps) {
  return (
    <>
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <p className="text-lg text-foreground">{value}</p>
      {separator && <Separator />}
    </>
  );
}
