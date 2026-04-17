# Documentation API — DevOpsCorp

## Sommaire

- [Auth API (PHP)](#auth-api-php)
- [Product API (Python / FastAPI)](#product-api-python--fastapi)
- [Authentification JWT](#authentification-jwt)
- [Codes HTTP](#codes-http)
- [Exemples curl](#exemples-curl)

---

## Auth API (PHP)

**Base URL locale :** `http://localhost:8080`  
**Base URL production :** `https://docorps-auth-api.onrender.com`

### Endpoints

#### `POST /api/register` — Inscription

Crée un nouvel utilisateur. Pas d'authentification requise.

**Body JSON :**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "monmotdepasse"
}
```

Règles de validation :
- `username` : minimum 3 caractères
- `email` : format email valide
- `password` : minimum 6 caractères

**Réponse 201 :**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Erreurs possibles :**
| Code | Cas |
|---|---|
| 400 | Champ manquant ou invalide |
| 409 | Email ou username déjà utilisé |

---

#### `POST /api/login` — Connexion

Authentifie un utilisateur et retourne un token JWT.

**Body JSON :**
```json
{
  "email": "john@example.com",
  "password": "monmotdepasse"
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

Le token JWT est signé HS256 et expire après **1 heure** (`JWT_EXPIRATION=3600`).

**Erreurs possibles :**
| Code | Cas |
|---|---|
| 400 | Email ou mot de passe absent |
| 401 | Identifiants incorrects |

---

#### `GET /api/me` — Profil utilisateur connecté

Retourne les informations de l'utilisateur associé au token.

**Header requis :**
```
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Erreurs possibles :**
| Code | Cas |
|---|---|
| 401 | Token absent ou invalide |
| 404 | Utilisateur introuvable en base |

---

#### `POST /api/logout` — Déconnexion

Déconnexion logique : la suppression du token est gérée côté client.

**Header requis :**
```
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### `GET /health` — Health check

**Réponse 200 :**
```json
{
  "status": "ok",
  "service": "auth-api",
  "timestamp": "2026-04-17 10:00:00"
}
```

---

## Product API (Python / FastAPI)

**Base URL locale :** `http://localhost:5000`  
**Base URL production :** `https://docorps-product-api.onrender.com`  
**Swagger interactif local :** `http://localhost:5000/docs`  
**Swagger interactif production :** `https://docorps-product-api.onrender.com/docs`

Toutes les routes (sauf `/health`) requièrent un token JWT valide dans le header `Authorization: Bearer`.

Les routes POST, PUT, DELETE exigent en plus le rôle `admin`.

### Modèle produit

```json
{
  "id": 1,
  "name": "Laptop Pro",
  "description": "Ordinateur portable haute performance",
  "price": 1299.99,
  "stock": 15,
  "category": "Informatique",
  "created_at": "2026-04-17T10:00:00",
  "updated_at": "2026-04-17T10:00:00"
}
```

### Endpoints

#### `GET /products` — Lister tous les produits

**Rôle requis :** `user` ou `admin`

**Header requis :**
```
Authorization: Bearer <token>
```

**Réponse 200 :** tableau de produits
```json
[
  {
    "id": 1,
    "name": "Laptop Pro",
    "description": "Ordinateur portable haute performance",
    "price": 1299.99,
    "stock": 15,
    "category": "Informatique",
    "created_at": "2026-04-17T10:00:00",
    "updated_at": "2026-04-17T10:00:00"
  }
]
```

---

#### `GET /products/{id}` — Détail d'un produit

**Rôle requis :** `user` ou `admin`

**Header requis :**
```
Authorization: Bearer <token>
```

**Réponse 200 :** objet produit (même structure que ci-dessus)

**Erreurs possibles :**
| Code | Cas |
|---|---|
| 401 | Token absent ou invalide |
| 404 | Produit introuvable |

---

#### `POST /products` — Créer un produit

**Rôle requis :** `admin` uniquement

**Header requis :**
```
Authorization: Bearer <token>
```

**Body JSON :**
```json
{
  "name": "Nouveau produit",
  "description": "Description optionnelle",
  "price": 49.99,
  "stock": 100,
  "category": "Catégorie optionnelle"
}
```

Seuls `name` et `price` sont obligatoires. `stock` vaut `0` par défaut.

**Réponse 201 :** objet produit créé (avec son `id` auto-généré)

**Erreurs possibles :**
| Code | Cas |
|---|---|
| 401 | Token absent ou invalide |
| 403 | Rôle insuffisant (pas admin) |
| 422 | Données invalides (ex: price non numérique) |

---

#### `PUT /products/{id}` — Modifier un produit

**Rôle requis :** `admin` uniquement

**Header requis :**
```
Authorization: Bearer <token>
```

**Body JSON :** même structure que POST (tous les champs requis)

**Réponse 200 :** objet produit mis à jour

**Erreurs possibles :**
| Code | Cas |
|---|---|
| 401 | Token absent ou invalide |
| 403 | Rôle insuffisant |
| 404 | Produit introuvable |
| 422 | Données invalides |

---

#### `DELETE /products/{id}` — Supprimer un produit

**Rôle requis :** `admin` uniquement

**Header requis :**
```
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{ "message": "Produit supprimé" }
```

**Erreurs possibles :**
| Code | Cas |
|---|---|
| 401 | Token absent ou invalide |
| 403 | Rôle insuffisant |
| 404 | Produit introuvable |

---

#### `GET /health` — Health check

**Réponse 200 :**
```json
{ "status": "ok" }
```

---

#### `GET /metrics` — Métriques Prometheus

Retourne les métriques au format texte Prometheus (scrapé automatiquement, pas d'usage manuel attendu).

---

## Authentification JWT

Les deux APIs partagent le **même `JWT_SECRET`** (variable d'environnement). Le token est généré par l'Auth API (PHP) et vérifié par la Product API (Python).

**Structure du payload JWT :**
```json
{
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  },
  "iat": 1713344400,
  "exp": 1713348000
}
```

**Algorithme :** HS256  
**Durée :** 3600 secondes (1 heure)

Pour utiliser le token dans une requête :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Codes HTTP

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide (champ manquant ou malformé) |
| 401 | Non authentifié (token absent, invalide ou expiré) |
| 403 | Accès interdit (rôle insuffisant) |
| 404 | Ressource introuvable |
| 409 | Conflit (email ou username déjà pris) |
| 422 | Entité non traitable (validation Pydantic) |
| 500 | Erreur serveur interne |

---

## Exemples curl

### S'inscrire
```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'
```

### Se connecter et récupérer le token
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}' | jq -r '.token')
```

### Lister les produits
```bash
curl http://localhost:5000/products \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un produit (admin requis)
```bash
curl -X POST http://localhost:5000/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Clavier mécanique","price":89.99,"stock":30,"category":"Périphériques"}'
```

### Supprimer un produit (admin requis)
```bash
curl -X DELETE http://localhost:5000/products/1 \
  -H "Authorization: Bearer $TOKEN"
```
