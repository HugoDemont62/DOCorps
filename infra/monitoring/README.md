# Monitoring — Prometheus + Grafana

## Ce qui est en place

```
monitoring/
├── prometheus.yml                              # Config scraping Prometheus
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── prometheus.yml                  # Datasource Prometheus (uid: prometheus)
        └── dashboards/
            ├── dashboard.yml                   # Provider fichiers JSON
            └── devopscorp-health.json          # Dashboard « Santé des services »
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
| `product-api` | product-api:5000 | `/metrics` (instrumentation HTTP FastAPI) |
| `auth-api` | auth-api:80 | `/metrics` (métrique `auth_api_up`) |
| `frontend` | frontend:3000 | `/metrics` (Vite : plugin ; prod Nginx : `location /metrics`) |

Vérifier que les targets sont UP : http://localhost:9090/targets

**Frontend DOWN (`connection refused` sur `:3000`)** : le `docker-compose` doit construire le stage **Vite** (`build.target: dev`). Si l’image est uniquement **Nginx** (dernier stage du Dockerfile), le service écoute sur le **port 80** dans le conteneur : il faudrait alors cibler `frontend:80` dans `prometheus.yml` (et adapter le mapping de ports dans Compose).

### Grafana : dashboard en « No data » alors que Prometheus est OK

Souvent la **datasource Grafana** ne correspond pas à celle attendue par le dashboard (nom / UID différent d’une ancienne config).

1. **Vérifier Explore** : menu **Explore** → datasource **Prometheus** → requête `up` → tu dois voir des séries. Sinon, corriger l’URL (`http://prometheus:9090` dans la config provisionnée) et le réseau Docker.
2. **Nom exact** : la datasource provisionnée doit s’appeler **`Prometheus`** (avec cette casse). Le dashboard JSON référence ce nom.
3. **Réinitialiser la base Grafana** (si tu avais créé Prometheus à la main avant le provisioning) :
   ```bash
   docker compose stop grafana
   docker volume rm devopscorp-grafana-data
   docker compose up -d grafana
   ```
   Les fichiers dans `grafana/provisioning/` recréent alors la datasource avec l’`uid` défini dans `datasources/prometheus.yml`.

## Grafana — Dashboard « DevOpsCorp — Santé des services »

Un dashboard est **provisionné automatiquement** (fichier `dashboards/devopscorp-health.json`) :

1. Ouvrir http://localhost:3001 → **Dashboards**
2. Ouvrir **DevOpsCorp — Santé des services** (uid `devopscorp-health`)

Il affiche : état `up` par job (frontend, auth-api, product-api, prometheus), métriques `auth_api_up` / `frontend_up`, débit HTTP sur la Product API (`http_requests_total`), et la durée des scrapes.

Après ajout ou modification du JSON : `docker compose restart grafana` (ou recréer le conteneur). Si la datasource ne se lie pas, vérifier que le datasource **Prometheus** a bien l’uid **`prometheus`** (défini dans `datasources/prometheus.yml`).

### Autres dashboards

**Dashboards → Import** : ID communautaire (ex. Node Exporter `1860`) et datasource **Prometheus**.

## Variables d'environnement

Configurer dans `.env` pour changer les identifiants Grafana :
```env
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=votre-mot-de-passe
```
