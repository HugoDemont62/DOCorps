"""
test_products.py — Tests automatisés de l'API

On utilise :
- pytest : le framework de test
- TestClient de FastAPI : simule des requêtes HTTP sans lancer de vrai serveur
- jwt : pour générer de faux tokens de test

Conventions pytest :
- Les fichiers de test commencent par test_
- Les fonctions de test commencent par test_
- pytest les découvre automatiquement avec la commande : pytest
"""

import os
import sys
import jwt
import pytest
from fastapi.testclient import TestClient

# Ajoute le dossier parent (product-api/) au PATH Python
# pour pouvoir importer app, database, auth
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import app
from database import DATABASE_PATH
from auth import JWT_SECRET, JWT_ALGORITHM

# --- Setup ---

# TestClient simule un navigateur/client HTTP.
# Il envoie des requêtes à notre app FastAPI SANS lancer uvicorn.
client = TestClient(app)


def make_token(role: str = "admin", user_id: int = 1) -> str:
    """
    Génère un token JWT de test.
    En vrai, c'est l'API Auth PHP qui génère ces tokens.
    Ici on les crée nous-mêmes pour tester.
    """
    payload = {"user_id": user_id, "role": role}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# Headers avec un token admin (pour les routes protégées)
ADMIN_HEADERS = {"Authorization": f"Bearer {make_token('admin')}"}
# Headers avec un token user simple
USER_HEADERS = {"Authorization": f"Bearer {make_token('user')}"}


# --- Fixture de nettoyage ---

@pytest.fixture(autouse=True)
def clean_db():
    """
    Fixture pytest qui s'exécute AVANT et APRÈS chaque test.

    autouse=True : s'applique automatiquement à tous les tests.
    yield : sépare le "avant" du "après".

    Ça garantit que chaque test part d'une base propre.
    """
    # AVANT le test : rien de spécial
    yield
    # APRÈS le test : supprimer le fichier de BDD
    if os.path.exists(DATABASE_PATH):
        os.remove(DATABASE_PATH)


# --- Tests ---

def test_health_check():
    """Le health check ne nécessite pas d'authentification."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_product_as_admin():
    """Un admin peut créer un produit."""
    response = client.post(
        "/products",
        json={
            "name": "Laptop",
            "description": "PC portable puissant",
            "price": 999.99,
            "stock": 10,
            "category": "Informatique"
        },
        headers=ADMIN_HEADERS
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Laptop"
    assert data["price"] == 999.99
    assert data["id"] is not None  # L'ID a été auto-généré


def test_create_product_as_user_forbidden():
    """Un user simple NE PEUT PAS créer de produit -> 403."""
    response = client.post(
        "/products",
        json={"name": "Test", "price": 10.0},
        headers=USER_HEADERS
    )
    assert response.status_code == 403


def test_list_products():
    """Un user authentifié peut lister les produits."""
    # D'abord créer un produit (en tant qu'admin)
    client.post(
        "/products",
        json={"name": "Clavier", "price": 49.99},
        headers=ADMIN_HEADERS
    )
    # Puis lister (en tant qu'user simple)
    response = client.get("/products", headers=USER_HEADERS)
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 1
    assert products[0]["name"] == "Clavier"


def test_get_product_by_id():
    """On peut récupérer un produit par son ID."""
    # Créer
    create_response = client.post(
        "/products",
        json={"name": "Souris", "price": 29.99},
        headers=ADMIN_HEADERS
    )
    product_id = create_response.json()["id"]
    # Lire
    response = client.get(f"/products/{product_id}", headers=USER_HEADERS)
    assert response.status_code == 200
    assert response.json()["name"] == "Souris"


def test_get_product_not_found():
    """Demander un produit qui n'existe pas -> 404."""
    response = client.get("/products/9999", headers=USER_HEADERS)
    assert response.status_code == 404


def test_update_product():
    """Un admin peut modifier un produit."""
    # Créer
    create_response = client.post(
        "/products",
        json={"name": "Ecran", "price": 199.99},
        headers=ADMIN_HEADERS
    )
    product_id = create_response.json()["id"]
    # Modifier
    response = client.put(
        f"/products/{product_id}",
        json={"name": "Ecran 4K", "price": 349.99},
        headers=ADMIN_HEADERS
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Ecran 4K"
    assert response.json()["price"] == 349.99


def test_delete_product():
    """Un admin peut supprimer un produit."""
    # Créer
    create_response = client.post(
        "/products",
        json={"name": "Casque", "price": 79.99},
        headers=ADMIN_HEADERS
    )
    product_id = create_response.json()["id"]
    # Supprimer
    response = client.delete(f"/products/{product_id}", headers=ADMIN_HEADERS)
    assert response.status_code == 200
    # Vérifier qu'il n'existe plus
    response = client.get(f"/products/{product_id}", headers=USER_HEADERS)
    assert response.status_code == 404


def test_no_token_returns_401():
    """Sans token, on reçoit 401 (non authentifié)."""
    response = client.get("/products")
    assert response.status_code in (401, 403)


def test_invalid_token_returns_401():
    """Avec un token bidon, on reçoit 401."""
    headers = {"Authorization": "Bearer token-completement-faux"}
    response = client.get("/products", headers=headers)
    assert response.status_code in (401, 403)
