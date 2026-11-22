import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PageJumpFormProps = {
  pagesNumber: number;
  goToPage: (page: number) => void;
};

function parsePageNumber(value: string): number | null {
  const parsedPage = Number(value);

  if (value.trim() === "" || !Number.isInteger(parsedPage)) {
    return null;
  }

  return parsedPage;
}

export function PageJumpForm({ pagesNumber, goToPage }: PageJumpFormProps) {
  const [pageInput, setPageInput] = useState("");

  return (
    <form
      noValidate
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        const targetPage = parsePageNumber(pageInput);
        setPageInput("");

        if (targetPage !== null) {
          goToPage(targetPage);
        }
      }}
    >
      <Input
        type="number"
        min={1}
        max={pagesNumber}
        inputMode="numeric"
        value={pageInput}
        placeholder={`1–${pagesNumber}`}
        aria-label={`Numer strony od 1 do ${pagesNumber}`}
        className="h-8 w-16 rounded-full px-2 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        onChange={(event) => setPageInput(event.target.value)}
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={pageInput.trim() === ""}
      >
        Przejdź
        <ArrowRight aria-hidden />
      </Button>
    </form>
  );
}
