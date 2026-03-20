# Monitoring — Prometheus + Grafana

## Ce qui est en place

```
monitoring/
├── prometheus.yml                              # Config scraping Prometheus
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── prometheus.yml                  # Datasource auto-provisionnée
        └── dashboards/
            └── dashboard.yml                   # Config auto-provisioning dashboards
```

## Accès

| Service | URL | Identifiants |
|---------|-----|-------------|
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | admin / admin |

## Démarrage

```bash
# Depuis la racine du projet
docker compose up -d prometheus grafana

# Ou avec tous les services
docker compose up -d
```

## Prometheus — Targets surveillées

| Job | Target | Endpoint |
|-----|--------|---------|
| `prometheus` | localhost:9090 | `/metrics` |
| `product-api` | product-api:5000 | `/metrics` |
| `auth-api` | auth-api:80 | `/health` |
| `frontend` | frontend:3000 | `/health` |

Vérifier que les targets sont UP : http://localhost:9090/targets

## Grafana — Ajouter un dashboard

1. Ouvrir http://localhost:3001
2. Se connecter (admin / admin)
3. **Dashboards → Import**
4. Coller l'ID d'un dashboard communautaire (ex: `1860` pour Node Exporter)
5. Sélectionner la datasource **Prometheus**

La datasource Prometheus est automatiquement configurée au démarrage.

## Variables d'environnement

Configurer dans `.env` pour changer les identifiants Grafana :
```env
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=votre-mot-de-passe
```
