# Auth API - Service d'authentification PHP

## Description
API d'authentification développée en PHP, responsable de la gestion des utilisateurs et de l'authentification JWT.

## Endpoints prévus

### Authentification
- `POST /register` - Inscription d'un nouvel utilisateur
- `POST /login` - Connexion et génération du JWT
- `GET /me` - Récupération des informations de l'utilisateur connecté
- `POST /logout` - Déconnexion

## Technologies
- PHP 8.1+
- JWT (JSON Web Tokens)
- MySQL ou SQLite
- Framework PHP (optionnel : Slim, Laravel, Symfony...)

## Schéma de base de données

### Table `users`
```sql
- id (INT, PRIMARY KEY)
- username (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- role (ENUM: 'user', 'admin')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Sécurité
- Hashage des mots de passe (bcrypt)
- Validation des entrées utilisateur
- Protection contre les injections SQL
- Gestion des rôles (user/admin)
- Durée de vie limitée des tokens JWT

## Installation

```bash
# À compléter lors de la mise en place
composer install
php -S localhost:8080
```

## Tests
- Tests unitaires avec PHPUnit
- Tests d'intégration des endpoints

## À développer
- [ ] Configuration du projet PHP
- [ ] Connexion à la base de données
- [ ] Implémentation des endpoints
- [ ] Gestion JWT
- [ ] Tests PHPUnit
- [ ] Dockerfile
