import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "cn";

type PageItem = number | "ellipsis";

type CustomizedPaginationProps = {
  pagesNumber: number;
  currentPage: number;
  goToPage: (page: number) => void;
  className?: string;
};

function getPageItems(pagesNumber: number, currentPage: number): PageItem[] {
  if (pagesNumber <= 7) {
    return Array.from({ length: pagesNumber }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pagesNumber - 1, currentPage + 1);

  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pagesNumber - 1) items.push("ellipsis");

  items.push(pagesNumber);
  return items;
}

const navLinkClass =
  "gap-1 text-foreground/80 hover:bg-transparent hover:text-foreground lg:size-auto lg:px-3";

const pageLinkClass =
  "rounded-full text-foreground/80 hover:bg-foreground/10 hover:text-foreground";

export function CustomizedPagination({
  pagesNumber,
  currentPage,
  goToPage,
  className,
}: CustomizedPaginationProps) {
  if (pagesNumber <= 1) return null;

  const items = getPageItems(pagesNumber, currentPage);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= pagesNumber;

  return (
    <Pagination className={className} aria-label="Paginacja">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Poprzednia strona"
            aria-disabled={isFirstPage}
            className={cn(
              navLinkClass,
              isFirstPage && "pointer-events-none opacity-40",
            )}
            onClick={(event) => {
              event.preventDefault();
              goToPage(currentPage - 1);
            }}
          >
            <ChevronLeft className="size-4 lg:hidden" aria-hidden />
            <span className="hidden lg:inline">Poprzedni</span>
          </PaginationLink>
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis className="text-foreground/60" />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                className={cn(
                  pageLinkClass,
                  item === currentPage &&
                    "border-transparent bg-primary text-background hover:bg-primary hover:text-background",
                )}
                onClick={(event) => {
                  event.preventDefault();
                  goToPage(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Następna strona"
            aria-disabled={isLastPage}
            className={cn(
              navLinkClass,
              isLastPage && "pointer-events-none opacity-40",
            )}
            onClick={(event) => {
              event.preventDefault();
              goToPage(currentPage + 1);
            }}
          >
            <span className="hidden lg:inline">Następny</span>
            <ChevronRight className="size-4 lg:hidden" aria-hidden />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
