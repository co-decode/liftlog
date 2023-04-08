import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { trpc } from '../utils/trpc';
import { SessionProvider } from "next-auth/react";

const App  = ({ 
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{session: Session}>) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
};

export default trpc.withTRPC(App);
