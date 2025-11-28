#!/usr/bin/env python3
"""
Script d'extraction des monographies d'huiles essentielles
du livre "L'aromatherapie exactement" de Pierre Franchomme.

Extrait les 271 monographies du Livre quatrieme (Matiere medicale aromatique)
et les classe par famille botanique.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Chemins
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
INPUT_FILE = PROJECT_DIR / "RAG" / "aroma" / "extracted" / "aromatherapie-exactement-full.txt"
OUTPUT_DIR = PROJECT_DIR / "RAG" / "aroma" / "huiles-essentielles"
OUTPUT_JSON = PROJECT_DIR / "RAG" / "aroma" / "aromatherapie-monographies.json"


# Familles botaniques connues
FAMILLES_BOTANIQUES = [
    "Abietacees", "Abiétacées", "Anacardiacees", "Anacardiacées",
    "Annonacees", "Annonacées", "Apiacees", "Apiacées", "Apiaceae",
    "Asteracees", "Astéracées", "Asteraceae",
    "Burseracees", "Burséracées",
    "Cupressacees", "Cupressacées",
    "Ericacees", "Ericacées",
    "Geraniacees", "Géraniacées",
    "Lamiacees", "Lamiacées", "Lamiaceae",
    "Lauracees", "Lauracées",
    "Myrtacees", "Myrtacées", "Myrtaceae",
    "Oleacees", "Oléacées",
    "Pinacees", "Pinacées",
    "Piperacees", "Pipéracées",
    "Poacees", "Poacées",
    "Rosacees", "Rosacées",
    "Rutacees", "Rutacées",
    "Santalacees", "Santalacées",
    "Styracacees", "Styracées",
    "Valerianacees", "Valérianacées",
    "Verbenacees", "Verbénacées",
    "Zingiberacees", "Zingibéracées",
]

# Pattern pour detecter le debut d'une monographie (nom latin)
# Format: GenreEspece Auteur ou Genre espece Auteur
LATIN_NAME_PATTERN = re.compile(
    r'^([A-Z][a-z]+(?:\s*[x×]\s*)?[a-z]+(?:\s+(?:var\.|ssp\.|subsp\.)\s*[a-z]+)?)\s*'
    r'(?:\([^)]+\)\s*)?'
    r'([A-Z][a-z]*\.?(?:\s*(?:ex|et)\s*[A-Z][a-z]*\.?)?)?$'
)

# Pattern alternatif pour noms colles
LATIN_NAME_PATTERN_ALT = re.compile(
    r'^([A-Z][a-z]+[a-z]+)\s*([A-Z][a-z]*\.?)$'
)


def load_text(filepath: Path) -> str:
    """Charge le fichier texte."""
    print(f"[LOAD] Chargement de {filepath.name}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def find_matiere_medicale_section(text: str) -> Tuple[int, int]:
    """Trouve les limites de la section Matiere Medicale (Livre quatrieme)."""
    lines = text.split('\n')

    start_idx = None
    end_idx = len(lines)

    for i, line in enumerate(lines):
        # Chercher le debut du Livre quatrieme
        if 'LIVREQUATRIÈME' in line or 'LIVRE QUATRIÈME' in line:
            # Chercher la premiere monographie apres
            for j in range(i, min(i + 100, len(lines))):
                if re.match(r'^Abies', lines[j]):
                    start_idx = j
                    break
            if start_idx:
                break

        # Chercher "Annexes" qui marque la fin
        if start_idx and ('Annexes' in line or 'ANNEXES' in line or 'Dictionnaire' in line):
            end_idx = i
            break

    if start_idx is None:
        # Fallback: chercher directement Abies alba
        for i, line in enumerate(lines):
            if line.startswith('AbiesalbaMill') or line.startswith('Abies alba Mill'):
                start_idx = i
                break

    print(f"   Section Matiere Medicale: lignes {start_idx} a {end_idx}")
    return start_idx or 0, end_idx


def is_latin_name_start(line: str) -> Optional[str]:
    """Verifie si la ligne commence par un nom latin d'HE."""
    line = line.strip()
    if not line or len(line) < 5:
        return None

    # Ignorer les lignes de page
    if line.startswith('--- PAGE'):
        return None

    # Ignorer certains mots-cles
    ignore_starts = ['Principes', 'Proprietes', 'Propriétés', 'Indications', 'Contre',
                     'Monoterp', 'Sesquiterp', 'Alcools', 'Esters', 'Oxydes', 'Cetones', 'Cétones',
                     'Aldeh', 'Coumarines', 'Lactones', 'Phenols', 'Phénols', 'Diterpenes',
                     'Negativante', 'Négativante', 'Positivante', 'Anti', 'Cicatri', 'Tonique',
                     'Nervos', 'Dermat', 'Bronch', 'Rhino', 'Entero', 'Lithi', 'Livrequat',
                     'exactement', 'usagetrans', 'dosesphysio']

    for ignore in ignore_starts:
        if line.lower().startswith(ignore.lower()):
            return None

    # Verifier le pattern nom latin (Genre espece Auteur)
    # Ex: "Abies alba Mill." ou "AbiesalbaMill."

    # Pattern 1: Mots separes
    match = re.match(r'^([A-Z][a-z]+)\s+([a-z]+(?:\s+(?:var\.|ssp\.)\s+[a-z]+)?)\s*([A-Z].*)?$', line)
    if match:
        return f"{match.group(1)} {match.group(2)}"

    # Pattern 2: Mots colles (artefact PDF)
    match = re.match(r'^([A-Z][a-z]+)([a-z]{3,})([A-Z][a-z]*\.?)$', line)
    if match:
        return f"{match.group(1)} {match.group(2)}"

    # Pattern 3: Avec x (hybride)
    match = re.match(r'^([A-Z][a-z]+)\s*[x×]\s*([a-z]+)', line)
    if match:
        return f"{match.group(1)} x{match.group(2)}"

    # Pattern 4: Colle avec x
    match = re.match(r'^([A-Z][a-z]+)[Xx]([a-z]+)', line)
    if match:
        return f"{match.group(1)} x{match.group(2)}"

    return None


