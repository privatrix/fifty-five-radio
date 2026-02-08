import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { RadioProvider } from "@/context/RadioContext";
import RadioPlayer from "@/components/Player/RadioPlayer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RadioProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
        <Component {...pageProps} />
        <RadioPlayer />
      </div>
    </RadioProvider>
  );
}
