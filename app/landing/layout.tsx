import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "IntegrIA - L'IA au service de la médecine intégrative",
  description: "Phytothérapie, gemmothérapie, aromathérapie et endobiogénie. L'assistant IA qui révolutionne votre pratique médicale intégrative.",
  keywords: ["médecine intégrative", "phytothérapie", "endobiogénie", "IA médicale", "plantes médicinales", "naturopathie"],
  openGraph: {
    title: "IntegrIA - L'IA au service de la médecine intégrative",
    description: "L'assistant IA qui révolutionne votre pratique médicale intégrative.",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout sans le header/footer de l'app principale
  return children;
}
