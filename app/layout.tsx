import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Endobiogénie SaaS",
  description: "Assistant RAG avec auth, historique et fiches plantes.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Récupérer la session (qui est connecté ?)
  const session = await auth();

  return (
    <html lang="fr">
      <body>
        <Header session={session} />
        <main className="w-full max-w-[1100px] mx-auto px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
