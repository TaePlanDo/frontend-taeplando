type PersonalDataItemProps = {
  title: string;
  value: string;
};

export function PersonalDataItem({ title, value }: PersonalDataItemProps) {
  return (
    <div className="min-w-0 space-y-2">
      <dt className="text-base font-semibold text-primary">{title}</dt>
      <dd className="text-lg text-foreground [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}
