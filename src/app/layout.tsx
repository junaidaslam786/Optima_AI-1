// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Image from "next/image";
import { Navbar } from "../components/Main/Navbar";
import ClientProvider from "../components/ClientProvider";

export const metadata = {
  title: "Optima.AI",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <ClientProvider>
          <header className="fixed top-0 inset-x-0 h-16 bg-white shadow z-50">
            <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
              <Image
                src="/optima.png"
                alt="Optima.AI"
                width={160}
                height={44}
                className="object-contain"
              />
              <Navbar />
            </div>
          </header>

          <main className="pt-24 max-w-7xl mx-auto px-8 py-6 flex flex-col lg:flex-row">
            {children}
          </main>
        </ClientProvider>
      </body>
    </html>
  );
}
