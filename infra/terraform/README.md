# Terraform - Infrastructure as Code

## Description
Scripts Terraform pour le provisioning de l'infrastructure en production.

## Objectifs
- Provisionner des machines virtuelles
- Configurer les réseaux et groupes de sécurité
- Créer les bases de données managées
- Gérer le stockage
- Configuration reproductible et versionnée

## Providers prévus
- **AWS** (Free Tier) ou
- **Azure** (compte étudiant) ou
- **Google Cloud Platform** (crédits gratuits) ou
- **OVH**, **Scaleway**, **DigitalOcean**

## Structure prévue

```
terraform/
├── main.tf           # Configuration principale
├── variables.tf      # Variables d'entrée
├── outputs.tf        # Outputs (IPs, URLs...)
├── providers.tf      # Configuration des providers
├── modules/          # Modules réutilisables
│   ├── network/
│   ├── compute/
│   └── database/
└── environments/     # Configurations par environnement
    ├── dev/
    ├── test/
    └── prod/
```

## Ressources à créer
- Instances de calcul (VM ou conteneurs)
- Load Balancer
- Bases de données
- Stockage objet
- Réseaux virtuels et sous-réseaux
- Règles de firewall/sécurité

## Utilisation

```bash
# Initialiser Terraform
terraform init

# Planifier les changements
terraform plan

# Appliquer la configuration
terraform apply

# Détruire l'infrastructure
terraform destroy
```

## Bonnes pratiques
- Utiliser des variables pour les valeurs sensibles
- State file stocké en remote (S3, Azure Blob...)
- Modules réutilisables
- Documentation des ressources
- Tagging cohérent des ressources

## À développer
- [ ] Choix du cloud provider
- [ ] Configuration du backend (state remote)
- [ ] Scripts de provisioning
- [ ] Modules réutilisables
- [ ] Variables et secrets
- [ ] Documentation d'utilisation
