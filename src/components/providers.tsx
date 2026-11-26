"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { PwaProvider } from "@/features/pwa/pwa-provider";
import { I18nProvider } from "@/i18n/provider";
import type { Locale } from "@/i18n/types";
import { store } from "@/store/store";

type AppProvidersProps = {
  initialLocale?: Locale;
  children: ReactNode;
};

export function AppProviders({ initialLocale = "en", children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <I18nProvider initialLocale={initialLocale}>
        <QueryClientProvider client={queryClient}>
          <PwaProvider>{children}</PwaProvider>
        </QueryClientProvider>
      </I18nProvider>
    </Provider>
  );
}
