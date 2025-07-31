"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Main/Navbar";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import CookieConsentBanner from "@/components/UserConsents/CookieConsentBanner";

const queryClient = new QueryClient();

export default function ClientProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const noHeaderPaths = ["/auth/signin", "/auth/signup"];
  const shouldShowHeader = !noHeaderPaths.includes(pathname);

  useEffect(() => {
    if (shouldShowHeader) {
      const timer = setTimeout(() => {
        setShowCookieBanner(true);
      }, 7000);

      return () => clearTimeout(timer);
    } else {
      setShowCookieBanner(false);
    }
  }, [shouldShowHeader, pathname]);

  return (
    <>
      <Toaster position="top-right" />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            {shouldShowHeader ? (
              <>
                <header className="fixed top-0 inset-x-0 h-[14vh] bg-primary/20 shadow z-50">
                  <div className="mx-auto h-full px-[2vw] flex items-center justify-between">
                    <Image
                      src="/optima.png"
                      alt="Optima.AI"
                      width={218}
                      height={60}
                      className="object-contain"
                    />
                    <Navbar />
                  </div>
                </header>
                <main className="w-full min-h-[100vh] pt-[14vh] flex flex-col lg:flex-row">
                  {children}
                  {showCookieBanner && <CookieConsentBanner />}
                </main>
              </>
            ) : (
              children
            )}
          </SessionProvider>
        </QueryClientProvider>
      </Provider>
    </>
  );
}
