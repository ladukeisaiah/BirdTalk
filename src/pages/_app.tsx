import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable}`}>
      <ClerkProvider {...pageProps}>
      <Head>
        <title>BirdTalk</title>
        <meta name="description" content="💭" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Toaster position="bottom-center" />
      <Component {...pageProps} />
      </ClerkProvider>
    </main>
  );
};

export default api.withTRPC(MyApp);
