import type { Metadata } from "next";
import { Oswald, Ubuntu } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ubuntu',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "HackITa Store",
  description: "Il tuo negozio online di gadget tecnologici personalizzati. Scopri t-shirt, tazze, cover per smartphone e molto altro, tutti con design unici e personalizzabili. Acquista ora e porta la tua passione tech sempre con te!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${ubuntu.variable}`}>
      <body className="antialiased bg-light text-dark dark:bg-dark dark:text-light flex flex-col">
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}