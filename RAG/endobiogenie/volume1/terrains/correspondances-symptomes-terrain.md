# Correspondances Symptomes - Terrain Endobiogenique

Ce fichier liste les correspondances entre signes cliniques et terrains endobiogeniques.
**Utilise par le systeme RAG pour interpreter l'interrogatoire.**

*Source: La Theorie de l'Endobiogenie, Volume 1, Chapitre 13 - Kamyar M. Hedayat*

---

## Axe Thyreotrope

| Signe/Symptome | Terrain | Traitement suggere |
|----------------|---------|-------------------|
| Patient liste plaintes ordonnees, ecrites a l'avance | Predominance TSH sur TRH | - |
| Historique heuristique, symptomes du courant de conscience | Predominance TRH sur TSH | - |
| Symptomes aggraves automne-hiver (nov-fev) | Adaptation thyroidienne insuffisante pour l'hiver | Soutien thyroidien |
| Frilosite excessive | Hypothyroidie fonctionnelle | - |
| Sinusites + menorragie | TSH elevee + Sur-sollicitation pancreas + Hyperestrogenie | - |

## Axe Corticotrope

| Signe/Symptome | Terrain | Traitement suggere |
|----------------|---------|-------------------|
| Symptomes aggraves au printemps | Trauma emotionnel saisonnier, relance limbique | - |
| Reveil entre 1h et 3h du matin | Congestion hepatique, hypercortisolisme | Drainage hepatique |
| Reveil entre 3h et 5h du matin | Congestion pulmonaire, terrain allergique | Ribes nigrum |
| Infections recidivantes | Hyper-parasympathique + Congestion hepatobiliaire + Insuffisance surrenale | Ribes nigrum, drainage hepatique |
| Envies de sucre | Hypoglycemie reactionnelle, fatigue surrenale | Soutien surrenalien |
| Envies de sale | Insuffisance mineralocorticoide (aldosterone) | - |
| Symptomes recurrents a date anniversaire | Trauma emotionnel ancre chronobiologiquement | Accompagnement psycho + surrenalien |
| Crampes nocturnes | Deficit magnesium + Hyperaldosteronisme | Magnesium |
| Fatigue matinale malgre sommeil suffisant | Insuffisance cortico-surrenale | Ribes nigrum, vitamine C |
| Stress chronique avec resistance insulinique | Hypercortisolisme adaptatif | Modulation cortisol |

## Axe Gonadotrope

| Signe/Symptome | Terrain | Traitement suggere |
|----------------|---------|-------------------|
| Hypercholesterolemie | Estrogenes eleves + Insuffisance hepatobiliaire + Congestion colique | Drainage hepatique |
| Anticorps anti-thyroidiens | Sur-sollicitation thyroide par estrogenes | Moduler estrogenes |
| Nodules thyroidiens | Hyperestrogenie chronique + Hyper-alpha (stress) | - |
| Menorragie | Hyperestrogenie avec sur-proliferation endometre | - |
| Oligomenorrhee premenopausique | Cortisol eleve, sur-sollicitation FSH -> TSH | - |
| Perte de libido | Dysfonction axe gonadotrope | - |
| Symptomes urinaires bas appareil (homme) | Adenome prostate, LH elevee | Pygeum africanum |

## Terrain Mixte (Gonadotrope + Corticotrope)

| Signe/Symptome | Terrain | Traitement suggere |
|----------------|---------|-------------------|
| Atherome + Prostate + Allergies (homme >50 ans) | Cortex surrenal affaibli, congestion pelvienne, LH elevee | Ribes nigrum, Pygeum africanum, Urtica dioica, Agrimonia eupatoria, Olea europaea bg |
| Cancer thyroide (femme perimenopaue) | Hyperestrogenie + Stress chronique + TSH elevee | Approche globale terrain |

## SNA (Systeme Nerveux Autonome)

| Signe/Symptome | Terrain | Traitement suggere |
|----------------|---------|-------------------|
| Palpitations post-prandiales | Desequilibre vagal/sympathique | - |
| Tendance vagale (hypotension, bradycardie) | Hyper-parasympathique | - |
| Otites moyennes recidivantes (enfant) | Tonus vagal eleve + terrain precritique | Traitement terrain |

## Terrain Emotionnel/Psychologique

| Signe/Symptome | Terrain | Traitement suggere |
|----------------|---------|-------------------|
| Abandonnisme dans l'enfance | Envies reconfortantes (sucre, gras) a l'age adulte | Approche psycho + surrenalien |
| Metaphores de guerre pour decrire la maladie | Patient se sent attaque, devaste | Accompagnement emotionnel |
| Reponse "vague" a question ouverte (ex: "me sentir mieux") | Possible fibromyalgie, troubles multisystemiques | Investigation approfondie |

## Variations Saisonnieres

| Signe/Symptome | Terrain | Saison | Traitement suggere |
|----------------|---------|--------|-------------------|
| PSA cycliquement eleve | Trauma emotionnel saisonnier | Printemps | Accompagnement psycho |
| Sinusites recidivantes | TSH elevee, adaptation insuffisante | Automne-Hiver | Soutien thyroidien |
| Saignements menstruels abondants | Hyperestrogenie saisonniere | Nov-Fev | - |

---

## Application RAG

Pour chaque symptome de l'interrogatoire:
1. Rechercher correspondance dans ce fichier
2. Identifier le(s) axe(s) implique(s)
3. Suggerer terrain endobiogenique probable
4. Orienter vers traitement approprie

## Les 3 composantes du terrain precritique

Pour qu'une maladie se manifeste, les 3 facteurs doivent etre presents:
1. **Dysfonctionnement SNA** (ex: hyper-parasympathique)
2. **Dysfonctionnement endocrinien** (ex: insuffisance surrenale)
3. **Dysfonctionnement emonctoriel** (ex: congestion hepatobiliaire)

> "En cas de doute, drainer l'emonctoire-cle" - Principe endobiogenique
