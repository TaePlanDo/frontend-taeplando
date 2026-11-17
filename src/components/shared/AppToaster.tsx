import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";

export function AppToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} />;
}
