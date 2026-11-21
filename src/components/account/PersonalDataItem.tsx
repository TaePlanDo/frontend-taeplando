import { useState, type ComponentType } from "react";

import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { Button } from "@/components/ui/button";

type PersonalDataItemProps = {
  title: string;
  value: string;
  edit?: {
    buttonLabel: string;
    title: string;
    description: string;
    Form: ComponentType<{ onClose: () => void }>;
  };
};

export function PersonalDataItem({
  title,
  value,
  edit,
}: PersonalDataItemProps) {
  const [isEditing, setEditing] = useState(false);

  return (
    <div className="min-w-0 space-y-1 border-b border-foreground/20 py-4">
      <dt className="text-xs font-medium text-primary">{title}</dt>
      <dd className="flex min-w-0 items-center justify-between gap-4">
        <span className="min-w-0 text-base text-foreground [overflow-wrap:anywhere]">
          {value}
        </span>
        {edit ? (
          <CustomizedDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                aria-label={edit.buttonLabel}
                className="h-7 rounded-full border-primary bg-transparent px-4 text-xs hover:bg-primary/10 dark:border-primary dark:bg-transparent dark:hover:bg-primary/10"
              >
                Zmień
              </Button>
            }
            title={edit.title}
            description={edit.description}
            open={isEditing}
            onOpenChange={setEditing}
          >
            <edit.Form onClose={() => setEditing(false)} />
          </CustomizedDialog>
        ) : null}
      </dd>
    </div>
  );
}
