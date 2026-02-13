# Product API - Service de gestion des produits

## Description
API de gestion des produits développée en Node.js ou Python, avec opérations CRUD sécurisées par JWT.

## Endpoints prévus

### Produits
- `GET /products` - Liste tous les produits
- `GET /products/:id` - Récupère un produit spécifique
- `POST /products` - Crée un nouveau produit (admin uniquement)
- `PUT /products/:id` - Met à jour un produit (admin uniquement)
- `DELETE /products/:id` - Supprime un produit (admin uniquement)

## Technologies

### Option Node.js
- Node.js + Express
- MongoDB ou PostgreSQL
- JWT middleware pour la sécurité
- Jest pour les tests

### Option Python
- Python + Flask/FastAPI
- PostgreSQL ou SQLite
- JWT authentication
- Pytest pour les tests

## Schéma de base de données

### Collection/Table `products`
```
- id (INT/ObjectId, PRIMARY KEY)
- name (VARCHAR/String)
- description (TEXT/String)
- price (DECIMAL/Float)
- stock (INT/Integer)
- category (VARCHAR/String)
- created_at (TIMESTAMP/DateTime)
- updated_at (TIMESTAMP/DateTime)
```

## Sécurité
- Authentification JWT obligatoire
- Vérification des rôles (admin pour création/modification/suppression)
- Validation des entrées
- Rate limiting

## Installation

### Node.js
```bash
npm install
npm start
```

### Python
```bash
pip install -r requirements.txt
python app.py
```

## Tests
- Tests unitaires
- Tests d'intégration des endpoints
- Tests de sécurité (accès non autorisés)

## À développer
- [ ] Choix de la technologie (Node.js ou Python)
- [ ] Configuration du projet
- [ ] Connexion à la base de données
- [ ] Implémentation des endpoints CRUD
- [ ] Middleware JWT
- [ ] Tests automatisés
- [ ] Dockerfile
