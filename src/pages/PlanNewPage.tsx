import { useNavigate } from "react-router-dom";

import { PlanGenerationForm } from "@/components/plan/PlanGenerationForm";
import { Logo } from "@/components/shared/Logo";

export function PlanNewPage() {
  const navigate = useNavigate();

  return (
    <div className="relative isolate flex flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:p-6">
        <section className="w-full max-w-xl">
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
      </div>
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <Logo className="h-112 w-auto" shadow alt="" aria-hidden />
      </div>
    </div>
  );
}
