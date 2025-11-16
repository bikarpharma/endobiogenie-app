"use client";

import { useState } from "react";
import { OrdonnancePanel } from "./OrdonnancePanel";
import { ChatPanel } from "./ChatPanel";
import type { OrdonnanceStructuree, MessageAction } from "@/lib/ordonnance/types";

type OrdonnanceInterfaceClientProps = {
  ordonnance: any; // Serialized ordonnance from server
};

export function OrdonnanceInterfaceClient({ ordonnance: ordonnanceRaw }: OrdonnanceInterfaceClientProps) {
  // Désérialiser les dates
  const ordonnance: OrdonnanceStructuree = {
    ...ordonnanceRaw,
    createdAt: new Date(ordonnanceRaw.createdAt),
    updatedAt: new Date(ordonnanceRaw.updatedAt),
    dateRevaluation: ordonnanceRaw.dateRevaluation ? new Date(ordonnanceRaw.dateRevaluation) : null,
  };

  const [currentOrdonnance, setCurrentOrdonnance] = useState<OrdonnanceStructuree>(ordonnance);

  // Handler pour appliquer les actions suggérées par l'IA
  const handleApplyAction = (action: MessageAction) => {
    console.log("Action à appliquer:", action);
    // TODO: Implémenter la logique pour appliquer les modifications à l'ordonnance
    // Par exemple: ajouter/remplacer/retirer une recommandation
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        gap: "0",
        padding: "0",
        overflow: "hidden",
        background: "#f3f4f6",
      }}
    >
      {/* Ordonnance 60% */}
      <div
        style={{
          width: "60%",
          overflow: "auto",
          padding: "32px",
          borderRight: "2px solid #e5e7eb",
        }}
      >
        <OrdonnancePanel ordonnance={currentOrdonnance} />
      </div>

      {/* Chat IA 40% */}
      <div
        style={{
          width: "40%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "white",
        }}
      >
        <ChatPanel
          ordonnanceId={currentOrdonnance.id}
          initialMessages={[]}
          onApplyAction={handleApplyAction}
        />
      </div>
    </div>
  );
}

