import { PrismicPreview } from "@prismicio/next";
import { cookies } from "next/headers";
import { repositoryName } from "@/prismicio";
import { getDefaultPrismicLang, getPrismicLang, PRISMIC_LANG_COOKIE } from "@/prismicio";
import Header from "@/components/Header";
import "./global.scss";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = getPrismicLang(cookieStore.get(PRISMIC_LANG_COOKIE)?.value) ?? getDefaultPrismicLang();

  return (
    <html lang={lang}>
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <Header />
        <main className="site">
          {children}
        </main>
        <section id="contact" className="footer">
          <span>Future Storytelling Lab</span>
          <span>© 2026</span>
          <span><a href="/about">About</a></span>
        </section>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
