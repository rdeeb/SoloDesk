import { type PropsWithChildren, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { useAppSelector } from "@/app/hooks";
import { uiStorageKey } from "@/modules/ui/ui.slice";

function ThemeSync() {
  const themeMode = useAppSelector((state) => state.ui.themeMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem(uiStorageKey, themeMode);
  }, [themeMode]);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeSync />
      {children}
    </Provider>
  );
}
