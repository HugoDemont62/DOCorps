# Docker - Conteneurisation

## Description
Ce dossier contient les configurations Docker pour la conteneurisation de tous les services.

## Fichiers à créer

### Dockerfiles
- `Dockerfile.frontend` - Image pour le frontend React
- `Dockerfile.auth` - Image pour l'API d'authentification PHP
- `Dockerfile.product` - Image pour l'API produits
- `docker-compose.yml` - Orchestration de tous les services

### Configuration docker-compose.yml

Services prévus :
- **frontend** : Application React (port 3000)
- **auth-api** : API PHP (port 8080)
- **product-api** : API Node.js/Python (port 5000)
- **mysql** : Base de données pour auth-api
- **postgres** ou **mongodb** : Base de données pour product-api

## Réseaux Docker
- Réseau personnalisé pour la communication inter-services
- Isolation des services

## Volumes
- Persistence des données de bases de données
- Volumes pour les logs

## Variables d'environnement
Les secrets et configurations seront gérés via fichiers `.env` (non versionnés).

## Utilisation

```bash
# Construire les images
docker-compose build

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

## À développer
- [ ] Dockerfile pour chaque service
- [ ] docker-compose.yml complet
- [ ] Fichier .env.example
- [ ] Scripts de démarrage
- [ ] Configuration des réseaux et volumes
