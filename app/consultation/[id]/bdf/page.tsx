import { notFound } from "next/navigation";
import { BdfForm } from "./BdfForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BdfPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Biologie des Fonctions</h1>
      <BdfForm consultationId={id} />
    </div>
  );
}
