import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { CatalogReference } from "@/types/exercise";

type PlanEquipmentSectionProps = {
  equipment: CatalogReference[];
};

export function PlanEquipmentSection({ equipment }: PlanEquipmentSectionProps) {
  return (
    <Card className="gap-4 rounded-2xl border-border bg-card/40 p-4 shadow-none sm:p-5">
      <CardTitle className="text-base text-foreground">
        Sprzęt dostępny na sali
      </CardTitle>
      <CardContent className="px-0">
        {equipment.length ? (
          <ul className="flex flex-wrap gap-2">
            {equipment.map((item) => (
              <li key={item.id}>
                <CardItemBadge className="border border-primary/70 px-4 py-1.5 text-sm text-foreground">
                  {item.name}
                </CardItemBadge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Brak</p>
        )}
      </CardContent>
    </Card>
  );
}
