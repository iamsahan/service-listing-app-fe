import ScrollToTopButton from "@/components/ScrollToTopButton";
import AuthWrapper from "@components/wrappers/AuthWrapper";
import { Toaster } from "@components/ui/toaster";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

import { Inter } from "next/font/google";
import Providers from "./providers";
import dynamic from "next/dynamic";

import "@styles/globals.css";
import { SocketProvider } from "../context/SocketContext";
import GoogleAnalyticsScripts from "@/components/GoogleAnalyticsScripts";
import MetaPixel from "@/components/MetaPixel";

const GoogleTranslateScripts = dynamic(() =>
  import("@/components/GoogleTranslateScripts")
);

const NODE_ENV = process.env.NODE_ENV;
const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }) {
  if (!GA_MEASUREMENT_ID) {
    console.warn(
      "GA_MEASUREMENT_ID is not defined. Google Analytics will not be loaded."
    );
  }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {GA_MEASUREMENT_ID && <GoogleAnalyticsScripts id={GA_MEASUREMENT_ID} />}
        {NODE_ENV === "production" && <MetaPixel />}
        <GoogleTranslateScripts />
      </head>

      <body className={`${inter.className} antialiased`}>
        {/* NoScript fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=4354951004774537&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Google Translate */}
        <div id="google_translate_element" className="hidden"></div>

        <AuthWrapper>
          <SocketProvider>
            <Providers>
              <div className="main">
                <div className="gradient" />
              </div>

              <main className="app">
                {children}
                <Toaster />
              </main>
              <ScrollToTopButton />
            </Providers>
          </SocketProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
//dummy commit