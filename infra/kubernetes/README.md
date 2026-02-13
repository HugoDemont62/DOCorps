# Kubernetes - Orchestration (Optionnel)

## Description
Manifests Kubernetes pour l'orchestration avancée de l'application (optionnel si Docker Compose ne suffit pas).

## Objectifs
- Déploiement scalable de l'application
- Gestion automatique des réplicas
- Load balancing automatique
- Self-healing
- Rolling updates

## Structure prévue

```
kubernetes/
├── namespaces/
│   └── devopscorp.yml
├── deployments/
│   ├── frontend.yml
│   ├── auth-api.yml
│   └── product-api.yml
├── services/
│   ├── frontend-svc.yml
│   ├── auth-api-svc.yml
│   └── product-api-svc.yml
├── configmaps/
├── secrets/
├── ingress/
│   └── ingress.yml
└── kustomization.yml
```

## Ressources Kubernetes

### Deployments
- Frontend (replicas: 2+)
- Auth API (replicas: 2+)
- Product API (replicas: 2+)

### Services
- Type LoadBalancer ou NodePort
- Exposition des services

### Ingress
- Routing HTTP/HTTPS
- Certificats SSL (Let's Encrypt)
- Reverse proxy

### ConfigMaps & Secrets
- Variables d'environnement
- Configuration applicative
- Secrets (DB passwords, JWT keys...)

## Utilisation

```bash
# Appliquer tous les manifests
kubectl apply -f kubernetes/

# Vérifier les déploiements
kubectl get deployments
kubectl get pods
kubectl get services

# Logs d'un pod
kubectl logs <pod-name>

# Scaler une application
kubectl scale deployment frontend --replicas=3

# Rolling update
kubectl set image deployment/frontend frontend=devopscorp/frontend:v2
```

## Environnements de test

### Local
- **Minikube** - Cluster local
- **Kind** - Kubernetes in Docker
- **Docker Desktop** - K8s intégré

### Cloud
- **GKE** (Google Kubernetes Engine)
- **EKS** (AWS)
- **AKS** (Azure)

## Bonnes pratiques
- Namespaces par environnement
- Resource limits et requests
- Health checks (liveness, readiness)
- Horizontal Pod Autoscaler
- Network policies
- RBAC pour la sécurité

## À développer
- [ ] Choix de l'environnement K8s
- [ ] Manifests de déploiement
- [ ] Configuration des services
- [ ] Ingress controller
- [ ] Secrets management
- [ ] Monitoring avec Prometheus Operator
