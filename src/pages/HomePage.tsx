import { Button } from "@/components/ui/button";
import { useHealth } from "@/hooks/useHealth";

export function HomePage() {
  const { data, error, isFetching, refetch, isSuccess } = useHealth();

  return (
    <main className="mx-auto flex w-screen h-screen flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Frontend</h1>
        <p className="text-foreground">Backend Connection Test</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm">
          Status:{" "}
          <span className="font-medium">
            {isFetching
              ? "loading..."
              : isSuccess
                ? data.status
                : error
                  ? "unavailable"
                  : "idle"}
          </span>
        </p>
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          Refresh
        </Button>
      </div>
    </main>
  );
}