def extract_french_name_and_family(lines: List[str], start_idx: int) -> Tuple[str, str, str]:
    """Extrait le nom francais, la partie utilisee et la famille botanique."""
    nom_francais = ""
    partie_utilisee = ""
    famille = ""

    # Chercher dans les 3 lignes suivantes
    for i in range(start_idx + 1, min(start_idx + 5, len(lines))):
        line = lines[i].strip()
        if not line or line.startswith('--- PAGE'):
            continue

        # Chercher la famille botanique
        for fam in FAMILLES_BOTANIQUES:
            if fam in line:
                famille = fam
                # Le nom francais est avant la famille
                idx = line.find(fam)
                nom_francais = line[:idx].strip()
                break

        # Chercher la partie utilisee (entre parentheses)
        match = re.search(r'\(([^)]+)\)', line)
        if match and not partie_utilisee:
            partie = match.group(1).lower()
            if any(p in partie for p in ['fl.', 'feuil', 'herb', 'aig.', 'som.', 'ecor', 'bois', 'rac', 'fruit', 'graine', 'zeste', 'res.']):
                partie_utilisee = match.group(1)

        if famille:
            break

    return nom_francais, partie_utilisee, famille


def extract_monographie_content(lines: List[str], start_idx: int, end_idx: int) -> str:
    """Extrait le contenu complet d'une monographie."""
    content_lines = []
    for i in range(start_idx, end_idx):
        line = lines[i]
        # Ignorer les marqueurs de page
        if '--- PAGE' in line:
            continue
        # Ignorer les en-tetes de livre
        if 'Livrequatrième' in line or 'exactement' in line.lower()[:15]:
            continue
        content_lines.append(line)

    return '\n'.join(content_lines)


def clean_monographie_text(text: str) -> str:
    """Nettoie le texte d'une monographie."""
    # Supprimer les lignes vides multiples
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Essayer de separer les mots colles (heuristique simple)
    # Ex: "Principes actifs:" au lieu de "Principesactifs:"

    # Ajouter des espaces avant les sections connues
    sections = ['Principes actifs', 'Proprietes', 'Propriétés', 'Indications', 'Contre-indications']
    for section in sections:
        # Chercher la version collee
        collapsed = section.replace(' ', '').replace('é', 'e')
        if collapsed in text.replace('é', 'e'):
            text = text.replace(collapsed, f'\n{section}')

    return text.strip()


