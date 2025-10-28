// ========================================
// RÉPONSES ENDOBIOGÉNIQUES GÉNÉRALES
// ========================================
// Répond aux questions théoriques sur l'endobiogénie,
// les axes, le terrain, la physiologie, etc.

/**
 * Répond à une question générale sur l'endobiogénie
 * (sans analyse de valeurs biologiques)
 * @param message - Question de l'utilisateur
 * @returns Réponse structurée et pédagogique
 */
export async function answerEndobiogenie(message: string): Promise<string> {
  const normalizedMessage = message.toLowerCase();

  // 🔍 Détection thématique
  if (
    normalizedMessage.includes("cortisol") ||
    normalizedMessage.includes("corticotrope") ||
    normalizedMessage.includes("acth") ||
    normalizedMessage.includes("surrénale")
  ) {
    return answerCorticotrope();
  }

  if (
    normalizedMessage.includes("thyroïde") ||
    normalizedMessage.includes("thyréotrope") ||
    normalizedMessage.includes("tsh") ||
    normalizedMessage.includes("métabolisme")
  ) {
    return answerThyreotrope();
  }

  if (
    normalizedMessage.includes("fsh") ||
    normalizedMessage.includes("e2") ||
    normalizedMessage.includes("estradiol") ||
    normalizedMessage.includes("androgène") ||
    normalizedMessage.includes("gonadotrope") ||
    normalizedMessage.includes("génital")
  ) {
    return answerGonadotrope();
  }

  if (
    normalizedMessage.includes("terrain") ||
    normalizedMessage.includes("endobiogénie") ||
    normalizedMessage.includes("endobiogenie")
  ) {
    return answerTerrain();
  }

  if (
    normalizedMessage.includes("axe") ||
    normalizedMessage.includes("axes") ||
    normalizedMessage.includes("neuroendocrinien")
  ) {
    return answerAxes();
  }

  if (
    normalizedMessage.includes("adaptation") ||
    normalizedMessage.includes("homéostasie")
  ) {
    return answerAdaptation();
  }

  // Réponse générale par défaut
  return answerGeneral();
}

/**
 * Réponse sur l'axe corticotrope
 */
function answerCorticotrope(): string {
  return `**🔬 Axe corticotrope (ACTH - Cortisol)**

L'axe corticotrope est l'un des principaux axes de l'adaptation biologique. Il mobilise la réponse au stress et gère la disponibilité des substrats énergétiques.

**Rôle physiologique :**
- Adaptation au stress (physique, émotionnel, métabolique)
- Régulation du métabolisme glucidique (néoglucogenèse)
- Mobilisation des réserves énergétiques
- Action anti-inflammatoire et immunomodulatrice

**Lecture fonctionnelle :**
- Un axe corticotrope sollicité reflète un terrain en phase d'adaptation
- La pression corticotrope s'observe via le ratio neutrophiles/lymphocytes
- Une sollicitation prolongée peut orienter vers un épuisement adaptatif

**En endobiogénie :**
L'axe corticotrope ne doit pas être vu comme "bon" ou "mauvais", mais comme une dynamique d'adaptation contextuelle. L'objectif est d'évaluer si cette sollicitation est adaptée au besoin physiologique du terrain.`;
}

/**
 * Réponse sur l'axe thyréotrope
 */
function answerThyreotrope(): string {
  return `**🔬 Axe thyréotrope (TSH - T3/T4)**

L'axe thyréotrope régule le métabolisme cellulaire et le rendement fonctionnel de l'énergie en périphérie.

**Rôle physiologique :**
- Régulation du métabolisme basal
- Thermogenèse et dépense énergétique
- Stimulation de la croissance et du renouvellement cellulaire
- Soutien de la production énergétique mitochondriale (ATP)

**Lecture fonctionnelle :**
- Un index thyroïdien élevé (LDH/CPK > 2) reflète un bon rendement métabolique
- Un index bas suggère une efficacité thyroïdienne périphérique réduite
- La TSH doit être interprétée en contexte, non isolément

**En endobiogénie :**
L'axe thyréotrope est central dans la dynamique énergétique du terrain. Il interagit avec les axes gonadotrope (œstrogènes pro-thyroïdiens) et corticotrope (cortisol freinateur). L'endobiogénie évalue la **réponse fonctionnelle** de la thyroïde face aux demandes du terrain.`;
}

/**
 * Réponse sur l'axe gonadotrope
 */
function answerGonadotrope(): string {
  return `**🔬 Axe gonadotrope (FSH/LH - Œstrogènes/Androgènes)**

L'axe gonadotrope régule la croissance, l'anabolisme et la régénération tissulaire, bien au-delà de la fonction reproductive.

**Rôle physiologique :**
- Anabolisme et construction tissulaire (os, muscle, peau)
- Régénération cellulaire et cicatrisation
- Maintien de la structure et de la trophicité des tissus
- Régulation du système immunitaire et inflammatoire

**Lecture fonctionnelle :**
- Les œstrogènes favorisent la croissance, la vascularisation et la thyroïde
- Les androgènes soutiennent la structure, la force et la densité tissulaire
- L'index génital (GR/GB) reflète la dominance androgénique ou œstrogénique relative

**En endobiogénie :**
L'axe gonadotrope n'est pas limité à la sphère génitale : il participe à l'équilibre anabolisme/catabolisme du terrain. Une empreinte œstrogénique marquée peut orienter vers une pression pro-croissance et pro-inflammatoire, tandis qu'une dominance androgénique soutient la structure et la stabilité.`;
}

