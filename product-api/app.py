"""
app.py — Application principale FastAPI

C'est le point d'entrée de l'API.
On y définit toutes les routes (endpoints) et on assemble les briques
(database.py pour la BDD, auth.py pour la sécurité).

Pour lancer : uvicorn app:app --reload
              ^^^^^^     ^^^
              fichier    variable FastAPI dans ce fichier
"""

import os

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from database import init_db, get_all_products, get_product_by_id, create_product, update_product, delete_product
from auth import get_current_user, require_admin

# --- Modèles Pydantic ---
# Pydantic valide automatiquement les données entrantes.
# Si un client envoie price="abc" au lieu d'un nombre, FastAPI retourne
# une erreur 422 avec un message clair, SANS qu'on écrive du code de validation.


class ProductCreate(BaseModel):
    """Schéma pour la création d'un produit (ce que le client envoie)."""
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: Optional[str] = None


class ProductUpdate(BaseModel):
    """Schéma pour la mise à jour (identique à la création ici)."""
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: Optional[str] = None


# --- Création de l'app FastAPI ---

app = FastAPI(
    title="Product API",
    description="API CRUD de gestion des produits — DOCorps",
    version="1.0.0"
)

# --- CORS ---
# Permet au frontend (port 3000) d'appeler cette API (port 5000)
cors_origin = os.environ.get("CORS_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Événement de démarrage ---

@app.on_event("startup")
def startup():
    """
    S'exécute UNE SEULE FOIS quand le serveur démarre.
    On en profite pour créer la table si elle n'existe pas.
    """
    init_db()


# --- Routes ---

# HEALTH CHECK — Pas d'auth requise
# Utile pour Docker (HEALTHCHECK) et le monitoring (Prometheus)
@app.get("/health")
def health_check():
    return {"status": "ok"}


# GET /products — Lister tous les produits
# Requires: être authentifié (user ou admin)
@app.get("/products")
def list_products(user: dict = Depends(get_current_user)):
    """
    Retourne la liste de tous les produits.
    Le paramètre 'user' est injecté par Depends — on ne l'appelle pas nous-mêmes.
    """
    return get_all_products()


# GET /products/{product_id} — Détail d'un produit
@app.get("/products/{product_id}")
def read_product(product_id: int, user: dict = Depends(get_current_user)):
    """
    Retourne un produit par son ID.
    {product_id} dans l'URL devient le paramètre product_id de la fonction.
    FastAPI le convertit automatiquement en int.
    """
    product = get_product_by_id(product_id)
    if not product:
        # 404 = ressource non trouvée, c'est le code HTTP standard
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    return product


# POST /products — Créer un produit (admin uniquement)
@app.post("/products", status_code=status.HTTP_201_CREATED)
def create_new_product(product: ProductCreate, user: dict = Depends(require_admin)):
    """
    Crée un nouveau produit.

    - 'product: ProductCreate' : FastAPI lit le body JSON et le valide avec Pydantic
    - 'Depends(require_admin)' : vérifie le JWT ET que le rôle = admin
    - status_code=201 : convention HTTP pour "ressource créée"
    """
    return create_product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category=product.category
    )


# PUT /products/{product_id} — Modifier un produit (admin uniquement)
@app.put("/products/{product_id}")
def update_existing_product(product_id: int, product: ProductUpdate, user: dict = Depends(require_admin)):
    """
    Met à jour un produit existant.
    Combine un paramètre d'URL (product_id) et un body JSON (product).
    """
    updated = update_product(
        product_id=product_id,
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category=product.category
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    return updated


# DELETE /products/{product_id} — Supprimer un produit (admin uniquement)
@app.delete("/products/{product_id}")
def delete_existing_product(product_id: int, user: dict = Depends(require_admin)):
    """Supprime un produit. Retourne 404 s'il n'existe pas."""
    deleted = delete_product(product_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    return {"message": "Produit supprimé"}
