"""
database.py — Couche d'accès aux données (SQLite)

Ce fichier isole TOUTE la logique base de données.
Si un jour on passe de SQLite à PostgreSQL, on ne modifie QUE ce fichier.
"""

import sqlite3
import os

# Chemin vers le fichier de base de données
# os.path.dirname(__file__) = le dossier où se trouve CE fichier (product-api/)
# Donc products.db sera créé dans product-api/products.db
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "products.db")


def get_db():
    """
    Ouvre une connexion vers la base SQLite.

    row_factory = sqlite3.Row permet d'accéder aux colonnes par nom :
        row["name"] au lieu de row[1]

    C'est comme un dictionnaire pour chaque ligne retournée.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Crée la table 'products' si elle n'existe pas.

    On appelle cette fonction au démarrage de l'app.
    IF NOT EXISTS = si la table existe déjà, ne rien faire (pas d'erreur).
    """
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


# --- Fonctions CRUD ---
# CRUD = Create, Read, Update, Delete
# Ce sont les 4 opérations de base sur une base de données.


def get_all_products():
    """Récupère TOUS les produits de la table."""
    conn = get_db()
    # fetchall() retourne une liste de toutes les lignes
    products = conn.execute("SELECT * FROM products").fetchall()
    conn.close()
    # dict(row) convertit chaque Row SQLite en dictionnaire Python
    # pour que FastAPI puisse le sérialiser en JSON
    return [dict(row) for row in products]


def get_product_by_id(product_id: int):
    """Récupère UN produit par son ID."""
    conn = get_db()
    # Le ? est un placeholder — JAMAIS de f-string dans une requête SQL !
    # Sinon c'est une faille d'injection SQL.
    product = conn.execute(
        "SELECT * FROM products WHERE id = ?", (product_id,)
    ).fetchone()
    conn.close()
    # fetchone() retourne None si aucun résultat
    return dict(product) if product else None


def create_product(name: str, description: str, price: float, stock: int, category: str):
    """
    Insère un nouveau produit dans la base.
    Retourne le produit créé (avec son ID auto-généré).
    """
    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO products (name, description, price, stock, category)
           VALUES (?, ?, ?, ?, ?)""",
        (name, description, price, stock, category)
    )
    conn.commit()
    # lastrowid = l'ID auto-généré par AUTOINCREMENT
    product_id = cursor.lastrowid
    conn.close()
    # On retourne le produit complet en le relisant
    return get_product_by_id(product_id)


def update_product(product_id: int, name: str, description: str, price: float, stock: int, category: str):
    """
    Met à jour un produit existant.
    Retourne le produit modifié, ou None s'il n'existe pas.
    """
    conn = get_db()
    # On met aussi à jour updated_at pour tracer la dernière modification
    cursor = conn.execute(
        """UPDATE products
           SET name = ?, description = ?, price = ?, stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (name, description, price, stock, category, product_id)
    )
    conn.commit()
    conn.close()
    # rowcount = nombre de lignes affectées. Si 0, le produit n'existait pas.
    if cursor.rowcount == 0:
        return None
    return get_product_by_id(product_id)


def delete_product(product_id: int):
    """
    Supprime un produit par son ID.
    Retourne True si supprimé, False si le produit n'existait pas.
    """
    conn = get_db()
    cursor = conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0
