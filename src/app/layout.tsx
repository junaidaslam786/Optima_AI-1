// app/layout.tsx

import "./globals.css";
import { ReactNode } from "react";
import ClientProvider from "@/components/Main/ClientProvider";
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
    <ThemeProvider>
      <html lang="en" className={poppins.variable}>
        <body className="min-h-screen">
          <ClientProvider>{children}</ClientProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