/**
 * Réponse sur le terrain
 */
function answerTerrain(): string {
  return `**🌱 Le terrain en endobiogénie**

Le **terrain biologique** représente l'état fonctionnel global de l'organisme à un instant donné. Il reflète la résultante des régulations neuroendocriniennes qui gouvernent l'adaptation, le métabolisme, la croissance et la réparation.

**Principes fondamentaux :**
- Le terrain n'est ni fixe ni figé : il évolue en permanence
- Il est le reflet de la dynamique adaptative de l'organisme
- Chaque terrain possède ses axes dominants et ses points de fragilité
- L'objectif n'est pas un terrain "parfait", mais un terrain **adapté au contexte**

**Lecture du terrain :**
L'endobiogénie lit le terrain à travers :
- Les axes neuroendocriniens (thyréo-, cortico-, gonado-tropie)
- Les index fonctionnels calculés à partir de la biologie standard
- L'intégration de l'histoire clinique, des symptômes et du contexte

**En pratique :**
Le terrain permet de comprendre **pourquoi** un symptôme apparaît, et non seulement **ce qui** apparaît. Cette lecture fonctionnelle oriente une approche individualisée, respectant la physiologie du patient.`;
}

/**
 * Réponse sur les axes neuroendocriniens
 */
function answerAxes(): string {
  return `**⚙️ Les axes neuroendocriniens en endobiogénie**

L'endobiogénie analyse les régulations internes du corps à travers les **axes neuroendocriniens**, qui orchestrent l'adaptation, le métabolisme et la croissance.

**Les 3 axes majeurs :**

1. **Axe corticotrope (ACTH-Cortisol)** : Adaptation au stress, disponibilité énergétique
2. **Axe thyréotrope (TSH-T3/T4)** : Métabolisme cellulaire, rendement énergétique
3. **Axe gonadotrope (FSH/LH-Œstrogènes/Androgènes)** : Anabolisme, croissance, régénération

**Interaction des axes :**
- Les axes ne fonctionnent jamais isolément, mais en réseau
- Un axe dominant influence les autres axes
- L'équilibre entre axes détermine la dynamique du terrain

**Lecture fonctionnelle :**
L'endobiogénie ne cherche pas à "normaliser" chaque axe, mais à comprendre :
- Quel(s) axe(s) est/sont mobilisé(s) ?
- Cette mobilisation est-elle adaptée ou excessive ?
- Comment soutenir la régulation sans la forcer ?

**En pratique :**
Cette lecture permet d'individualiser la prise en charge en respectant la physiologie du terrain, plutôt qu'en imposant une norme standard.`;
}

/**
 * Réponse sur l'adaptation
 */
function answerAdaptation(): string {
  return `**🔄 L'adaptation en endobiogénie**

L'adaptation biologique est la capacité de l'organisme à ajuster ses régulations face aux contraintes internes et externes (stress, infections, variations métaboliques, etc.).

**Stratégies d'adaptation :**
- **Voie corticotrope (ACTH-Cortisol)** : Mobilisation rapide, gestion du stress aigu
- **Voie gonadotrope (FSH-Œstrogènes)** : Soutien de la régénération, adaptation chronique

**Index d'adaptation :**
L'index d'adaptation (Éosinophiles/Monocytes) reflète l'orientation de la stratégie adaptative :
- **Ratio > 0.7** : Orientation FSH/œstrogènes (anabolisme, réparation)
- **Ratio < 0.7** : Orientation ACTH/cortisol (catabolisme, mobilisation)

**Lecture fonctionnelle :**
Un terrain adapté n'est pas un terrain "sans stress", mais un terrain capable de **mobiliser les bonnes régulations au bon moment**, puis de revenir à l'équilibre.

**En pratique :**
Soutenir l'adaptation ne signifie pas "stimuler" ou "freiner" systématiquement, mais accompagner la physiologie dans sa dynamique propre.`;
}

/**
 * Réponse générale par défaut
 */
function answerGeneral(): string {
  return `**🧬 L'endobiogénie : une lecture fonctionnelle du terrain**

L'endobiogénie est une approche médicale qui analyse les **régulations neuroendocriniennes** de l'organisme pour comprendre la dynamique adaptative du terrain biologique.

**Principes clés :**
- Le corps s'adapte en permanence via ses axes hormonaux (thyréo-, cortico-, gonado-tropie)
- Chaque symptôme reflète une tentative d'adaptation du terrain
- L'objectif est de **soutenir la régulation physiologique**, non de la forcer

**Applications :**
- Lecture fonctionnelle des bilans biologiques standards
- Individualisation de la prise en charge selon le terrain
- Approche intégrative associant phytothérapie, nutrition et hygiène de vie

**Vous souhaitez en savoir plus ?**
Posez-moi des questions sur :
- Les axes neuroendocriniens (thyroïde, cortisol, androgènes, etc.)
- Le terrain biologique et l'adaptation
- L'interprétation fonctionnelle des index BdF

💡 **Pour une analyse personnalisée**, vous pouvez me fournir vos valeurs biologiques (GR, GB, TSH, LDH, CPK, etc.) et je calculerai vos index fonctionnels.`;
}
