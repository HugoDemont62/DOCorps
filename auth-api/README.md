# Auth API - Service d'authentification PHP 🔐

## Description
API d'authentification RESTful développée en PHP 8.1+ avec SQLite, responsable de la gestion des utilisateurs et de l'authentification JWT pour le projet DevOpsCorp.

## URLs

| Environnement | URL |
|---|---|
| Local (Docker Compose) | <http://localhost:8080> |
| Production (Render) | <https://docorps-auth-api.onrender.com/> |
| Health check production | <https://docorps-auth-api.onrender.com/health> |

## Fonctionnalités

✅ **Authentification complète**
- Inscription utilisateur avec validation
- Connexion avec JWT
- Vérification du token
- Déconnexion

✅ **Sécurité**
- Hashage bcrypt des mots de passe
- Tokens JWT sécurisés
- Protection CORS
- Validation des entrées
- Headers de sécurité

✅ **Base de données SQLite**
- Pas de serveur DB requis
- Base de données fichier
- Migrations automatiques

## Endpoints API

### Routes publiques

#### POST `/api/register`
Inscription d'un nouvel utilisateur

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
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
    "role": "user",
    "created_at": "2026-02-13 10:30:00"
  }
}
```

#### POST `/api/login`
Connexion et génération du token JWT

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
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

### Routes protégées (nécessitent un token)

#### GET `/api/me`
Récupère les informations de l'utilisateur connecté

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
    "role": "user",
    "created_at": "2026-02-13 10:30:00"
  }
}
```

#### POST `/api/logout`
Déconnexion de l'utilisateur

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

### Health Check

#### GET `/health`
Vérification de l'état de l'API

**Response (200):**
```json
{
  "status": "ok",
  "service": "auth-api",
  "timestamp": "2026-02-13 10:30:00"
}
```

## Technologies

- **PHP 8.1+** - Langage backend
- **SQLite** - Base de données
- **Firebase JWT** - Gestion des tokens JWT
- **PHPUnit** - Tests unitaires
- **Apache** - Serveur web
- **Docker** - Conteneurisation

## Installation et Démarrage

### Prérequis
- PHP 8.1 ou supérieur
- Composer
- Extension PHP : pdo_sqlite

### Installation locale

```bash
# Se placer dans le dossier auth-api
cd auth-api

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement si nécessaire
nano .env

# Créer le dossier database
mkdir -p database

# Lancer le serveur de développement PHP
php -S localhost:8080 -t public
```

L'API sera accessible sur `http://localhost:8080`

### Démarrage avec Docker

```bash
# Construire l'image
docker build -t devopscorp-auth-api .

# Lancer le conteneur
docker run -p 8080:80 -v $(pwd)/database:/var/www/html/database devopscorp-auth-api
```

### Avec Docker Compose (depuis la racine du projet)

```bash
docker-compose up auth-api
```

## Structure du projet

```
auth-api/
├── public/              # Point d'entrée web
│   ├── index.php       # Router principal
│   └── .htaccess       # Configuration Apache
├── src/                # Code source
│   ├── Core/          # Classes core
│   │   ├── Database.php
│   │   ├── Router.php
│   │   └── JWT.php
│   ├── Models/        # Modèles de données
│   │   └── User.php
│   └── Controllers/   # Contrôleurs
│       └── AuthController.php
├── tests/             # Tests PHPUnit
│   ├── UserTest.php
│   └── JWTTest.php
├── database/          # Base de données SQLite
│   └── auth.db       # (généré automatiquement)
├── .env.example       # Template variables d'env
├── composer.json      # Dépendances PHP
├── phpunit.xml        # Configuration PHPUnit
├── Dockerfile         # Image Docker
└── README.md         # Cette documentation
```

## Schéma de base de données

### Table `users`
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table `tokens` (pour blacklist future)
```sql
CREATE TABLE tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Tests

### Exécuter les tests

```bash
# Tests unitaires
composer test

# Tests avec couverture
composer test:coverage

# Voir le rapport de couverture
open coverage/index.html
```

### Tests manuels avec curl

```bash
# 1. Inscription
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Connexion
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Récupérer le profil (remplacer <TOKEN> par le token reçu)
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer <TOKEN>"

# 4. Déconnexion
curl -X POST http://localhost:8080/api/logout \
  -H "Authorization: Bearer <TOKEN>"

# 5. Health check
curl http://localhost:8080/health
```

## Configuration

### Variables d'environnement (.env)

```env
# Application
APP_ENV=development
APP_DEBUG=true

# Database
DB_PATH=database/auth.db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Security
BCRYPT_COST=12
CORS_ORIGIN=http://localhost:3000
```

## Sécurité

### Mesures implémentées
- ✅ Hashage bcrypt avec cost configurable
- ✅ Validation stricte des entrées
- ✅ Protection contre les injections SQL (PDO prepared statements)
- ✅ Headers de sécurité (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ CORS configurable
- ✅ JWT avec expiration
- ✅ Vérification de l'unicité email/username

### Recommandations pour la production
- Utiliser HTTPS obligatoirement
- Changer `JWT_SECRET` en valeur forte et aléatoire
- Augmenter `BCRYPT_COST` si le serveur le permet
- Implémenter un rate limiting
- Ajouter une blacklist de tokens
- Logger les tentatives de connexion échouées

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide (validation échouée) |
| 401 | Non authentifié (token invalide/absent) |
| 404 | Ressource non trouvée |
| 409 | Conflit (email/username déjà utilisé) |
| 500 | Erreur serveur |

## Développement

### Ajouter un nouveau endpoint

1. Ajouter la route dans `public/index.php`
2. Créer la méthode dans le contrôleur approprié
3. Ajouter les tests dans `tests/`

### Exemple :

```php
// Dans public/index.php
$router->get('/api/users', 'UserController@list');

// Dans src/Controllers/UserController.php
public function list(): array
{
    $users = User::all();
    return ['success' => true, 'users' => $users];
}
```

## Troubleshooting

### La base de données n'est pas créée
```bash
mkdir -p database
chmod 777 database
```

### Erreur "Class not found"
```bash
composer dump-autoload
```

### Les routes ne fonctionnent pas
Vérifier que mod_rewrite est activé dans Apache :
```bash
a2enmod rewrite
service apache2 restart
```

## Contribution

Voir [CONTRIBUTING.md](../CONTRIBUTING.md) à la racine du projet.

## Statut

✅ **Fonctionnel** - L'API est complètement opérationnelle avec :
- [x] Inscription utilisateur
- [x] Connexion avec JWT
- [x] Vérification du profil
- [x] Déconnexion
- [x] Base de données SQLite
- [x] Tests unitaires
- [x] Dockerfile
- [x] Documentation API

## Prochaines améliorations
- [ ] Refresh tokens
- [ ] Blacklist de tokens
- [ ] Rate limiting
- [ ] Validation email
- [ ] Reset password
- [ ] Admin endpoints (gérer les utilisateurs)
- [ ] Logs d'audit
