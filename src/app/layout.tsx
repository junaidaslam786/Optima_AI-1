import "./globals.css";
import { ReactNode } from "react";
import ClientProvider from "@/components/Main/ClientProvider";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
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
      <html lang="en" className={montserrat.variable}>
        <body className="min-h-screen">
          <ClientProvider>{children}</ClientProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
