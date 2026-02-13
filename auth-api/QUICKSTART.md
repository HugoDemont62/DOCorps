# Démarrage Rapide - Auth API

## 🚀 Option 1 : Avec Docker (Recommandé)

C'est la méthode la plus simple si vous avez Docker installé :

```bash
# Depuis le dossier auth-api
docker build -t auth-api .
docker run -p 8080:80 -v ${PWD}/database:/var/www/html/database auth-api

# Ou depuis la racine du projet avec docker-compose
cd ..
docker-compose up auth-api
```

L'API sera accessible sur `http://localhost:8080`

## 🔧 Option 2 : Installation locale

### Prérequis
- PHP 8.1 ou supérieur
- Composer
- Extension SQLite pour PHP

### Étapes

1. **Installer Composer** (si pas déjà installé)
   - Télécharger depuis https://getcomposer.org/download/
   - Ou sur Windows : `winget install Composer.Composer`

2. **Installer les dépendances**
   ```bash
   composer install
   ```

3. **Lancer le serveur de développement**
   ```bash
   php -S localhost:8080 -t public
   ```

L'API sera accessible sur `http://localhost:8080`

## ✅ Tester l'API

### 1. Health Check
```bash
curl http://localhost:8080/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "service": "auth-api",
  "timestamp": "2026-02-13 12:30:00"
}
```

### 2. Créer un compte
```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john\",\"email\":\"john@test.com\",\"password\":\"password123\"}"
```

### 3. Se connecter
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@test.com\",\"password\":\"password123\"}"
```

Vous recevrez un token JWT. Copiez-le !

### 4. Accéder au profil
```bash
curl http://localhost:8080/api/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## 🧪 Lancer les tests

```bash
# Avec Composer
composer test

# Avec PHPUnit directement
vendor/bin/phpunit

# Avec couverture de code
composer test:coverage
```

## 🔍 Vérifier que tout fonctionne

Après le démarrage, vous devriez voir :
- ✅ Le dossier `database/auth.db` créé automatiquement
- ✅ Les tables créées dans la base SQLite
- ✅ L'API répond sur les endpoints

## 📝 Prochaines étapes

1. Tester tous les endpoints avec Postman ou curl
2. Vérifier les tests unitaires
3. Intégrer avec le frontend React
4. Configurer le pipeline CI/CD

## 🐛 Problèmes courants

**"composer: command not found"**
→ Installer Composer : https://getcomposer.org/

**"Class not found"**
→ Exécuter : `composer dump-autoload`

**"Permission denied" sur database/**
→ Exécuter : `chmod 777 database/`

**Les routes ne fonctionnent pas**
→ Vérifier que vous êtes bien dans le dossier `public/` ou utiliser Docker
