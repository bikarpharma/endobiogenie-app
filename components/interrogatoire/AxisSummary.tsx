"use client";

import type { AxisKey } from "@/lib/interrogatoire/config";

interface AxisSummaryProps {
  axisKey: AxisKey;
  values: Record<string, any>;
}

export function AxisSummary({ axisKey, values }: AxisSummaryProps) {
  const lines: string[] = [];

  // Digestif
  if (axisKey === "digestif") {
    if (values.digestif_lourdeurs_haut)
      lines.push("Lenteur gastrique ou hypochlorhydrie possible.");
    if (values.digestif_mauvaise_digest_graisses)
      lines.push("Faiblesse biliaire probable.");
    if (values.digestif_ballonnements_postprandiaux)
      lines.push("Fermentation haute modérée possible.");
    if (values.digestif_reflux)
      lines.push("Irritation gastrique ou RGO fonctionnel.");
    if (values.digestif_meteorisme)
      lines.push("Dysbiose ou mauvaise digestion initiale.");
    if (values.digestif_sensibilite_gluten || values.digestif_sensibilite_lactose)
      lines.push("Sensibilités alimentaires suggérant une hyperréactivité intestinale.");
  }

  // Neurovégétatif
  if (axisKey === "neuro") {
    if (values.neuro_sommeil_endormissement)
      lines.push("Difficulté d'endormissement → tonus parasympathique faible ou bêta-sympathique élevé.");
    if (values.neuro_sommeil_reveils_nocturnes)
      lines.push("Réveils nocturnes → possible pic cortisolique ou hypoglycémie.");
    if (values.neuro_fringales || values.neuro_faim_sucre)
      lines.push("Instabilité glycémique ou activité alpha-sympathique élevée.");
    if (values.neuro_thermo_frilosite)
      lines.push("Frilosité → possible hypofonction thyroïdienne fonctionnelle.");
    if (values.neuro_thermo_transpiration === "Oui abondamment")
      lines.push("Transpiration abondante → activité alpha-sympathique marquée.");
    if (values.neuro_palpitations)
      lines.push("Palpitations → hyperréactivité bêta-sympathique.");
    if (values.neuro_energie_matin === "Mauvaise")
      lines.push("Énergie matinale faible → déficit somatotrope ou cortisol matinal insuffisant.");
  }

  // Adaptatif
  if (axisKey === "adaptatif") {
    if (values.adaptatif_stress_chronique)
      lines.push("Stress chronique installé → charge corticotrope élevée.");
    if (values.adaptatif_hypoglycemies_fonctionnelles)
      lines.push("Hypoglycémies fonctionnelles → épuisement cortico-surrénalien possible.");
    if (values.adaptatif_irritabilite || values.adaptatif_anxiete)
      lines.push("Irritabilité/anxiété → déséquilibre neurovégétatif et corticotrope.");
    if (values.adaptatif_fatigue_permanente)
      lines.push("Fatigue permanente → épuisement adaptatif probable.");
    if (values.adaptatif_tensions_cervicales || values.adaptatif_tensions_dorsales)
      lines.push("Tensions musculaires → somatisation du stress.");
  }

  // Thyroïdien
  if (axisKey === "thyro") {
    if (values.thyro_frilosite_importante)
      lines.push("Frilosité importante → hypothyroïdie fonctionnelle probable.");
    if (values.thyro_prise_poids_recente)
      lines.push("Prise de poids récente → ralentissement métabolique thyroïdien.");
    if (values.thyro_peau_seche || values.thyro_cheveux_secs)
      lines.push("Peau/cheveux secs → déficit thyroïdien périphérique.");
    if (values.thyro_transit_lent)
      lines.push("Transit lent → composante thyroïdienne probable.");
    if (values.thyro_fatigue_chronique)
      lines.push("Fatigue chronique → hypofonction thyroïdienne à explorer.");
  }

  // Gonado
  if (axisKey === "gonado") {
    if (values.gonado_cycles_irreguliers)
      lines.push("Cycles irréguliers → déséquilibre gonadotrope.");
    if (values.gonado_spm_important)
      lines.push("SPM important → déséquilibre estro-progestatif.");
    if (values.gonado_libido_basse)
      lines.push("Libido basse → déficit gonadotrope ou charge corticotrope.");
    if (values.gonado_bouffees_chaleur)
      lines.push("Bouffées de chaleur → déficit œstrogénique (ménopause ou périménopause).");
    if (values.gonado_secheresse_muqueuses)
      lines.push("Sécheresse muqueuse → hypo-œstrogénie.");
    if (values.gonado_androgenes_faibles)
      lines.push("Signes d'hypo-androgénie → déficit testostérone probable.");
  }

  // Somatotrope
  if (axisKey === "somato") {
    if (values.somato_reveil_fatigue)
      lines.push("Réveil fatigué → déficit GH nocturne probable.");
    if (values.somato_recuperation_lente)
      lines.push("Récupération lente → déficit somatotrope.");
    if (values.somato_hypoglycemies_matinales)
      lines.push("Hypoglycémies matinales → GH insuffisante.");
    if (values.somato_masse_musculaire_faible)
      lines.push("Masse musculaire faible → déficit GH/IGF-1.");
    if (values.somato_force_diminuee)
      lines.push("Force diminuée → hypofonction somatotrope.");
  }

  // Immuno
  if (axisKey === "immuno") {
    if (values.immuno_infections_repetees)
      lines.push("Infections répétées → déficit immunitaire probable.");
    if (values.immuno_allergies_saisonnieres || values.immuno_allergies_alimentaires)
      lines.push("Allergies → hyperréactivité alpha-sympathique et terrain atopique.");
    if (values.immuno_eczema || values.immuno_psoriasis)
      lines.push("Manifestations cutanées → inflammation chronique bas grade.");
    if (values.immuno_douleurs_articulaires || values.immuno_douleurs_musculaires)
      lines.push("Douleurs inflammatoires → terrain pro-inflammatoire.");
    if (values.immuno_fatigue_chronique)
      lines.push("Fatigue chronique → possible composante immuno-inflammatoire.");
  }

  // Cardio-métabolique
  if (axisKey === "cardioMetabo") {
    if (values.cardio_hypertension || values.cardio_tension_elevee)
      lines.push("Hypertension → hyperactivité alpha-sympathique ou rétention hydrosodée.");
    if (values.cardio_hypotension)
      lines.push("Hypotension → hypofonction surrénalienne ou vagotonie.");
    if (values.cardio_oedemes || values.cardio_jambes_lourdes)
      lines.push("Œdèmes/jambes lourdes → insuffisance veineuse ou rétention hydrique.");
    if (values.cardio_cholesterol_eleve || values.cardio_triglycerides_eleves)
      lines.push("Dyslipidémie → déséquilibre métabolique (thyroïde, insuline, cortisol).");
    if (values.cardio_glycemie_elevee)
      lines.push("Glycémie élevée → résistance insulinique probable.");
  }

  // Dermato
  if (axisKey === "dermato") {
    if (values.dermato_peau_seche_importante)
      lines.push("Peau très sèche → hypothyroïdie fonctionnelle ou déficit lipidique.");
    if (values.dermato_acne || values.dermato_peau_grasse)
      lines.push("Acné/peau grasse → hyperandrogénie ou déséquilibre sébacé.");
    if (values.dermato_cheveux_cassants || values.dermato_chute_cheveux)
      lines.push("Cheveux fragiles → carence nutritionnelle ou dysfonction thyroïdienne.");
    if (values.dermato_ongles_fragiles)
      lines.push("Ongles fragiles → carence minérale ou hypothyroïdie.");
    if (values.dermato_hypersensibilite_cutanee)
      lines.push("Hypersensibilité cutanée → terrain alpha-sympathique élevé.");
  }

  // Historique
  if (axisKey === "historique") {
    if (values.perinatal_complications || values.perinatal_prematurite === "Oui")
      lines.push("Facteurs périnataux → fragilité endocrine initiale possible.");
    if (values.enfance_infections_repetitions !== "Non")
      lines.push("Infections répétées enfance → terrain immunitaire fragile.");
    if (values.ado_puberte === "Retardée" || values.ado_puberte === "Précoce")
      lines.push("Puberté non conforme → axe gonadotrope à surveiller.");
    if (values.psyclin_traumas === "Oui avec séquelles")
      lines.push("Traumas psychologiques → impact sur axe corticotrope et SNA.");
    if (values.toxique_tabac === "Oui" || values.toxique_alcool === "Élevée")
      lines.push("Toxiques → charge hépatique et stress oxydatif.");
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
      <div className="font-semibold text-blue-900 flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Synthèse préliminaire
      </div>
      {lines.length === 0 ? (
        <div className="text-gray-600 text-xs italic">
          Aucun élément notable détecté pour cet axe.
        </div>
      ) : (
        <ul className="list-disc pl-5 text-xs space-y-1 text-gray-700">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
