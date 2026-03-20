# Tests — Intégration & Unitaires

## Vue d'ensemble

| Service | Fichier | Framework | Tests | Commande |
|---------|---------|-----------|-------|---------|
| Frontend | `src/__tests__/*.test.*` | Vitest + Testing Library | 28 | `cd frontend && npm test` |
| Product API | `product-api/tests/test_products.py` | Pytest | 10 | voir ci-dessous |
| Auth API | `auth-api/tests/*.php` | PHPUnit | 8 | voir ci-dessous |
| Intégration | `tests/test_integration.py` | Pytest + requests | 12 | voir ci-dessous |

---

## Tests unitaires

### Frontend (Vitest)
```bash
cd frontend
npm install
npm test               # run une fois
npm run test:watch     # mode watch
npm run test:coverage  # avec rapport de couverture
```

Fichiers de test :
- `tokenStorage.test.js` — stockage JWT (sessionStorage)
- `authApi.test.js` — service API Auth (axios mocké)
- `AuthContext.test.jsx` — contexte login/logout/fetchMe
- `Login.test.jsx` — formulaire de connexion
- `Home.test.jsx` — page d'accueil

### Product API (Pytest via Docker)
```bash
docker run --rm \
  -v "$(pwd)/product-api:/app" -w /app \
  python:3.11-slim \
  sh -c "pip install -r requirements.txt -q && pytest tests/ -v"
```

### Auth API (PHPUnit via Docker)
```bash
docker run --rm \
  -v "$(pwd)/auth-api:/app" -w /app \
  php:8.1-cli \
  sh -c "apt-get install -y zip unzip sqlite3 libsqlite3-dev -qq \
    && docker-php-ext-install pdo pdo_sqlite \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install -q \
    && vendor/bin/phpunit"
```

---

## Tests d'intégration

Nécessitent que les services soient démarrés :

```bash
# 1. Démarrer les services
docker compose up -d auth-api product-api postgres

# 2. Lancer les tests
docker run --rm \
  --network devopscorp-network \
  -v "$(pwd)/tests:/tests" \
  -e AUTH_API_URL=http://devopscorp-auth-api:80 \
  -e PRODUCT_API_URL=http://devopscorp-product-api:5000 \
  python:3.11-slim \
  sh -c "pip install requests pytest -q && pytest /tests/test_integration.py -v"
```

### Scénarios couverts
- ✅ Health checks Auth API et Product API
- ✅ Register, login, me, duplicate email
- ✅ Liste produits (auth requise), création (admin only)
- ✅ Token Auth API accepté par Product API (JWT_SECRET partagé)

> Les tests sont **skipés automatiquement** si un service est indisponible — ils ne cassent pas la CI unitaire.
