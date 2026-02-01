import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        // El SessionProvider permite que useSession() funcione en todos los componentes
        <SessionProvider session={session}>
            <Navbar />
            <Head>
                <title>Ciencia y Religión - Red Social de Análisis</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Plataforma para analizar y comentar los párrafos del libro Ciencia y Religión de Jesús Ceballos Dosamantes" />
            </Head>

            <main className="app-container">
                <Component {...pageProps} />
            </main>

            <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Georgia', serif; /* Estilo clásico acorde al libro de 1897 */
          background-color: #f4f1ea;    /* Color tipo papel antiguo */
          color: #2c2c2c;
        }
        .app-container {
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>
        </SessionProvider>
    );
}

export default MyApp;