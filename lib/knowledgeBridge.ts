/**
 * ============================================================================
 * INTEGRIA - KNOWLEDGE BRIDGE CONTEXT
 * ============================================================================
 * 
 * Ce fichier charge le Knowledge Bridge et le formate pour injection
 * dans le contexte de l'IA à chaque appel.
 * 
 * IMPORTANT: L'IA est STATELESS. Sans ce contexte, elle oubliera
 * les plantes disponibles et leurs profils endobiogéniques.
 * 
 * PLACEMENT: /lib/knowledgeBridge.ts
 * ============================================================================
 */

// =============================================================================
// KNOWLEDGE BRIDGE CONDENSÉ
// =============================================================================

/**
 * Liste des plantes clés avec leurs profils terrain
 * (Version condensée pour le contexte IA - économise les tokens)
 */
export const PLANTS_KNOWLEDGE = `
# KNOWLEDGE BRIDGE - PLANTES ENDOBIOGÉNIQUES

## PLANTES CLÉS ET LEURS MÉCANISMES TERRAIN

### Axe CORTICOTROPE (Freination)
- Passiflora incarnata (Passiflore): Alpha-sympatholytique majeur, inhibe cortisol via freination centrale. TM/EPS.
- Matricaria recutita (Camomille): Inhibe ACTH central, alpha et parasympatholytique. TM/EPS/HE.
- Lavandula angustifolia (Lavande): Inhibe cortex surrénalien, triple sympatholytique (α,β,para). TM/HE.
- Eschscholzia californica (Escholtzia): Sédatif central, freine l'axe corticotrope. TM/EPS.
- Valeriana officinalis (Valériane): Gabaergique, sédatif central. TM/EPS.

### Axe CORTICOTROPE (Soutien/Adaptation)
- Ribes nigrum (Cassis): Soutien adaptatif cortex surrénalien, cortisone-like sans effets secondaires. MG 1DH/EPS.
- Quercus robur (Chêne): Soutien cortex surrénalien, adaptogène. MG 1DH.
- Sequoiadendron (Séquoia): Tonique surrénalien, stimule corticosurrénale. MG 1DH.
- Rhodiola rosea (Rhodiola): Adaptogène, module axe HHS. EPS.

### Axe GONADOTROPE
- Vitex agnus-castus (Gattilier): Progestérone-like, régulation gonadotrope. TM/EPS.
- Alchemilla vulgaris (Alchémille): Progestérone-like, régulateur cycle. EPS.
- Rubus idaeus (Framboisier): Utérotrope, régulateur cycle. MG 1DH.
- Salvia sclarea (Sauge Sclarée): Œstrogène-like, régule couplages. HE/EPS.
- Achillea millefolium (Millefeuille): Décongestionnant pelvien, progestatif fonctionnel. TM.

### Axe THYRÉOTROPE
- Lycopus europaeus (Lycope): Inhibe TSH, régulation thyroïdienne périphérique. TM.
- Fabiana imbricata (Pichi): Inhibe TRH, diurétique. TM.
- Melissa officinalis (Mélisse): Freine TSH, antithyroïdien léger. TM/EPS.

### Axe SOMATOTROPE
- Lamium album (Lamier Blanc): Relance GH, améliore facteurs de croissance. TM.
- Avena sativa (Avoine): Tonique nerveux, soutien somatotrope. TM.

### SNA - Alpha-sympatholytiques
- Tilia tomentosa (Tilleul): Alpha-sympatholytique majeur, sédation SNA. MG 1DH.
- Crataegus laevigata (Aubépine): Cardiotonique, alpha-lytique. TM/MG 1DH/EPS.
- Leonurus cardiaca (Agripaume): Alpha et bêta-sympatholytique, cardiotonique. TM.

### SNA - Bêta-sympathomimétiques
- Thymus vulgaris (Thym): Bêta-sympathomimétique, stimule cortex surrénalien. TM/HE.
- Satureja montana (Sarriette): Bêta-sympathomimétique, stimulant. HE.
- Cinnamomum zeylanicum (Cannelle): Bêta-sympathomimétique, hypoglycémiant. HE.

### DRAINAGE HÉPATIQUE
- Taraxacum officinale (Pissenlit): Cholérétique, cholagogue. TM/EPS.
- Cynara scolymus (Artichaut): Hépatoprotecteur, cholérétique. TM/EPS.
- Rosmarinus officinalis (Romarin): Cholérétique, drainage hépatobiliaire. TM/MG 1DH.
- Silybum marianum (Chardon-Marie): Hépatoprotecteur majeur. EPS.
- Desmodium adscendens (Desmodium): Hépatoprotecteur, régénérateur. EPS.
- Fumaria officinalis (Fumeterre): Amphotère biliaire. TM/EPS.

### DRAINAGE RÉNAL
- Hieracium pilosella (Piloselle): Diurétique puissant. TM/EPS.
- Orthosiphon aristatus (Orthosiphon): Diurétique, uricosurique. EPS.
- Equisetum arvense (Prêle): Reminéralisant, diurétique. TM/EPS.

### DRAINAGE PELVIEN
- Hamamelis virginiana (Hamamélis): Veinotonique pelvien. TM/EPS.
- Vitis vinifera (Vigne Rouge): Veinotonique, drainage pelvien. TM/MG 1DH/EPS.

## OLIGOÉLÉMENTS PAR INDICATION

- Magnésium: Spasmes, spasmophilie, anxiété, sensibilité insuline.
- Lithium: Troubles du sommeil, anxiété, hyperfonction centrale.
- Zinc-Cuivre: Dysfonctions endocrines hypophysaires, gonadotrope.
- Cuivre-Or-Argent: Immunodéplétion, infections récurrentes.
- Manganèse-Cobalt: Douleurs articulaires, gastrite, inflammations.
- Sélénium: Inflammation, hypothyroïdie, conversion T4→T3.

## RÈGLES DE PRESCRIPTION

### Formes galéniques (Format FRANCE uniquement)
- TM (Teinture Mère): 3-5 mL 2-3x/jour
- MG 1DH (Macérat Glycériné): 50-100 gouttes/jour
- EPS (Extrait Standardisé): 5 mL/jour
- HE (Huile Essentielle): 1-2 gouttes 2-3x/jour sur support

### Nombre de plantes par dimension
- Symptomatic: 1-2 max
- Neuro-Endocrine: 2-4 max
- SNA: 1-2 max
- Drainage: 2-3 max
- Oligos: 1-2 max

### Justification obligatoire
Chaque plante doit être justifiée par :
- L'AXE ciblé (Corticotrope, Gonadotrope, Thyréotrope, Somatotrope)
- L'INDEX BdF concerné (Index Cortisol, Index Alpha, etc.)
- Le MÉCANISME terrain (pas le symptôme sauf dimension 1)
`;

/**
 * Retourne le contexte complet pour l'IA
 */
export function getKnowledgeBridgeContext(): string {
  return PLANTS_KNOWLEDGE;
}

/**
 * Retourne le contexte en format structuré pour injection dans messages
 */
export function getKnowledgeBridgeMessage(): { role: 'user' | 'system'; content: string } {
  return {
    role: 'system',
    content: `[KNOWLEDGE BRIDGE - BASE DE CONNAISSANCES]\n\n${PLANTS_KNOWLEDGE}`,
  };
}
