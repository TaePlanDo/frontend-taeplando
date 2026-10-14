import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

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

const navButtonClass =
  "inline-flex size-9 items-center justify-center gap-1 rounded-md text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40 lg:size-auto lg:px-3";

const pageButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function CustomizedPagination({
  pagesNumber,
  currentPage,
  goToPage,
  className,
}: CustomizedPaginationProps) {
  if (pagesNumber <= 1) return null;

  const items = getPageItems(pagesNumber, currentPage);

  return (
    <nav
      className={cn("flex items-center justify-center gap-2", className)}
      aria-label="Paginacja"
    >
      <button
        type="button"
        className={navButtonClass}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Poprzednia strona"
      >
        <ChevronLeft className="size-4 lg:hidden" aria-hidden />
        <span className="hidden lg:inline">Poprzedni</span>
      </button>

      <div className="flex items-center gap-1">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-9 items-center justify-center text-white/60"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={cn(
                pageButtonClass,
                item === currentPage
                  ? "bg-[#EC6212] text-[#181818] hover:text-[#181818]"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
              onClick={() => goToPage(item)}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className={navButtonClass}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= pagesNumber}
        aria-label="Następna strona"
      >
        <span className="hidden lg:inline">Następny</span>
        <ChevronRight className="size-4 lg:hidden" aria-hidden />
      </button>
    </nav>
  );
}
