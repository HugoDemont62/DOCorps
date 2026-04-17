# Frontend — Application React (DevOpsCorp)

Interface utilisateur du projet fil rouge : **React + Vite**, navigation par **React Router**, appels HTTP avec **Axios** vers l’API Auth (PHP) et l’API produits (Python/FastAPI).

## URLs

| Environnement | URL |
|---|---|
| Local (`npm run dev`) | <http://localhost:3000> |
| Production (Render) | <https://docorps-frontend.onrender.com/> |

## Fonctionnalités

| Page | Description |
|------|-------------|
| `/login` | Connexion (`POST /api/login`) — JWT stocké en **sessionStorage** |
| `/register` | Inscription (`POST /api/register`) puis connexion automatique |
| `/` | Accueil (utilisateur connecté) |
| `/produits` | Liste des produits (`GET /products`) ; CRUD **admin** uniquement (`POST/PUT/DELETE`) |

Le JWT émis par l’API Auth est envoyé en `Authorization: Bearer` vers l’API produits (même secret `JWT_SECRET` dans Docker Compose).

## Prérequis

- Node.js 20+
- APIs Auth (`:8080`) et Produits (`:5000`) joignables depuis le navigateur

## Configuration

Copier `.env.example` vers `.env` et ajuster si besoin :

```env
VITE_AUTH_API_URL=http://localhost:8080
VITE_PRODUCT_API_URL=http://localhost:5000
```

Ces URLs sont celles **vues par le navigateur** (souvent `localhost` en local). En déploiement, utiliser les domaines publics des APIs.

## Commandes

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # sortie dans dist/
npm run lint
```

## Docker

Avec le dépôt racine :

```bash
docker compose up --build
```

Le frontend est exposé sur le port **3000**. Les variables `VITE_*` dans `docker-compose.yml` doivent rester cohérentes avec l’URL d’accès (ex. `localhost`).

## Rôle admin (CRUD produits)

Par défaut, les nouveaux comptes ont le rôle `user` (lecture seule sur les produits). Pour tester le CRUD, passer un utilisateur en `admin` dans la base SQLite de l’auth (`users.role = 'admin'`) puis se reconnecter.

## Structure

```
frontend/
├── src/
│   ├── components/   # Layout (barre de navigation)
│   ├── contexts/     # AuthProvider (JWT + /api/me)
│   ├── pages/        # Login, Register, Home, Products
│   ├── services/     # authApi, productApi, tokenStorage
│   ├── App.jsx
│   └── main.jsx
├── public/
├── Dockerfile
└── vite.config.js
```
