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

    # Seed : insérer des produits de démo si la table est vide
    count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if count == 0:
        seed_products = [
            ("Clavier mécanique RGB", "Switches Cherry MX Red, rétroéclairage RGB", 89.99, 45, "Périphériques"),
            ("Écran 27\" 4K", "Résolution 3840x2160, IPS, 60Hz", 349.99, 12, "Moniteurs"),
            ("Souris sans fil", "Capteur optique 16000 DPI, autonomie 70h", 59.99, 78, "Périphériques"),
            ("SSD NVMe 1To", "Vitesse lecture 3500 Mo/s, écriture 3000 Mo/s", 79.99, 150, "Stockage"),
            ("Casque audio Bluetooth", "Réduction de bruit active, 30h d'autonomie", 129.99, 33, "Audio"),
            ("Webcam Full HD", "1080p 30fps, microphone intégré, autofocus", 49.99, 60, "Périphériques"),
            ("Hub USB-C 7-en-1", "HDMI, USB 3.0 x3, SD, ethernet, charge 100W", 39.99, 95, "Accessoires"),
            ("RAM DDR5 32Go", "Kit 2x16Go, 5600MHz, CL36", 119.99, 40, "Composants"),
            ("Carte graphique RTX 4070", "12Go GDDR6X, DLSS 3, Ray Tracing", 599.99, 8, "Composants"),
            ("Alimentation 750W Gold", "Modulaire, 80+ Gold, ventilateur 120mm silencieux", 94.99, 55, "Composants"),
            ("Boîtier PC ATX", "Verre trempé, 3 ventilateurs ARGB inclus", 69.99, 30, "Composants"),
            ("Tapis de souris XXL", "900x400mm, surface micro-tissée, base antidérapante", 19.99, 200, "Accessoires"),
            ("Câble HDMI 2.1 3m", "8K 60Hz, 4K 120Hz, eARC, certifié Ultra High Speed", 14.99, 300, "Accessoires"),
            ("Station d'accueil USB-C", "Double écran 4K, ethernet Gigabit, charge 96W", 149.99, 20, "Accessoires"),
            ("Microphone USB cardioïde", "Condensateur, filtre anti-pop intégré, monitoring", 69.99, 42, "Audio"),
            ("Enceintes PC 2.1", "Subwoofer 30W, satellites 2x10W, Bluetooth 5.0", 54.99, 65, "Audio"),
            ("Processeur Ryzen 7 7800X3D", "8 cœurs, 16 threads, 3D V-Cache 96Mo", 399.99, 15, "Composants"),
            ("Refroidisseur AIO 240mm", "Pompe silencieuse, 2 ventilateurs PWM, écran LCD", 109.99, 25, "Composants"),
            ("Clé USB 128Go", "USB 3.2 Gen 1, lecture 400 Mo/s, métal ultra-compact", 12.99, 500, "Stockage"),
            ("Disque dur externe 4To", "USB 3.0, 2.5 pouces, sauvegarde automatique", 99.99, 70, "Stockage"),
        ]
        conn.executemany(
            "INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)",
            seed_products
        )

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
