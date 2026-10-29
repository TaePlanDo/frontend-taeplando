import { Clock, LayoutList, Pencil, Trash2, User } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import { Separator } from "@/components/ui/separator";
import { formatGroupActivity } from "@/lib/format/date-to-text";
import { formatDuration } from "@/lib/format/time";
import type { Group } from "@/types/group";

interface GroupCardItemProps {
  group: Group;
  onEdit: () => void;
  onEditSchema: () => void;
  onDelete: () => void | Promise<void>;
}

export function GroupCardItem({
  group,
  onEdit,
  onEditSchema,
  onDelete,
}: GroupCardItemProps) {
  return (
    <Card className="gap-3 rounded-xl bg-transparent py-4 text-foreground shadow-none">
      <CardHeader className="items-start px-6 h-16">
        <CardTitle>
          <h3 className="line-clamp-2 break-words text-lg font-semibold w-60 mr-4">
            {group.name}
          </h3>
        </CardTitle>
        <CardAction className="text-xs text-foreground/80 break-words">
          {formatGroupActivity(group.created_at, group.updated_at)}
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-wrap gap-2 px-6">
        <CardItemBadge icon={<Clock className="h-5 w-5" />}>
          {formatDuration(group.duration_minutes)}
        </CardItemBadge>
        <CardItemBadge icon={<User className="h-5 w-5" />}>
          {group.min_age}-{group.max_age} lat
        </CardItemBadge>
      </CardContent>
      <CardFooter className="justify-end gap-2 px-6">
        <CardItemActionButton
          icon={<Pencil className="h-4 w-4" />}
          onClick={onEdit}
        >
          Edytuj
        </CardItemActionButton>
        <CardItemActionButton
          icon={<LayoutList className="h-4 w-4" />}
          onClick={onEditSchema}
        >
          Schemat
        </CardItemActionButton>
        <CustomizedAlertDialog
          trigger={
            <CardItemActionButton
              icon={<Trash2 className="h-4 w-4" />}
              className="text-primary hover:bg-primary/10"
            >
              Usuń
            </CardItemActionButton>
          }
          title="Usuwanie"
          message={`Czy na pewno chcesz usunąć "${group.name}"? Nie da się cofnąć tej operacji`}
          onSubmit={onDelete}
        />
      </CardFooter>
    </Card>
  );
}
