import "@/styles/globals.css";
import "@/styles/fonts.module.css";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import Head from "next/head";
import { ThemeProvider } from "@/components/theme-provider";
import { trpc } from "../utils/trpc";
import { SessionProvider } from "next-auth/react";
import ContextProvider from "@/components/auth-and-context"
import { Inter } from "next/font/google";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) => {
  return (
    <>
      <Head>
        <title>LiftLog</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="shortcut icon" href="/favicon.svg"/>
      </Head>
      <style jsx global>
        {`
          html {
            font-family: ${fontSans.style.fontFamily};
          }
        `}
      </style>

      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ContextProvider>
          <Component {...pageProps} />
        </ContextProvider>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
};

export default trpc.withTRPC(App);
