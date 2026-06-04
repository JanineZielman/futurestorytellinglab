import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import Header from "@/components/Header";
import "./global.scss";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
