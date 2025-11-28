#!/usr/bin/env python3
"""
Script de conversion du PDF "L'aromathérapie exactement" de Pierre Franchomme
en fichiers texte exploitables pour l'ingestion RAG.

Étape 1: Conversion PDF -> Texte brut
Étape 2: Extraction des monographies d'huiles essentielles (script séparé)
"""

import os
import re
import sys
from pathlib import Path

# Essayer d'importer pypdf
try:
    from pypdf import PdfReader
except ImportError:
    print("Erreur: pypdf n'est pas installé. Installez-le avec: pip install pypdf")
    sys.exit(1)

# Chemins
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
PDF_PATH = PROJECT_DIR / "RAG" / "aroma" / "L'aromatherapie exactement - Pierre Franchomme.pdf"
OUTPUT_DIR = PROJECT_DIR / "RAG" / "aroma" / "extracted"
OUTPUT_TXT = OUTPUT_DIR / "aromatherapie-exactement-full.txt"
OUTPUT_MD = OUTPUT_DIR / "aromatherapie-exactement-full.md"


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extrait le texte de toutes les pages du PDF."""
    print(f"[PDF] Ouverture du PDF: {pdf_path.name}")

    reader = PdfReader(str(pdf_path))
    total_pages = len(reader.pages)
    print(f"   Total pages: {total_pages}")

    all_text = []

    for i, page in enumerate(reader.pages):
        if i % 50 == 0:
            print(f"   Extraction page {i+1}/{total_pages}...")

        text = page.extract_text()
        if text:
            # Ajouter un marqueur de page pour faciliter la navigation
            all_text.append(f"\n\n--- PAGE {i+1} ---\n\n")
            all_text.append(text)

    print(f"   [OK] Extraction terminee")
    return "".join(all_text)


def clean_text(text: str) -> str:
    """Nettoie le texte extrait du PDF."""
    print("[CLEAN] Nettoyage du texte...")

    # Supprimer les retours chariot Windows
    text = text.replace('\r', '')

    # Normaliser les espaces multiples
    text = re.sub(r'[ \t]+', ' ', text)

    # Supprimer les lignes vides multiples (garder max 2)
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    # Nettoyer les espaces en début/fin de ligne
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)

    print("   [OK] Nettoyage termine")
    return text


def save_as_txt(text: str, output_path: Path):
    """Sauvegarde le texte brut."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"[SAVE] Fichier TXT sauvegarde: {output_path}")
    print(f"   Taille: {output_path.stat().st_size / 1024 / 1024:.2f} Mo")


def convert_to_markdown(text: str) -> str:
    """Convertit le texte en format Markdown avec structure."""
    print("[MD] Conversion en Markdown...")

    lines = text.split('\n')
    md_lines = []

    for line in lines:
        # Détecter les marqueurs de page
        if line.startswith('--- PAGE'):
            md_lines.append(f"\n<!--{line}-->\n")
            continue

        # Détecter les titres potentiels (lignes en majuscules ou patterns spécifiques)
        stripped = line.strip()

        # Titres de chapitres (souvent en majuscules)
        if stripped and len(stripped) > 3 and stripped.isupper() and len(stripped) < 100:
            md_lines.append(f"\n## {stripped.title()}\n")
        # Noms latins d'huiles essentielles (pattern typique)
        elif re.match(r'^[A-Z][a-z]+ [a-z]+ (?:var\.|subsp\.|L\.|Mill\.|Burm\.)', stripped):
            md_lines.append(f"\n### {stripped}\n")
        # Sous-titres potentiels
        elif stripped.endswith(':') and len(stripped) < 80 and not stripped[0].isdigit():
            md_lines.append(f"\n**{stripped}**\n")
        else:
            md_lines.append(line)

    print("   [OK] Conversion Markdown terminee")
    return '\n'.join(md_lines)


def save_as_md(text: str, output_path: Path):
    """Sauvegarde le texte en Markdown."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Ajouter un en-tête
    header = """# L'Aromathérapie Exactement
## Pierre Franchomme, Roger Jollois, Daniel Pénoël

*Encyclopédie de l'utilisation thérapeutique des huiles essentielles*

---

"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(header + text)

    print(f"[SAVE] Fichier Markdown sauvegarde: {output_path}")
    print(f"   Taille: {output_path.stat().st_size / 1024 / 1024:.2f} Mo")


def analyze_content(text: str):
    """Analyse le contenu pour identifier la structure."""
    print("\n[ANALYSE] Analyse du contenu...")

    # Compter les pages
    pages = re.findall(r'--- PAGE (\d+) ---', text)
    print(f"   Pages extraites: {len(pages)}")

    # Chercher des patterns d'huiles essentielles
    # Pattern typique: Nom latin suivi de famille botanique
    he_patterns = re.findall(r'([A-Z][a-z]+ [a-z]+(?:\s+(?:var\.|subsp\.)\s+[a-z]+)?)\s*(?:\([^)]+\))?', text)
    unique_he = set(he_patterns[:500])  # Limiter pour éviter trop de bruit

    # Chercher les familles botaniques
    families = re.findall(r'(Lamiaceae|Lauraceae|Myrtaceae|Rutaceae|Apiaceae|Asteraceae|Pinaceae|Geraniaceae|Rosaceae|Cupressaceae)', text, re.IGNORECASE)
    unique_families = set(families)

    print(f"   Familles botaniques trouvées: {len(unique_families)}")
    if unique_families:
        print(f"      {', '.join(sorted(unique_families)[:10])}...")

    # Chercher des sections typiques
    sections = re.findall(r'^(CHAPITRE|PARTIE|SOMMAIRE|INDEX|TABLE|MONOGRAPHIE)', text, re.MULTILINE | re.IGNORECASE)
    print(f"   Marqueurs de sections trouvés: {len(sections)}")

    return {
        'total_pages': len(pages),
        'families': list(unique_families),
        'sections': len(sections)
    }


def main():
    print("=" * 60)
    print("[AROMA] Conversion PDF Aromatherapie Exactement")
    print("=" * 60)

    # Verifier que le PDF existe
    if not PDF_PATH.exists():
        print(f"[ERREUR] PDF non trouve: {PDF_PATH}")
        sys.exit(1)

    print(f"[PDF] Source: {PDF_PATH}")
    print(f"   Taille: {PDF_PATH.stat().st_size / 1024 / 1024:.2f} Mo")

    # Étape 1: Extraction du texte
    raw_text = extract_text_from_pdf(PDF_PATH)

    # Étape 2: Nettoyage
    cleaned_text = clean_text(raw_text)

    # Étape 3: Sauvegarde TXT
    save_as_txt(cleaned_text, OUTPUT_TXT)

    # Étape 4: Conversion et sauvegarde Markdown
    md_text = convert_to_markdown(cleaned_text)
    save_as_md(md_text, OUTPUT_MD)

    # Étape 5: Analyse du contenu
    stats = analyze_content(cleaned_text)

    print("\n" + "=" * 60)
    print("[OK] Conversion terminee!")
    print("=" * 60)
    print(f"\nFichiers generes dans: {OUTPUT_DIR}")
    print(f"  - aromatherapie-exactement-full.txt")
    print(f"  - aromatherapie-exactement-full.md")
    print(f"\nProchaine etape: Executer le script d'extraction des monographies HE")


if __name__ == "__main__":
    main()
