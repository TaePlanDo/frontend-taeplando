import { Clock, Pencil, Trash2, User } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Group } from "@/types/group";

interface GroupCardItemProps {
  group: Group;
}

export function GroupCardItem({ group }: GroupCardItemProps) {
  return (
    <Card className="gap-3 rounded-xl border-[#2A2433] bg-transparent py-4 text-white shadow-none">
      <CardHeader className="items-start px-6">
        <CardTitle>
          <h3 className="text-lg font-semibold">{group.name}</h3>
        </CardTitle>
        <CardAction className="text-xs text-white/80">
          Utworzono 3 dni temu
        </CardAction>
      </CardHeader>
      <Separator className="bg-[#2A2433]" />
      <CardContent className="flex flex-wrap gap-2 px-6">
        <CardItemBadge icon={<Clock className="h-3.5 w-3.5" />}>
          {group.duration_minutes} min
        </CardItemBadge>
        <CardItemBadge icon={<User className="h-3.5 w-3.5" />}>
          {group.min_age}-{group.max_age} lat
        </CardItemBadge>
      </CardContent>
      <CardFooter className="justify-end gap-2 px-6">
        <CardItemActionButton icon={<Pencil className="h-4 w-4" />}>
          Edytuj
        </CardItemActionButton>
        <CardItemActionButton
          icon={<Trash2 className="h-4 w-4" />}
          className="text-[#F27229] hover:bg-[#F27229]/10"
        >
          Usuń
        </CardItemActionButton>
      </CardFooter>
    </Card>
  );
}
