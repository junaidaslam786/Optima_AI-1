// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Image from "next/image";
import { Navbar } from "../components/Main/Navbar";
import ClientProvider from "../components/Main/ClientProvider";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Optima.AI",
  icons: {
    icon: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-gray-50">
        <ThemeProvider>
          <ClientProvider>
            <header className="fixed top-0 inset-x-0 h-20 bg-white shadow z-50">
              <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
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

            <main className="pt-24 max-w-7xl mx-auto px-8 py-6 flex flex-col lg:flex-row">
              {children}
            </main>
          </ClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
