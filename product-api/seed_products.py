"""
Insère des produits de démonstration dans products.db (SQLite).

Usage (depuis le dossier product-api) :
  python seed_products.py
  python seed_products.py --force   # ajoute même si la table contient déjà des lignes

Dans Docker (conteneur product-api arrêté ou depuis l’hôte avec le volume monté) :
  docker compose exec product-api python /app/seed_products.py
"""

import argparse
import sys

from database import init_db, get_all_products, create_product

DEMO_PRODUCTS = [
    {
        "name": "Clavier mécanique DevOps",
        "description": "Switches bleus, rétroéclairage RGB, layout AZERTY",
        "price": 129.99,
        "stock": 42,
        "category": "Périphériques",
    },
    {
        "name": "Souris ergonomique",
        "description": "Capteur 16000 DPI, 7 boutons programmables",
        "price": 79.5,
        "stock": 88,
        "category": "Périphériques",
    },
    {
        "name": "Écran 27\" QHD",
        "description": "IPS 144 Hz, compatible VESA, idéal CI/CD en continu",
        "price": 349.0,
        "stock": 15,
        "category": "Affichage",
    },
    {
        "name": "NAS 4 baies",
        "description": "Stockage réseau pour artefacts de build et backups",
        "price": 599.99,
        "stock": 6,
        "category": "Stockage",
    },
    {
        "name": "Licence monitoring (illustration)",
        "description": "Placeholder métier — stack Prometheus + Grafana",
        "price": 0.0,
        "stock": 999,
        "category": "Services",
    },
]


def main():
    parser = argparse.ArgumentParser(description="Seed produits de démo")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Insérer les démos même si des produits existent déjà",
    )
    args = parser.parse_args()

    init_db()
    existing = get_all_products()
    if existing and not args.force:
        print(
            f"La base contient déjà {len(existing)} produit(s). "
            "Rien n'a été ajouté. Utilisez --force pour ajouter quand même.",
            file=sys.stderr,
        )
        return 1

    for p in DEMO_PRODUCTS:
        create_product(
            name=p["name"],
            description=p["description"],
            price=p["price"],
            stock=p["stock"],
            category=p["category"],
        )
        print(f"  + {p['name']}")

    print(f"OK — {len(DEMO_PRODUCTS)} produit(s) inséré(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
