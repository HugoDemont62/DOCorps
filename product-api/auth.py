"""
auth.py — Middleware d'authentification JWT

Comment ça marche (le flux complet) :
1. L'utilisateur se connecte via l'API Auth (PHP) -> reçoit un token JWT
2. Pour chaque requête à l'API Produits, il envoie ce token dans le header :
      Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
3. Ce fichier vérifie le token, extrait les infos (user_id, role)
4. Si le token est invalide ou absent -> erreur 401 (non authentifié)
5. Si le rôle n'est pas suffisant -> erreur 403 (interdit)
"""

import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# --- Configuration ---

# La clé secrète DOIT être la même que celle utilisée par l'API Auth PHP
# En production, on la passe via une variable d'environnement
# os.environ.get() essaie de lire la variable, sinon utilise la valeur par défaut
JWT_SECRET = os.environ.get("JWT_SECRET", "devops-secret-key")

# L'algorithme de signature — HS256 est le plus courant
JWT_ALGORITHM = "HS256"

# HTTPBearer() dit à FastAPI : "cette route attend un header Authorization: Bearer <token>"
# Ça apparaît aussi dans la doc Swagger auto-générée (le petit cadenas)
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dépendance FastAPI qui vérifie le token JWT.

    'Depends(security)' signifie :
    - FastAPI extrait automatiquement le token du header Authorization
    - Si le header est absent, FastAPI retourne 401 tout seul

    On l'utilise dans les routes comme ça :
        @app.get("/products")
        def list_products(user = Depends(get_current_user)):
            ...

    Retourne un dict avec les infos de l'utilisateur : {"user_id": 1, "role": "admin", ...}
    """
    token = credentials.credentials  # Le token brut (sans le "Bearer " devant)

    try:
        # jwt.decode() vérifie la signature ET décode le contenu (payload)
        # Si la signature ne correspond pas à JWT_SECRET -> exception
        # Si le token est expiré -> exception
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # L'API Auth PHP génère un JWT avec la structure : { iat, exp, data: { id, username, email, role } }
        # On extrait les infos depuis le champ "data" pour les rendre accessibles directement
        if "data" in payload:
            data = payload["data"]
            return {
                "user_id": data.get("id"),
                "role": data.get("role"),
                "username": data.get("username"),
                "email": data.get("email"),
            }

        return payload

    except jwt.ExpiredSignatureError:
        # Le token était valide mais a expiré
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré"
        )
    except jwt.InvalidTokenError:
        # Le token est malformé ou la signature est invalide
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )


def require_admin(user: dict = Depends(get_current_user)):
    """
    Dépendance qui vérifie que l'utilisateur est admin.

    Elle dépend elle-même de get_current_user (chaîne de dépendances).
    Donc FastAPI exécute d'abord get_current_user, puis require_admin.

    Usage :
        @app.post("/products")
        def create(user = Depends(require_admin)):
            ...
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return user