def parse_monographies(text: str) -> List[Dict]:
    """Parse toutes les monographies du texte."""
    print("[PARSE] Extraction des monographies...")

    lines = text.split('\n')
    start_section, end_section = find_matiere_medicale_section(text)

    monographies = []
    current_start = None
    current_latin_name = None

    for i in range(start_section, end_section):
        line = lines[i].strip()

        latin_name = is_latin_name_start(line)

        if latin_name:
            # Sauvegarder la monographie precedente
            if current_start is not None and current_latin_name:
                content = extract_monographie_content(lines, current_start, i)
                nom_fr, partie, famille = extract_french_name_and_family(lines, current_start)

                mono = {
                    'nom_latin': current_latin_name,
                    'nom_francais': nom_fr,
                    'partie_utilisee': partie,
                    'famille_botanique': famille,
                    'contenu': clean_monographie_text(content),
                    'source': "L'aromatherapie exactement - Pierre Franchomme (2001)"
                }
                monographies.append(mono)

            # Nouvelle monographie
            current_start = i
            current_latin_name = latin_name

    # Derniere monographie
    if current_start is not None and current_latin_name:
        content = extract_monographie_content(lines, current_start, end_section)
        nom_fr, partie, famille = extract_french_name_and_family(lines, current_start)

        mono = {
            'nom_latin': current_latin_name,
            'nom_francais': nom_fr,
            'partie_utilisee': partie,
            'famille_botanique': famille,
            'contenu': clean_monographie_text(content),
            'source': "L'aromatherapie exactement - Pierre Franchomme (2001)"
        }
        monographies.append(mono)

    print(f"   [OK] {len(monographies)} monographies extraites")
    return monographies


def save_individual_files(monographies: List[Dict], output_dir: Path):
    """Sauvegarde chaque monographie dans un fichier individuel."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Creer des sous-dossiers par famille
    for mono in monographies:
        famille = mono['famille_botanique'] or 'Autres'
        famille_dir = output_dir / famille.replace('é', 'e').replace('è', 'e')
        famille_dir.mkdir(exist_ok=True)

        # Nom de fichier base sur le nom latin
        filename = mono['nom_latin'].lower().replace(' ', '-').replace('.', '') + '.txt'
        filename = re.sub(r'[^a-z0-9\-]', '', filename) + '.txt'

        filepath = famille_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"# {mono['nom_latin']}\n")
            f.write(f"## {mono['nom_francais']}\n\n")
            if mono['partie_utilisee']:
                f.write(f"**Partie utilisee:** {mono['partie_utilisee']}\n")
            if mono['famille_botanique']:
                f.write(f"**Famille:** {mono['famille_botanique']}\n")
            f.write(f"\n---\n\n")
            f.write(mono['contenu'])

    print(f"[SAVE] Fichiers individuels sauvegardes dans: {output_dir}")


def save_json(monographies: List[Dict], output_path: Path):
    """Sauvegarde toutes les monographies en JSON."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(monographies, f, ensure_ascii=False, indent=2)
    print(f"[SAVE] JSON sauvegarde: {output_path}")
    print(f"   Taille: {output_path.stat().st_size / 1024:.1f} Ko")


def print_statistics(monographies: List[Dict]):
    """Affiche des statistiques sur les monographies extraites."""
    print("\n[STATS] Statistiques:")
    print(f"   Total monographies: {len(monographies)}")

    # Par famille
    familles = {}
    for mono in monographies:
        fam = mono['famille_botanique'] or 'Non classee'
        familles[fam] = familles.get(fam, 0) + 1

    print(f"   Familles botaniques: {len(familles)}")
    for fam, count in sorted(familles.items(), key=lambda x: -x[1])[:10]:
        print(f"      - {fam}: {count}")

    # Quelques exemples
    print("\n   Exemples de HE extraites:")
    for mono in monographies[:5]:
        print(f"      - {mono['nom_latin']} ({mono['nom_francais']})")


def main():
    print("=" * 60)
    print("[AROMA] Extraction des monographies HE")
    print("=" * 60)

    if not INPUT_FILE.exists():
        print(f"[ERREUR] Fichier non trouve: {INPUT_FILE}")
        print("   Executez d'abord convert-aroma-pdf.py")
        return

    # Charger le texte
    text = load_text(INPUT_FILE)

    # Extraire les monographies
    monographies = parse_monographies(text)

    if not monographies:
        print("[ERREUR] Aucune monographie extraite!")
        return

    # Sauvegarder
    save_individual_files(monographies, OUTPUT_DIR)
    save_json(monographies, OUTPUT_JSON)

    # Statistiques
    print_statistics(monographies)

    print("\n" + "=" * 60)
    print("[OK] Extraction terminee!")
    print("=" * 60)


if __name__ == "__main__":
    main()
