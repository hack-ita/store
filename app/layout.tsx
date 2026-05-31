import type { Metadata } from "next";
import { Oswald, Ubuntu } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavigationProgress from "@/components/NavigationProgress";

if (process.env.NODE_ENV === 'production') {
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.info = noop;
  console.debug = noop;
}

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
  title: "HackITa Store - Gadget Tecnologici Personalizzati",
  description: "Il tuo negozio online di gadget tecnologici personalizzati. Scopri t-shirt, tazze, cover per smartphone e molto altro, tutti con design unici e personalizzabili. Acquista ora e porta la tua passione tech sempre con te!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProd = process.env.NODE_ENV === 'production';

  return (
    <html lang="it" className={`${oswald.variable} ${ubuntu.variable}`}>
      <head>
        <link rel="preconnect" href="https://d29gv5mnjp8nf8.cloudfront.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://d29gv5mnjp8nf8.cloudfront.net" />
        {isProd && (
          <script dangerouslySetInnerHTML={{
            __html: `(function(){var n=function(){};['log','warn','info','debug','group','groupEnd','groupCollapsed','time','timeEnd','timeLog','table','count','countReset','dir','dirxml','assert'].forEach(function(m){console[m]=n;});})();`
          }} />
        )}
      </head>
      <body className="antialiased bg-light text-dark dark:bg-dark dark:text-light flex flex-col">
        <NavigationProgress />
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}