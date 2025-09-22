import requests, json, time, re

INPUT_FILE = "mots.txt"
OUTPUT_FILE = "indiceMots.json"

UA = {"User-Agent": "Mozilla/5.0 (compatible; Bot/1.0; +https://example.com/bot)"}

def get_wikitext(mot):
    url = "https://fr.wiktionary.org/w/api.php"
    params = {
        "action": "query",
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
        "format": "json",
        "formatversion": "2",
        "redirects": "1",
        "titles": mot,
    }
    r = requests.get(url, params=params, headers=UA, timeout=15)
    if r.status_code != 200: return None
    pages = r.json().get("query", {}).get("pages", [])
    if not pages or "missing" in pages[0]: return None
    return pages[0]["revisions"][0]["slots"]["main"]["content"]

def fr_section(wtxt: str):
    """Extrait uniquement la section française d'un article Wiktionnaire brut"""
    if not wtxt:
        return None

    # Cherche "== {{langue|fr}} ==" (tolérant aux espaces/majuscules)
    m = re.search(r"==\s*\{\{langue\|fr\}\}\s*==", wtxt, re.IGNORECASE)
    if not m:
        return None

    start = m.start()

    # Découpe à partir de cette position
    s = wtxt[start:]

    # Coupe avant la section suivante "== {{langue|...}} =="
    m2 = re.search(r"==\s*\{\{langue\|[a-z]+\}\}\s*==", s, re.IGNORECASE)
    if m2 and m2.start() != 0:
        s = s[:m2.start()]

    return s.lower()

POS_ORDER = [
    ("verbe", re.compile(r"\{\{s\|verbe\|fr\}\}")),
    ("adjectif", re.compile(r"\{\{s\|adjectif\|fr\}\}")),
    ("adverbe", re.compile(r"\{\{s\|adverbe\|fr\}\}")),
    ("nom propre", re.compile(r"\{\{s\|nom propre\|fr\}\}")),
    ("nom commun", re.compile(r"\{\{s\|nom commun\|fr\}\}")),
    ("nom", re.compile(r"\{\{s\|nom(?: commun)?\|fr\}\}")),
]

LEXI2THEME = {
    "botanique": "botanique",
    "zoologie": "animaux",
    "géographie": "lieu",
    "toponymie": "lieu",
    "médecine": "médecine",
}

def categoriser_from_fr(fr):
    if not fr: return "inconnu"

    # 1) Partie du discours
    for label, rx in POS_ORDER:
        if rx.search(fr):
            if label in ("verbe", "adjectif", "adverbe", "nom commun"):
                return label
            break  # nom / nom propre → on regarde le lexique

    # 2) Lexiques thématiques
    lexiques = re.findall(r"\{\{lexique\|([^}|]+)", fr)
    for lx in lexiques:
        lx = lx.strip().lower()
        if lx in LEXI2THEME:
            return LEXI2THEME[lx]

    # 3) Heuristiques simples
    if re.search(r"\b(oiseau|mammifère|poisson|insecte|reptile|amphibien|animal)\b", fr):
        return "animaux"
    if re.search(r"\b(plante|arbre|fruit|fleur|botanique)\b", fr):
        return "botanique"
    if re.search(r"\b(ville|commune|département|province|pays|région|toponyme)\b", fr):
        return "lieu"
    if re.search(r"\b(médicament|maladie|syndrome|anatomie|corps humain|médecine)\b", fr):
        return "médecine"

    return "autre"

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    mots = [m.strip().strip('"').strip("'") for m in content.split(",") if m.strip()]

    out = []
    for mot in mots:  
        print(f"Analyse : {mot}")
        wtxt = get_wikitext(mot)
        fr = fr_section(wtxt) 
        print((fr or "")[:20])
        cat = categoriser_from_fr(fr)
        out.append({"mot": mot, "categorie": cat})
        time.sleep(0.8)  # évite le throttle

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"OK → {OUTPUT_FILE}")

if __name__ == "__main__":
    main()


