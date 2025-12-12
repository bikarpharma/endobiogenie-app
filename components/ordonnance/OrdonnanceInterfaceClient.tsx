"use client";

import { useState, useMemo } from "react";
import { OrdonnancePanel } from "./OrdonnancePanel";
import { ChatPanel } from "./ChatPanel";
import { PrescriptionList } from "@/components/prescription/PrescriptionList";
import type { OrdonnanceStructuree, MessageAction } from "@/lib/ordonnance/types";
import type { PrescriptionOutput, PlantOutput } from "@/lib/utils/tunisianAdapter";
import { cn } from "@/lib/utils";

type OrdonnanceInterfaceClientProps = {
  ordonnance: any; // Serialized ordonnance from server
};

/**
 * Adapte les données de l'ordonnance (format BDD) vers le format PrescriptionOutput
 * pour utiliser les nouveaux composants visuels
 */
function mapOrdonnanceToPrescription(ordonnance: any): PrescriptionOutput | null {
  // Helper pour mapper une plante
  const mapPlant = (rec: any, endo_covered: boolean = true): PlantOutput => ({
    plant_id: rec.id || rec.substance?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
    name_latin: rec.substance || '',
    name_fr: rec.nomFrancais || rec.substance || '',
    form: rec.forme || 'EPS',
    dosage: rec.posologie || '',
    justification: rec.mecanisme || rec.axeCible || '',
    endo_covered: endo_covered,
    justification_terrain: rec.pedagogie?.actionSurAxe || rec.axeCible || '',
    justification_classique: rec.mecanisme || '',
    explication_patient: '',
    axe_cible: rec.axeCible || '',
    mecanisme: rec.mecanisme || '',
    duree: rec.duree || '',
    // Champs Tunisian Adapter (simulés si pas de conversion)
    is_available_tunisia: true,
    original_form: rec.forme || 'EPS',
    original_dosage: rec.posologie || '',
    adapted_form: null,
    adapted_dosage: null,
    conversion_note: null,
    alert_level: 'NONE',
  });

  // 🆕 Mapper l'aromathérapie depuis voletAromatherapie
  const aromatherapiePlants = (ordonnance.voletAromatherapie || []).map((rec: any) => mapPlant(rec, false));

  // Si adaptedContent existe (version Tunisie), l'utiliser mais AJOUTER l'aromathérapie
  if (ordonnance.adaptedContent) {
    const adapted = ordonnance.adaptedContent as PrescriptionOutput;
    // Injecter l'aromathérapie dans le format Tunisie
    return {
      ...adapted,
      prescription: {
        ...adapted.prescription,
        aromatherapie: aromatherapiePlants.length > 0 ? aromatherapiePlants : adapted.prescription.aromatherapie,
      },
    };
  }

  // Sinon, construire depuis les volets France
  // Extraire les plantes par catégorie
  const endoPlants = (ordonnance.voletEndobiogenique || [])
    .filter((r: any) => r.type === 'plante')
    .map((r: any) => mapPlant(r, true));

  const gemmoPlants = (ordonnance.voletEndobiogenique || [])
    .filter((r: any) => r.type === 'gemmo')
    .map((r: any) => mapPlant(r, true));

  const phytoPlants = (ordonnance.voletPhytoElargi || [])
    .filter((r: any) => r.type === 'plante')
    .map((r: any) => mapPlant(r, false));

  // Construire le format PrescriptionOutput
  return {
    global_strategy_summary: ordonnance.syntheseClinique || "Ordonnance endobiogénique personnalisée",
    priority_axis: "Corticotrope", // TODO: extraire de syntheseClinique
    prescription: {
      symptomatic: phytoPlants,
      neuro_endocrine: endoPlants,
      ans: gemmoPlants, // Les gemmo sont souvent pour le SNA
      drainage: [], // TODO: extraire du voletEndobiogenique si présent
      aromatherapie: aromatherapiePlants, // 🆕 Huiles essentielles
      oligos: (ordonnance.voletComplements || []).map((c: any) => ({
        oligo_id: c.id || 'oligo',
        name: c.substance || '',
        form: c.forme || 'gélule',
        dosage: c.posologie || '',
        justification: c.axeCible || c.mecanisme || '',
        is_available_tunisia: true,
        alert_level: 'NONE' as const,
      })),
    },
    meta: {
      conversion_date: new Date().toISOString(),
      total_plants: endoPlants.length + phytoPlants.length + gemmoPlants.length + aromatherapiePlants.length,
      available_count: endoPlants.length + phytoPlants.length + gemmoPlants.length + aromatherapiePlants.length,
      warnings_count: 0,
      critical_count: 0,
      conversions_applied: [],
    },
  };
}

export function OrdonnanceInterfaceClient({ ordonnance: ordonnanceRaw }: OrdonnanceInterfaceClientProps) {
  // Désérialiser les dates
  const ordonnance: OrdonnanceStructuree = {
    ...ordonnanceRaw,
    createdAt: new Date(ordonnanceRaw.createdAt),
    updatedAt: new Date(ordonnanceRaw.updatedAt),
    dateRevaluation: ordonnanceRaw.dateRevaluation ? new Date(ordonnanceRaw.dateRevaluation) : null,
  };

  const [currentOrdonnance, setCurrentOrdonnance] = useState<OrdonnanceStructuree>(ordonnance);

  // Convertir vers le format PrescriptionOutput
  const prescriptionData = useMemo(() => {
    return mapOrdonnanceToPrescription(ordonnanceRaw);
  }, [ordonnanceRaw]);

  // Handler pour appliquer les actions suggérées par l'IA
  const handleApplyAction = (action: MessageAction) => {
    console.log("Action à appliquer:", action);
    // TODO: Implémenter la logique pour appliquer les modifications à l'ordonnance
  };

  // Extraire le nom du patient
  const patientName = ordonnanceRaw.patient
    ? `${ordonnanceRaw.patient.prenom || ''} ${ordonnanceRaw.patient.nom || ''}`.trim()
    : undefined;

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
          padding: "16px",
          borderRight: "2px solid #e5e7eb",
        }}
      >
        {/* Vue unifiée Tunisie - Plus de toggle TN/FR */}
        {prescriptionData ? (
          <PrescriptionList
            data={prescriptionData}
            patientName={patientName}
            consultationDate={ordonnance.createdAt.toLocaleDateString('fr-FR')}
            // Infos complémentaires de l'ordonnance legacy pour Synthèse/Conseils/Surveillance
            syntheseTerrain={currentOrdonnance.syntheseClinique}
            conseilsHygiene={currentOrdonnance.conseilsAssocies}
            surveillanceBio={currentOrdonnance.surveillanceBiologique}
          />
        ) : (
          <OrdonnancePanel ordonnance={currentOrdonnance} />
        )}
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
