import { useNavigate } from "react-router-dom";

import { PlanGenerationForm } from "@/components/plan/PlanGenerationForm";
import { Logo } from "@/components/shared/Logo";

export function PlanNewPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-14">
      <section className="min-w-0">
        <h1 className="text-center text-3xl font-bold sm:text-4xl lg:text-left lg:text-5xl lg:text-primary">
          Wybór <span className="text-primary">parametrów</span>
        </h1>
        <p className="mt-4 text-center text-lg text-foreground/80 lg:text-left">
          Wybierz parametry planu do wygenerowania.
        </p>
        <PlanGenerationForm
          onStarted={(jobId) => navigate(`/plans/generation/${jobId}`)}
        />
      </section>
      <div className="hidden items-center justify-center lg:flex">
        <Logo className="w-full max-w-lg" alt="" aria-hidden />
      </div>
    </div>
  );
}
