import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { RadioProvider } from "@/context/RadioContext";
import RadioPlayer from "@/components/Player/RadioPlayer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RadioProvider>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-Q4897G9RGZ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-Q4897G9RGZ');
        `}
      </Script>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
        <Component {...pageProps} />
        <RadioPlayer />
      </div>
    </RadioProvider>
  );
}
