# Tests - Tests d'intégration globaux

## Description
Ce dossier contient les tests d'intégration globaux qui testent l'interaction entre les différents microservices.

## Types de tests

### 1. Tests d'intégration
Tests qui vérifient la communication entre les services :
- Frontend → Auth API
- Frontend → Product API
- Auth API → Base de données
- Product API → Base de données
- Vérification des tokens JWT entre services

### 2. Tests end-to-end (E2E)
Tests complets du parcours utilisateur :
- Inscription d'un utilisateur
- Connexion
- Navigation
- Création/modification/suppression de produits
- Déconnexion

### 3. Tests de performance
- Tests de charge
- Tests de stress
- Temps de réponse
- Scalabilité

### 4. Tests de sécurité
- Tests d'authentification
- Tests d'autorisation
- Tentatives d'accès non autorisé
- Validation des tokens JWT
- Tests d'injection SQL

## Technologies prévues

### Tests E2E
- **Cypress** ou **Playwright** - Tests frontend complets
- **Selenium** - Alternative pour tests navigateur

### Tests API
- **Postman/Newman** - Tests automatisés des APIs
- **REST Assured** - Tests d'API
- **Supertest** - Tests Node.js

### Tests de performance
- **Apache JMeter**
- **k6**
- **Artillery**

### Tests de sécurité
- **OWASP ZAP**
- **Burp Suite**

## Structure prévue

```
tests/
├── e2e/                      # Tests end-to-end
│   ├── auth.spec.js
│   ├── products.spec.js
│   └── navigation.spec.js
├── integration/              # Tests d'intégration
│   ├── auth-api.test.js
│   ├── product-api.test.js
│   └── jwt-validation.test.js
├── performance/              # Tests de performance
│   ├── load-test.js
│   └── stress-test.js
├── security/                 # Tests de sécurité
│   ├── auth-security.test.js
│   └── api-security.test.js
├── fixtures/                 # Données de test
│   └── test-data.json
└── utils/                    # Utilitaires de test
    └── helpers.js
```

## Scénarios de tests E2E

### Scénario 1 : Inscription et connexion
1. Ouvrir la page d'inscription
2. Remplir le formulaire (username, email, password)
3. Soumettre le formulaire
4. Vérifier la redirection
5. Se connecter avec les credentials
6. Vérifier la présence du token JWT
7. Vérifier l'accès à la page d'accueil

### Scénario 2 : Gestion des produits (Admin)
1. Se connecter en tant qu'admin
2. Accéder à la page produits
3. Créer un nouveau produit
4. Vérifier la création
5. Modifier le produit
6. Vérifier la modification
7. Supprimer le produit
8. Vérifier la suppression

### Scénario 3 : Accès non autorisé
1. Se connecter en tant qu'utilisateur normal
2. Tenter de créer un produit
3. Vérifier le message d'erreur 403
4. Vérifier que le produit n'a pas été créé

## Exécution des tests

### Tests unitaires (dans chaque service)

```bash
# Frontend
cd frontend
npm test

# Auth API
cd auth-api
composer test

# Product API
cd product-api
npm test  # ou pytest
```

### Tests d'intégration globaux

```bash
# Démarrer tous les services
docker-compose up -d

# Attendre que les services soient prêts
./wait-for-services.sh

# Exécuter les tests
cd tests
npm test

# Tests E2E avec Cypress
npx cypress run

# Tests de performance
npm run test:performance
```

### Dans le pipeline CI/CD

Les tests sont exécutés automatiquement :
1. Tests unitaires à chaque commit
2. Tests d'intégration à chaque PR
3. Tests E2E avant déploiement
4. Tests de performance hebdomadaires

## Configuration

### Variables d'environnement (.env.test)

```env
# URLs des services en test
FRONTEND_URL=http://localhost:3000
AUTH_API_URL=http://localhost:8080
PRODUCT_API_URL=http://localhost:5000

# Credentials de test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=Admin123!
```

### Cypress (exemple)

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      apiUrl: 'http://localhost:8080',
      productApiUrl: 'http://localhost:5000'
    },
    video: true,
    screenshot: true
  }
}
```

## Couverture de code

Objectif : **80% minimum** de couverture pour chaque service.

```bash
# Générer le rapport de couverture
npm run test:coverage

# Voir le rapport
open coverage/index.html
```

## Rapports de tests

Les rapports de tests sont générés automatiquement :
- Résultats des tests unitaires
- Résultats des tests E2E (vidéos, screenshots)
- Rapport de couverture de code
- Rapport de performance

## Bonnes pratiques

1. **Isolement** - Chaque test doit être indépendant
2. **Nettoyage** - Nettoyer les données de test après exécution
3. **Données de test** - Utiliser des fixtures réutilisables
4. **Assertions claires** - Messages d'erreur explicites
5. **Fast feedback** - Tests rapides pour feedback immédiat
6. **Flaky tests** - Éviter les tests instables

## À développer
- [ ] Configuration Cypress/Playwright
- [ ] Scénarios de tests E2E
- [ ] Tests d'intégration entre services
- [ ] Tests de performance avec k6
- [ ] Tests de sécurité automatisés
- [ ] Fixtures et données de test
- [ ] Scripts de lancement des tests
- [ ] Intégration dans le pipeline CI/CD
