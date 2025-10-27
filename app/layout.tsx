import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Endobiogénie RAG",
  description:
    "Assistant RAG basé sur les volumes d'endobiogénie — démonstrateur avec chat + rubriques.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = "fr";
  return (
    <html lang={lang}>
      <body>
        <Header />
        <main className="w-full max-w-[1100px] mx-auto px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
