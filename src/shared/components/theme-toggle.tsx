import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleThemeMode } from "@/modules/ui/ui.slice";
import { Button } from "@/shared/components/ui/button";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.ui.themeMode);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => dispatch(toggleThemeMode())}
      aria-label="Toggle dark mode"
    >
      {themeMode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
