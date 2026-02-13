# Documentation API

## Description
Documentation complète des APIs du projet DevOpsCorp.

## APIs disponibles

### 1. Auth API (PHP)
Port : `8080`  
Base URL : `http://localhost:8080/api`

#### Endpoints

##### POST /register
Inscription d'un nouvel utilisateur

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
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

##### POST /login
Connexion et génération du JWT

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
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

##### GET /me
Récupération des informations de l'utilisateur connecté

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
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

##### POST /logout
Déconnexion

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2. Product API (Node.js/Python)
Port : `5000`  
Base URL : `http://localhost:5000/api`

#### Endpoints

##### GET /products
Liste tous les produits

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Product 1",
      "description": "Description of product 1",
      "price": 29.99,
      "stock": 100,
      "category": "Electronics"
    }
  ]
}
```

##### GET /products/:id
Récupère un produit spécifique

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Product 1",
    "description": "Description of product 1",
    "price": 29.99,
    "stock": 100,
    "category": "Electronics"
  }
}
```

##### POST /products
Crée un nouveau produit (admin uniquement)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "string",
  "description": "string",
  "price": 0,
  "stock": 0,
  "category": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": 2,
    "name": "New Product",
    "description": "Description",
    "price": 49.99,
    "stock": 50,
    "category": "Electronics"
  }
}
```

##### PUT /products/:id
Met à jour un produit (admin uniquement)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "string",
  "description": "string",
  "price": 0,
  "stock": 0,
  "category": "string"
}
```

##### DELETE /products/:id
Supprime un produit (admin uniquement)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès interdit (droits insuffisants) |
| 404 | Ressource non trouvée |
| 409 | Conflit (ex: email déjà utilisé) |
| 500 | Erreur serveur |

## Authentification

Toutes les routes (sauf /register et /login) nécessitent un token JWT dans le header :

```
Authorization: Bearer <votre_token_jwt>
```

## Collection Postman

Une collection Postman sera disponible dans ce dossier : `DevOpsCorp.postman_collection.json`

## Swagger/OpenAPI

Documentation interactive disponible à :
- Auth API : `http://localhost:8080/api-docs`
- Product API : `http://localhost:5000/api-docs`

## À créer
- [ ] Fichiers Swagger/OpenAPI (YAML)
- [ ] Collection Postman
- [ ] Exemples de requêtes curl
- [ ] Documentation des codes d'erreur détaillés
- [ ] Exemples d'utilisation avancée
