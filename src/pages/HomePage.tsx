import { HeroDescription } from "@/components/home/HeroDescription";
import { HeroHeading } from "@/components/home/HeroHeading";
import { BackgroundDots } from "@/components/shared/BackgroundDots";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { Logo } from "@/components/shared/Logo";

export function HomePage() {
  return (
    <div className="relative isolate flex flex-1 overflow-hidden">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-96 flex-col lg:items-start items-center">
          <Logo className="mx-auto mb-18 h-64 w-auto lg:hidden" aria-hidden />

          <HeroHeading />

          <HeroDescription description="Stwórz grupę treningową i wygeneruj dla niej plan treningowy według własnych kryteriów." />

          <CustomizedButton variant="hero" className="lg:mt-8 w-2/3 mt-16">
            Generuj plan
          </CustomizedButton>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <Logo className="h-112 w-auto" shadow aria-hidden />
      </div>
      <BackgroundDots className="left-0 top-1/4" />
      <BackgroundDots className="right-0 top-3/4 -scale-x-100" />
    </div>
  );
}
