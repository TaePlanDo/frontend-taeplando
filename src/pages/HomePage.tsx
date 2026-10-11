import { HeroHeading } from "@/components/home/HeroHeading";
import { ButtonCustomized } from "@/components/shared/ButtonCustomized";
import { Logo } from "@/components/ui/logo";

export function HomePage() {
  return (
    <div className="flex min-h-dvh bg-[#181818] text-white">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-96 flex-col lg:items-start items-center">
          <Logo className="mx-auto mb-18 h-64 w-auto lg:hidden" aria-hidden />

          <HeroHeading />

          <p className="mt-4 text-xl text-[#FAFAFA] lg:flex hidden">
            Stwórz grupę treningową i wygeneruj dla niej plan treningowy według
            własnych kryteriów.
          </p>

          <ButtonCustomized className="lg:mt-8 w-2/3 mt-16">
            Generuj plan
          </ButtonCustomized>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <Logo
          className="h-auto max-h-[min(420px,70vh)] w-[420px]"
          aria-hidden
        />
      </div>
    </div>
  );
}
